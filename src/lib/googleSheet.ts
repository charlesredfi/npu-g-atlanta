export type SheetSubmission = {
  formType: string;
  name: string;
  email: string;
  neighborhood?: string;
  message?: string;
  request?: string;
};

/**
 * Appends a contact/newsletter row via the Apps Script web app bound to:
 * https://docs.google.com/spreadsheets/d/10EnJmCHU2SI6VbLMNUgEzksnZRUDCj_xczr1fByXnEQ
 *
 * Apps Script /exec endpoints redirect POST→GET and break doPost from Vercel.
 * We send fields as query params to doGet, which Apps Script handles correctly.
 *
 * Requires GOOGLE_SHEETS_WEBHOOK_URL in the environment.
 */
export async function appendToGoogleSheet(entry: SheetSubmission) {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL?.trim();
  if (!webhookUrl) return { ok: false as const, skipped: true as const };

  const params = new URLSearchParams({
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
      `Google Sheet append failed (${response.status}): ${raw.slice(0, 200)}`,
    );
  }

  let parsed: { ok?: boolean; error?: string } = {};
  try {
    parsed = JSON.parse(raw) as typeof parsed;
  } catch {
    throw new Error(
      `Google Sheet webhook did not return JSON. Update/redeploy the Apps Script (new version) from scripts/google-sheet-webhook.gs. Response: ${raw.slice(0, 120)}`,
    );
  }

  if (!parsed.ok) {
    throw new Error(
      `Google Sheet append rejected: ${parsed.error || "unknown error"}`,
    );
  }

  return { ok: true as const, skipped: false as const };
}
