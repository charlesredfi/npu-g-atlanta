export type SheetSubmission = {
  formType: string;
  name: string;
  email: string;
  neighborhood?: string;
  message?: string;
  request?: string;
};

function sheetPayload(entry: SheetSubmission) {
  return JSON.stringify({
    formType: entry.formType,
    name: entry.name,
    email: entry.email,
    neighborhood: entry.neighborhood || "",
    message: entry.message || entry.request || "",
  });
}

async function postToAppsScript(url: string, body: string) {
  // Apps Script web apps respond with a 302. If fetch auto-follows, the
  // redirect becomes a GET and doPost never runs (false success).
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body,
    redirect: "manual",
  });

  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get("location");
    if (!location) {
      throw new Error("Google Sheet webhook redirected without a Location header.");
    }
    return fetch(location, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body,
      redirect: "follow",
    });
  }

  return response;
}

/**
 * Appends a contact/newsletter row via the Apps Script web app bound to:
 * https://docs.google.com/spreadsheets/d/10EnJmCHU2SI6VbLMNUgEzksnZRUDCj_xczr1fByXnEQ
 *
 * Requires GOOGLE_SHEETS_WEBHOOK_URL in the environment.
 */
export async function appendToGoogleSheet(entry: SheetSubmission) {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL?.trim();
  if (!webhookUrl) return { ok: false as const, skipped: true as const };

  const body = sheetPayload(entry);
  const response = await postToAppsScript(webhookUrl, body);
  const raw = await response.text();

  if (!response.ok) {
    throw new Error(`Google Sheet append failed (${response.status}): ${raw.slice(0, 200)}`);
  }

  let parsed: { ok?: boolean; error?: string } = {};
  try {
    parsed = JSON.parse(raw) as typeof parsed;
  } catch {
    throw new Error(
      `Google Sheet webhook did not return JSON. Redeploy the Apps Script web app and confirm GOOGLE_SHEETS_WEBHOOK_URL ends with /exec. Response: ${raw.slice(0, 120)}`,
    );
  }

  if (!parsed.ok) {
    throw new Error(
      `Google Sheet append rejected: ${parsed.error || "unknown error"}`,
    );
  }

  return { ok: true as const, skipped: false as const };
}
