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
 * Requires GOOGLE_SHEETS_WEBHOOK_URL in the environment.
 */
export async function appendToGoogleSheet(entry: SheetSubmission) {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL?.trim();
  if (!webhookUrl) return { ok: false as const, skipped: true as const };

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      formType: entry.formType,
      name: entry.name,
      email: entry.email,
      neighborhood: entry.neighborhood || "",
      message: entry.message || entry.request || "",
    }),
    // Apps Script web apps sometimes need a follow redirect after POST.
    redirect: "follow",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Google Sheet append failed: ${detail.slice(0, 200)}`);
  }

  return { ok: true as const, skipped: false as const };
}
