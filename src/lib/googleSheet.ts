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
 * Appends a row via Apps Script web app:
 * https://docs.google.com/spreadsheets/d/10EnJmCHU2SI6VbLMNUgEzksnZRUDCj_xczr1fByXnEQ
 *
 * newsletter → physical tab "newsletter"
 * contact/merch → physical tab "inquiry"
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
    tab,
    formType: entry.formType,
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
    version?: string;
    sheet?: string;
    tab?: string;
    sheetId?: number;
    allTabs?: string;
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

  if (
    parsed.version !== "physical-tabs-v3" &&
    parsed.version !== "physical-tabs-v4"
  ) {
    throw new Error(
      `Google Sheet webhook is running an old script (version '${parsed.version || "unknown"}'). In Apps Script: paste latest google-sheet-webhook.gs, then Deploy → Manage deployments → pencil → New version → Deploy. Response keys: ${Object.keys(parsed).join(", ")}`,
    );
  }

  // Verify the PHYSICAL sheet name from Apps Script, not just our intended tab.
  const actualSheet = String(parsed.sheet || "").toLowerCase();
  if (!actualSheet) {
    throw new Error(
      "Google Sheet webhook did not return the physical sheet name. Redeploy scripts/google-sheet-webhook.gs as a New version.",
    );
  }
  if (actualSheet !== tab) {
    throw new Error(
      `Google Sheet wrote to physical tab '${parsed.sheet}' (id ${parsed.sheetId}) but expected '${tab}'. Tabs: ${parsed.allTabs || "unknown"}. Redeploy the Apps Script New version.`,
    );
  }

  return {
    ok: true as const,
    skipped: false as const,
    tab,
    sheet: parsed.sheet || tab,
    sheetId: parsed.sheetId,
    version: parsed.version,
  };
}
