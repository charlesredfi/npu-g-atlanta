/**
 * NPU-G forms → ONE spreadsheet, TWO separate tabs (not one tab with labels)
 *
 * Creates/uses exact tab names:
 *   inquiry
 *   newsletter
 *
 * SETUP after paste:
 * 1. Extensions → Apps Script → replace all → Save
 * 2. Run ensureTabsAndHeaders
 * 3. Deploy → Manage deployments → New version → Deploy
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
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function listTabs(ss) {
  var sheets = ss.getSheets();
  var out = [];
  for (var i = 0; i < sheets.length; i++) {
    out.push(sheets[i].getName() + " (#" + sheets[i].getSheetId() + ")");
  }
  return out.join(" | ");
}

/** Case-insensitive find. */
function findTab(ss, wanted) {
  var target = String(wanted).toLowerCase();
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    if (String(sheets[i].getName()).toLowerCase() === target) {
      return sheets[i];
    }
  }
  return null;
}

/**
 * Get the inquiry tab or newsletter tab as a DISTINCT Sheet object.
 * Renames near-matches to the exact lowercase name so they stay separate.
 */
function getDistinctTab(ss, wanted) {
  var wantedName = wanted === "newsletter" ? "newsletter" : "inquiry";
  var sheet = findTab(ss, wantedName);

  if (!sheet) {
    sheet = ss.insertSheet(wantedName);
  }

  // Force exact tab label so it is obvious in the UI.
  if (sheet.getName() !== wantedName) {
    sheet.setName(wantedName);
  }

  // Hard check: must be the correct physical tab.
  if (String(sheet.getName()).toLowerCase() !== wantedName) {
    throw new Error(
      "Failed to select tab '" +
        wantedName +
        "'. Got '" +
        sheet.getName() +
        "'. Tabs: " +
        listTabs(ss),
    );
  }

  return sheet;
}

function ensureHeaders(sheet) {
  var first = String(sheet.getRange(1, 1).getValue() || "");
  if (first !== "Timestamp") {
    sheet.clear();
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
  }
}

function parseData(e) {
  var params = e && e.parameter ? e.parameter : {};
  if (params.data) {
    return JSON.parse(params.data);
  }
  return params;
}

function decideTab(data) {
  var blob = [
    data.tab,
    data.formType,
    data.type,
    data.request,
  ]
    .join(" ")
    .toLowerCase();

  if (blob.indexOf("newsletter") !== -1) return "newsletter";
  return "inquiry";
}

function writeRow(data) {
  var tab = decideTab(data || {});
  var formType = String(data.formType || data.type || tab);
  var ss = getSpreadsheet();

  // IMPORTANT: pick the sheet by intended tab, then verify identity.
  var sheet = getDistinctTab(ss, tab);
  var actualName = sheet.getName();
  var actualId = sheet.getSheetId();

  if (String(actualName).toLowerCase() !== tab) {
    throw new Error(
      "Refusing to write: wanted tab '" +
        tab +
        "' but sheet is '" +
        actualName +
        "'",
    );
  }

  ensureHeaders(sheet);

  // Activate + append on that sheet object only.
  ss.setActiveSheet(sheet);
  sheet.appendRow([
    new Date(),
    formType,
    data.name || "",
    data.email || "",
    data.neighborhood || "",
    data.message || data.request || "",
  ]);
  SpreadsheetApp.flush();

  return ContentService.createTextOutput(
    JSON.stringify({
      ok: true,
      tab: tab,
      sheet: actualName,
      sheetId: actualId,
      allTabs: listTabs(ss),
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
    return writeRow(parseData(e));
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
      data = parseData(e);
    }
    return writeRow(data);
  } catch (err) {
    return errorResponse(err);
  }
}

/** Run from editor once: creates two real tabs. */
function ensureTabsAndHeaders() {
  var ss = getSpreadsheet();
  Logger.log("Before: " + listTabs(ss));

  var inquiry = getDistinctTab(ss, "inquiry");
  var newsletter = getDistinctTab(ss, "newsletter");
  ensureHeaders(inquiry);
  ensureHeaders(newsletter);

  // Prove they are different sheet IDs.
  if (inquiry.getSheetId() === newsletter.getSheetId()) {
    throw new Error(
      "inquiry and newsletter resolved to the SAME sheet id. Tabs: " +
        listTabs(ss),
    );
  }

  Logger.log(
    "inquiry id=" +
      inquiry.getSheetId() +
      " name=" +
      inquiry.getName(),
  );
  Logger.log(
    "newsletter id=" +
      newsletter.getSheetId() +
      " name=" +
      newsletter.getName(),
  );
  Logger.log("After: " + listTabs(ss));
}
