/**
 * NPU-G forms → Google Sheet webhook (two tabs in ONE spreadsheet)
 *
 * Expected tab names (same document):
 *   - inquiry     ← Contact Us + merch
 *   - newsletter  ← Subscribe popup + News subscribe
 *
 * The website sends ?tab=inquiry|newsletter&formType=...
 *
 * AFTER PASTING THIS FILE:
 * 1. Extensions → Apps Script → replace all code with this file
 * 2. Deploy → Manage deployments → pencil → Version: New version → Deploy
 * 3. Do NOT create a brand-new deployment (that changes the URL)
 * 4. Keep the same /exec URL in Vercel as GOOGLE_SHEETS_WEBHOOK_URL
 *
 * Optional: select ensureTabsAndHeaders → Run (once) to create both tabs.
 */

var HEADERS = [
  "Timestamp",
  "Type",
  "Name",
  "Email",
  "Neighborhood",
  "Message",
];

function normalizeTabName(value) {
  var raw = String(value || "")
    .toLowerCase()
    .replace(/^\s+|\s+$/g, "");
  if (raw === "newsletter" || raw === "newsletters") return "newsletter";
  if (
    raw === "inquiry" ||
    raw === "inquiries" ||
    raw === "contact" ||
    raw === "merch"
  ) {
    return "inquiry";
  }
  return "";
}

function tabForSubmission(data) {
  // Prefer explicit tab from the website, then formType.
  var fromTab = normalizeTabName(data.tab);
  if (fromTab) return fromTab;

  var fromType = normalizeTabName(data.formType || data.type);
  if (fromType) return fromType;

  return "inquiry";
}

/** Find a sheet by name, case-insensitive. Create it if missing. */
function getOrCreateSheet(preferredName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets();
  var target = String(preferredName).toLowerCase();

  for (var i = 0; i < sheets.length; i++) {
    if (String(sheets[i].getName()).toLowerCase() === target) {
      return sheets[i];
    }
  }

  return ss.insertSheet(preferredName);
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
  var tabName = tabForSubmission(data);
  var sheet = getOrCreateSheet(tabName);
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
    JSON.stringify({
      ok: true,
      sheet: sheet.getName(),
      tab: tabName,
      formType: formType,
    }),
  ).setMimeType(ContentService.MimeType.JSON);
}

function errorResponse(err) {
  return ContentService.createTextOutput(
    JSON.stringify({ ok: false, error: String(err) }),
  ).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  try {
    var data = e && e.parameter ? e.parameter : {};
    return writeRow(data);
  } catch (err) {
    return errorResponse(err);
  }
}

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

/** Run once from the Apps Script editor to create inquiry + newsletter tabs. */
function ensureTabsAndHeaders() {
  ensureHeaderRow(getOrCreateSheet("inquiry"));
  ensureHeaderRow(getOrCreateSheet("newsletter"));
}
