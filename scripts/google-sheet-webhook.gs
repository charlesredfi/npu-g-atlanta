/**
 * NPU-G forms → Google Sheet webhook (two tabs in ONE spreadsheet)
 *
 * Tabs:
 *   - inquiry     ← Contact Us + merch
 *   - newsletter  ← Subscribe popup + News subscribe
 *
 * IMPORTANT: In the Apps Script editor, run ONLY:
 *   ensureTabsAndHeaders
 * Do NOT run ensureHeaderRow / getOrCreateSheet / doGet from the dropdown.
 */

var SPREADSHEET_ID = "10EnJmCHU2SI6VbLMNUgEzksnZRUDCj_xczr1fByXnEQ";

var HEADERS = [
  "Timestamp",
  "Type",
  "Name",
  "Email",
  "Neighborhood",
  "Message",
];

function getSpreadsheet() {
  try {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (err) {
    throw new Error(
      "Cannot open spreadsheet " +
        SPREADSHEET_ID +
        ". Open this script from that Sheet (Extensions → Apps Script) and allow Sheets permission. Details: " +
        err,
    );
  }
}

function listTabNames(ss) {
  var sheets = ss.getSheets();
  var names = [];
  for (var i = 0; i < sheets.length; i++) {
    names.push(sheets[i].getName());
  }
  return names.join(", ");
}

function findSheetByName_(ss, name) {
  var target = String(name).toLowerCase();
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    if (String(sheets[i].getName()).toLowerCase() === target) {
      return sheets[i];
    }
  }
  return null;
}

function getOrCreateSheet(preferredName) {
  var ss = getSpreadsheet();
  var existing = findSheetByName_(ss, preferredName);
  if (existing) return existing;

  try {
    var created = ss.insertSheet(String(preferredName));
    if (created) return created;
  } catch (err) {
    existing = findSheetByName_(ss, preferredName);
    if (existing) return existing;
    throw new Error("Could not create tab '" + preferredName + "': " + err);
  }

  existing = findSheetByName_(ss, preferredName);
  if (existing) return existing;

  throw new Error(
    "Tab '" +
      preferredName +
      "' could not be found or created. Existing tabs: " +
      listTabNames(ss),
  );
}

function writeHeaders_(sheet) {
  var firstCell = sheet.getRange(1, 1).getValue();
  if (!firstCell) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
  }
}

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
  var fromTab = normalizeTabName(data.tab);
  if (fromTab) return fromTab;
  var fromType = normalizeTabName(data.formType || data.type);
  if (fromType) return fromType;
  return "inquiry";
}

function writeRow(data) {
  var formType = data.formType || data.type || "";
  var tabName = tabForSubmission(data);
  var sheet = getOrCreateSheet(tabName);
  writeHeaders_(sheet);

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

/**
 * THIS is the function to run from the editor dropdown.
 * Approve Google Sheets access if prompted.
 */
function ensureTabsAndHeaders() {
  var ss = getSpreadsheet();
  Logger.log("Opened: " + ss.getName() + " (" + ss.getId() + ")");
  Logger.log("Existing tabs: " + listTabNames(ss));

  var tabNames = ["inquiry", "newsletter"];
  for (var i = 0; i < tabNames.length; i++) {
    var name = tabNames[i];
    var sheet = findSheetByName_(ss, name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    }
    if (!sheet) {
      throw new Error(
        "Failed to get/create tab '" +
          name +
          "'. Tabs now: " +
          listTabNames(ss),
      );
    }
    writeHeaders_(sheet);
    Logger.log("Ready: " + sheet.getName());
  }

  Logger.log("Done. Both inquiry and newsletter tabs are ready.");
}
