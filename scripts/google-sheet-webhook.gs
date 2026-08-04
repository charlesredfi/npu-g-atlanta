/**
 * NPU-G Contact Form → Google Sheet webhook
 *
 * SETUP (one time, in the Google Sheet):
 * 1. Open https://docs.google.com/spreadsheets/d/10EnJmCHU2SI6VbLMNUgEzksnZRUDCj_xczr1fByXnEQ
 * 2. Extensions → Apps Script
 * 3. Delete any placeholder code, paste THIS entire file, Save
 * 4. Deploy → New deployment → Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Deploy, copy the Web app URL
 * 6. In Vercel → Project → Settings → Environment Variables, add:
 *    GOOGLE_SHEETS_WEBHOOK_URL = <that Web app URL>
 * 7. Redeploy the site (or wait for next push)
 *
 * The script creates a header row automatically if Sheet1 is empty.
 */

var HEADERS = [
  "Timestamp",
  "Type",
  "Name",
  "Email",
  "Neighborhood",
  "Message",
];

function doPost(e) {
  try {
    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    }

    var sheet =
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1") ||
      SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
    }

    sheet.appendRow([
      new Date(),
      data.formType || data.type || "",
      data.name || "",
      data.email || "",
      data.neighborhood || "",
      data.message || data.request || "",
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({ ok: true }),
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(err) }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/** Optional: run once from the Apps Script editor to confirm headers exist. */
function ensureHeaders() {
  var sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1") ||
    SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
  }
}
