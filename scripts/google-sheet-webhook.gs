/**
 * NPU-G Contact Form → Google Sheet webhook
 *
 * After editing this script in Apps Script:
 * Deploy → Manage deployments → Edit (pencil) → New version → Deploy
 * (A brand-new URL is only needed for the first deployment.)
 */

var HEADERS = [
  "Timestamp",
  "Type",
  "Name",
  "Email",
  "Neighborhood",
  "Message",
];

function getTargetSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName("Sheet1") || ss.getSheets()[0];
}

function ensureHeaderRow(sheet) {
  var firstCell = sheet.getRange(1, 1).getValue();
  if (!firstCell) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
  }
}

function doPost(e) {
  try {
    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    }

    var sheet = getTargetSheet();
    ensureHeaderRow(sheet);

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

/** Optional smoke test from the Apps Script editor (Run → ensureHeaders). */
function ensureHeaders() {
  ensureHeaderRow(getTargetSheet());
}
