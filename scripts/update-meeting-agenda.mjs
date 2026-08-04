#!/usr/bin/env node
/**
 * Refresh NPU-G Meeting Agenda link in src/data/meeting-agenda.json.
 *
 * The City posts the monthly agenda on the second Friday before the
 * third-Thursday NPU-G meeting the following week.
 *
 * Source of truth:
 *   https://www.atlantaga.gov/.../neighborhood-and-npu-contacts
 *   → NPU-G accordion → "Agenda for {Month}" → showpublisheddocument link
 *
 * Note: atlantaga.gov is behind Akamai and often returns 403 to bots.
 * When fetch fails, the existing JSON href is left unchanged.
 *
 * Usage:
 *   node scripts/update-meeting-agenda.mjs
 *   node scripts/update-meeting-agenda.mjs --force   # skip second-Friday check
 */

import { writeFileSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OUT = resolve(ROOT, "src/data/meeting-agenda.json");

const DIRECTORY =
  "https://www.atlantaga.gov/government/departments/city-planning/neighborhood-planning-units/neighborhood-and-npu-contacts";

/** Second Friday of the current local month. */
function isSecondFriday(date = new Date()) {
  if (date.getDay() !== 5) return false;
  return Math.ceil(date.getDate() / 7) === 2;
}

function absoluteUrl(url) {
  if (url.startsWith("http")) return url;
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("/")) return `https://www.atlantaga.gov${url}`;
  return url;
}

/**
 * Pull the Agenda link from the NPU-G accordion block.
 * City markup looks like: Agenda for June … href="/home/showpublisheddocument/…"
 */
function extractNpuGAgenda(html) {
  const npuGIndex = html.search(/NPU-G\b/i);
  if (npuGIndex === -1) return null;

  const slice = html.slice(npuGIndex, npuGIndex + 25000);
  const nextNpu = slice.search(/NPU-[H-Z]\b/i);
  const block = nextNpu > 0 ? slice.slice(0, nextNpu) : slice;

  const monthMatch = block.match(/Agenda for ([A-Za-z]+)/i);
  const month = monthMatch?.[1] ?? null;

  const patterns = [
    /Agenda for [A-Za-z]+[\s\S]{0,400}?href=["']([^"']*showpublisheddocument[^"']+)["']/i,
    /href=["']([^"']*showpublisheddocument[^"']+)["'][\s\S]{0,200}?(?:January|February|March|April|May|June|July|August|September|October|November|December)/i,
    /href=["']([^"']*showpublisheddocument\/\d+[^"']*)["']/i,
  ];

  for (const pattern of patterns) {
    const match = block.match(pattern);
    if (match?.[1]) {
      return {
        href: absoluteUrl(match[1]),
        month,
      };
    }
  }

  return null;
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "en-US,en;q=0.9",
    },
    redirect: "follow",
  });
  if (!response.ok) {
    throw new Error(`${url} -> ${response.status}`);
  }
  return response.text();
}

async function findLatestAgenda(previousHref) {
  try {
    const html = await fetchText(DIRECTORY);
    const found = extractNpuGAgenda(html);
    if (found?.href) {
      return {
        href: found.href,
        month: found.month,
        source: found.month
          ? `City of Atlanta NPU-G accordion · Agenda for ${found.month}`
          : "City of Atlanta NPU-G accordion",
      };
    }
    console.warn("NPU-G agenda link not found in page HTML.");
  } catch (error) {
    console.warn(`Could not fetch City directory: ${error.message}`);
  }

  return {
    href: previousHref || DIRECTORY,
    month: null,
    source: "unchanged (fetch/scrape failed)",
  };
}

async function main() {
  const force = process.argv.includes("--force");
  if (!force && !isSecondFriday()) {
    console.log(
      "Not the second Friday; skipping. Use --force to run anyway.",
    );
    process.exit(0);
  }

  const previous = JSON.parse(readFileSync(OUT, "utf8"));
  const latest = await findLatestAgenda(previous.href);

  // Do not overwrite a good direct agenda URL with the directory fallback
  if (
    latest.source.includes("failed") &&
    previous.href.includes("showpublisheddocument")
  ) {
    console.log("Keeping existing agenda link:", previous.href);
    process.exit(0);
  }

  const next = {
    href: latest.href,
    label: "Meeting Agenda",
    note: "NPU-G Meets every Third Thursday",
    updatedAt: new Date().toISOString(),
    source: latest.source,
  };

  writeFileSync(OUT, `${JSON.stringify(next, null, 2)}\n`, "utf8");

  if (previous.href === next.href) {
    console.log("Agenda link unchanged:", next.href);
  } else {
    console.log("Agenda link updated:");
    console.log("  from:", previous.href);
    console.log("  to:  ", next.href);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
