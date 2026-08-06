export type SheetSubmission = {
  formType: string;
  name: string;
  email: string;
  neighborhood?: string;
  message?: string;
  request?: string;
};

function summarizeWebhookResponse(raw: string) {
  const title = raw.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim();
  const pre = raw.match(/<pre[^>]*>([^<]*)<\/pre>/i)?.[1]?.trim();
  const plain = raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return (
    title ||
    pre ||
    plain.slice(0, 240) ||
    "Empty response from Apps Script."
  );
}

/**
 * Appends a row via the Apps Script web app bound to:
 * https://docs.google.com/spreadsheets/d/10EnJmCHU2SI6VbLMNUgEzksnZRUDCj_xczr1fByXnEQ
 *
 * Sends one JSON `data` query param so tab routing cannot be lost:
 *   newsletter → "newsletter" tab
 *   contact / merch → "inquiry" tab
 *
 * Requires GOOGLE_SHEETS_WEBHOOK_URL.
 * After updating scripts/google-sheet-webhook.gs, redeploy Apps Script
 * (Manage deployments → New version).
 */
function tabForFormType(formType: string) {
  return formType.toLowerCase() === "newsletter" ? "newsletter" : "inquiry";
}

export async function appendToGoogleSheet(entry: SheetSubmission) {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL?.trim();
  if (!webhookUrl) return { ok: false as const, skipped: true as const };

  const tab = tabForFormType(entry.formType);
  const payload = {
    tab,
    formType: entry.formType,
    name: entry.name,
    email: entry.email,
    neighborhood: entry.neighborhood || "",
    message: entry.message || entry.request || "",
    request: entry.request || "",
  };

  const params = new URLSearchParams({
    data: JSON.stringify(payload),
    // Keep flat params too for older script versions during transition.
    tab,
    formType: entry.formType,
    name: entry.name,
    email: entry.email,
    neighborhood: entry.neighborhood || "",
    message: entry.message || entry.request || "",
  });

  const separator = webhookUrl.includes("?") ? "&" : "?";
  const response = await fetch(`${webhookUrl}${separator}${params.toString()}`, {
    method: "GET",
    redirect: "follow",
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(
      `Google Sheet append failed (${response.status}): ${summarizeWebhookResponse(raw)}`,
    );
  }

  let parsed: {
    ok?: boolean;
    error?: string;
    sheet?: string;
    tab?: string;
  } = {};
  try {
    parsed = JSON.parse(raw) as typeof parsed;
  } catch {
    throw new Error(
      `Google Sheet webhook did not return JSON. ${summarizeWebhookResponse(raw)}`,
    );
  }

  if (!parsed.ok) {
    throw new Error(
      `Google Sheet append rejected: ${parsed.error || "unknown error"}`,
    );
  }

  const writtenTab = (parsed.tab || parsed.sheet || "").toLowerCase();
  if (writtenTab && !writtenTab.includes(tab)) {
    throw new Error(
      `Google Sheet wrote to '${parsed.sheet || parsed.tab}' but expected tab '${tab}'. Redeploy scripts/google-sheet-webhook.gs as a New version.`,
    );
  }

  return {
    ok: true as const,
    skipped: false as const,
    tab: parsed.tab || tab,
    sheet: parsed.sheet || tab,
  };
}
