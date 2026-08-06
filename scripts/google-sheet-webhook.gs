/**
 * NPU-G forms → ONE Google spreadsheet, TWO tabs
 *
 * Tab names (exact, lowercase preferred):
 *   inquiry     ← contact + merch
 *   newsletter  ← newsletter signups
 *
 * Website sends a single query param:
 *   ?data=<url-encoded JSON>
 * Example JSON:
 *   {"tab":"newsletter","formType":"newsletter","name":"...","email":"..."}
 *
 * SETUP (required after every code change):
 * 1. Sheet → Extensions → Apps Script
 * 2. Delete all code, paste this file, Save
 * 3. Dropdown → ensureTabsAndHeaders → Run (allow permissions)
 * 4. Deploy → Manage deployments → pencil → New version → Deploy
 *    Keep the SAME /exec URL in Vercel
 */

var SPREADSHEET_ID = "10EnJmCHU2SI6VbLMNUgEzksnZRUDCj_xczr1fByXnEQ";

var HEADERS = [
  "Timestamp",
  "Tab",
  "Type",
  "Name",
  "Email",
  "Neighborhood",
  "Message",
];

function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function listTabNames(ss) {
  var sheets = ss.getSheets();
  var names = [];
  for (var i = 0; i < sheets.length; i++) {
    names.push(sheets[i].getName());
  }
  return names.join(" | ");
}

function resolveTabName(raw) {
  var value = String(raw || "")
    .toLowerCase()
    .replace(/^\s+|\s+$/g, "");
  if (value === "newsletter" || value.indexOf("newsletter") !== -1) {
    return "newsletter";
  }
  if (
    value === "inquiry" ||
    value === "inquiries" ||
    value === "contact" ||
    value === "merch" ||
    value.indexOf("inquir") !== -1
  ) {
    return "inquiry";
  }
  return "";
}

function getOrCreateTab(ss, tabName) {
  var sheets = ss.getSheets();
  var i;

  // 1) Exact case-insensitive match
  for (i = 0; i < sheets.length; i++) {
    if (String(sheets[i].getName()).toLowerCase() === tabName) {
      return sheets[i];
    }
  }

  // 2) Create exact lowercase tab name
  try {
    return ss.insertSheet(tabName);
  } catch (err) {
    sheets = ss.getSheets();
    for (i = 0; i < sheets.length; i++) {
      if (String(sheets[i].getName()).toLowerCase() === tabName) {
        return sheets[i];
      }
    }
    throw new Error(
      "Could not open/create tab '" +
        tabName +
        "'. Existing: " +
        listTabNames(ss) +
        ". Details: " +
        err,
    );
  }
}

function writeHeaders_(sheet) {
  var firstCell = sheet.getRange(1, 1).getValue();
  if (String(firstCell) !== "Timestamp") {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
  }
}

function parseRequestData(e) {
  var params = e && e.parameter ? e.parameter : {};
  var data = {};

  // Preferred: single JSON blob (avoids lost/partial query params)
  if (params.data) {
    try {
      data = JSON.parse(params.data);
    } catch (err) {
      throw new Error("Invalid data JSON: " + err);
    }
  } else {
    data = params;
  }

  return data;
}

function writeRow(data) {
  var formType = String(data.formType || data.type || "");
  var tabName =
    resolveTabName(data.tab) ||
    resolveTabName(formType) ||
    resolveTabName(data.request);

  if (!tabName) {
    throw new Error(
      "Missing tab/formType. Refusing to write. Received keys: " +
        Object.keys(data || {}).join(","),
    );
  }

  var ss = getSpreadsheet();
  var sheet = getOrCreateTab(ss, tabName);
  writeHeaders_(sheet);

  sheet.appendRow([
    new Date(),
    tabName,
    formType,
    data.name || "",
    data.email || "",
    data.neighborhood || "",
    data.message || data.request || "",
  ]);

  return ContentService.createTextOutput(
    JSON.stringify({
      ok: true,
      spreadsheet: ss.getName(),
      sheet: sheet.getName(),
      tab: tabName,
      formType: formType,
      allTabs: listTabNames(ss),
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
    return writeRow(parseRequestData(e));
  } catch (err) {
    return errorResponse(err);
  }
}

function doPost(e) {
  try {
    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      data = parseRequestData(e);
    }
    return writeRow(data);
  } catch (err) {
    return errorResponse(err);
  }
}

/** Run THIS from the editor dropdown (not other functions). */
function ensureTabsAndHeaders() {
  var ss = getSpreadsheet();
  Logger.log("Spreadsheet: " + ss.getName());
  Logger.log("Tabs before: " + listTabNames(ss));

  var inquiry = getOrCreateTab(ss, "inquiry");
  var newsletter = getOrCreateTab(ss, "newsletter");
  writeHeaders_(inquiry);
  writeHeaders_(newsletter);

  Logger.log("inquiry -> " + inquiry.getName());
  Logger.log("newsletter -> " + newsletter.getName());
  Logger.log("Tabs after: " + listTabNames(ss));
}
