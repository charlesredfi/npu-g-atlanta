/**
 * NPU-G forms -> ONE spreadsheet, TWO separate tabs
 *
 * Exact tab names:
 *   inquiry
 *   newsletter
 *
 * SETUP after paste:
 * 1. Extensions -> Apps Script -> replace all -> Save
 * 2. Run ensureTabsAndHeaders
 * 3. Deploy -> Manage deployments -> pencil -> New version -> Deploy
 *
 * Correct deploy response must include: "version":"physical-tabs-v4"
 */

var SPREADSHEET_ID = "10EnJmCHU2SI6VbLMNUgEzksnZRUDCj_xczr1fByXnEQ";
var SCRIPT_VERSION = "physical-tabs-v4";
var VISITOR_PROP = "uniqueVisitors";

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

function getDistinctTab(ss, wanted) {
  var wantedName = wanted === "newsletter" ? "newsletter" : "inquiry";
  var sheet = findTab(ss, wantedName);

  if (!sheet) {
    sheet = ss.insertSheet(wantedName);
  }

  if (sheet.getName() !== wantedName) {
    sheet.setName(wantedName);
  }

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
  var blob = [data.tab, data.formType, data.type, data.request]
    .join(" ")
    .toLowerCase();
  if (blob.indexOf("newsletter") !== -1) return "newsletter";
  return "inquiry";
}

function writeRow(data) {
  var tab = decideTab(data || {});
  var formType = String(data.formType || data.type || tab);
  var ss = getSpreadsheet();
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
      version: SCRIPT_VERSION,
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
    JSON.stringify({ ok: false, error: String(err), version: SCRIPT_VERSION }),
  ).setMimeType(ContentService.MimeType.JSON);
}

function handleVisit(shouldIncrement) {
  var props = PropertiesService.getScriptProperties();
  var count = parseInt(props.getProperty(VISITOR_PROP) || "0", 10);
  if (isNaN(count) || count < 0) count = 0;
  if (shouldIncrement) {
    count += 1;
    props.setProperty(VISITOR_PROP, String(count));
  }
  return ContentService.createTextOutput(
    JSON.stringify({
      ok: true,
      version: SCRIPT_VERSION,
      visitors: count,
    }),
  ).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  try {
    var params = e && e.parameter ? e.parameter : {};
    if (params.action === "visit") {
      return handleVisit(params.increment === "1");
    }
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

function ensureTabsAndHeaders() {
  var ss = getSpreadsheet();
  Logger.log("VERSION " + SCRIPT_VERSION);
  Logger.log("Before: " + listTabs(ss));

  var inquiry = getDistinctTab(ss, "inquiry");
  var newsletter = getDistinctTab(ss, "newsletter");
  ensureHeaders(inquiry);
  ensureHeaders(newsletter);

  if (inquiry.getSheetId() === newsletter.getSheetId()) {
    throw new Error(
      "inquiry and newsletter resolved to the SAME sheet id. Tabs: " +
        listTabs(ss),
    );
  }

  Logger.log("inquiry id=" + inquiry.getSheetId() + " name=" + inquiry.getName());
  Logger.log(
    "newsletter id=" + newsletter.getSheetId() + " name=" + newsletter.getName(),
  );
  Logger.log("After: " + listTabs(ss));
}
