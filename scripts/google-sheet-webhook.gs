/**
 * NPU-G Contact Form → Google Sheet webhook
 *
 * Tabs:
 *   - "inquiry"    ← contact + merch submissions
 *   - "newsletter" ← newsletter signups (popup + News section)
 *
 * IMPORTANT after pasting updates:
 * Deploy → Manage deployments → pencil icon → Version: New version → Deploy
 * Keep the same Web app URL in Vercel (GOOGLE_SHEETS_WEBHOOK_URL).
 */

var HEADERS = [
  "Timestamp",
  "Type",
  "Name",
  "Email",
  "Neighborhood",
  "Message",
];

function sheetNameForType(formType) {
  var type = String(formType || "").toLowerCase();
  if (type === "newsletter") return "newsletter";
  // contact, merch, and anything else land on inquiries
  return "inquiry";
}

function getTargetSheet(formType) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var name = sheetNameForType(formType);
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function ensureHeaderRow(sheet) {
  var firstCell = sheet.getRange(1, 1).getValue();
  if (!firstCell) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
  }
}

function writeRow(data) {
  var formType = data.formType || data.type || "";
  var sheet = getTargetSheet(formType);
  ensureHeaderRow(sheet);
  sheet.appendRow([
    new Date(),
    formType,
    data.name || "",
    data.email || "",
    data.neighborhood || "",
    data.message || data.request || "",
  ]);
  return ContentService.createTextOutput(
    JSON.stringify({ ok: true, sheet: sheet.getName() }),
  ).setMimeType(ContentService.MimeType.JSON);
}

function errorResponse(err) {
  return ContentService.createTextOutput(
    JSON.stringify({ ok: false, error: String(err) }),
  ).setMimeType(ContentService.MimeType.JSON);
}

/** Used by the website (Vercel cannot reliably POST through Apps Script redirects). */
function doGet(e) {
  try {
    var data = e && e.parameter ? e.parameter : {};
    return writeRow(data);
  } catch (err) {
    return errorResponse(err);
  }
}

/** Kept for manual/browser tests that POST JSON. */
function doPost(e) {
  try {
    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    }
    return writeRow(data);
  } catch (err) {
    return errorResponse(err);
  }
}

/** Optional: Run once from the Apps Script editor to create both tabs + headers. */
function ensureTabsAndHeaders() {
  ensureHeaderRow(getTargetSheet("contact"));
  ensureHeaderRow(getTargetSheet("newsletter"));
}
