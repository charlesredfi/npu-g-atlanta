/**
 * NPU-G forms → Google Sheet webhook (two tabs in ONE spreadsheet)
 *
 * Tabs in spreadsheet 10EnJmCHU2SI6VbLMNUgEzksnZRUDCj_xczr1fByXnEQ:
 *   - inquiry     ← Contact Us + merch
 *   - newsletter  ← Subscribe popup + News subscribe
 *
 * SETUP:
 * 1. Open that Google Sheet → Extensions → Apps Script
 * 2. Replace ALL code with this file → Save
 * 3. Run ensureTabsAndHeaders once (allow Sheets permission if asked)
 * 4. Deploy → Manage deployments → pencil → New version → Deploy
 *    (keep the same /exec URL in Vercel)
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
  // Always open by ID so editor "Run" and the web app use the same file.
  try {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (err) {
    throw new Error(
      "Cannot open spreadsheet " +
        SPREADSHEET_ID +
        ". Make sure this Apps Script project can access that Google Sheet. Details: " +
        err,
    );
  }
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
  if (!ss) {
    throw new Error("getSpreadsheet() returned empty");
  }

  var existing = findSheetByName_(ss, preferredName);
  if (existing) {
    return existing;
  }

  try {
    var created = ss.insertSheet(String(preferredName));
    if (created) {
      return created;
    }
  } catch (err) {
    // Race / duplicate name: try find again.
    existing = findSheetByName_(ss, preferredName);
    if (existing) {
      return existing;
    }
    throw new Error(
      "Could not create tab '" + preferredName + "': " + err,
    );
  }

  existing = findSheetByName_(ss, preferredName);
  if (existing) {
    return existing;
  }

  throw new Error(
    "Tab '" +
      preferredName +
      "' could not be found or created. Existing tabs: " +
      ss
        .getSheets()
        .map(function (s) {
          return s.getName();
        })
        .join(", "),
  );
}

function ensureHeaderRow(sheet) {
  if (!sheet || typeof sheet.getRange !== "function") {
    throw new Error(
      "ensureHeaderRow called without a valid sheet object",
    );
  }
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

/**
 * Run once from the Apps Script editor:
 * function dropdown → ensureTabsAndHeaders → Run
 * Approve Google Sheets access if prompted.
 */
function ensureTabsAndHeaders() {
  var ss = getSpreadsheet();
  Logger.log("Opened spreadsheet: " + ss.getName() + " (" + ss.getId() + ")");
  Logger.log(
    "Existing tabs: " +
      ss
        .getSheets()
        .map(function (s) {
          return s.getName();
        })
        .join(", "),
  );

  var inquiry = getOrCreateSheet("inquiry");
  Logger.log("inquiry sheet ok: " + (inquiry && inquiry.getName()));

  var newsletter = getOrCreateSheet("newsletter");
  Logger.log("newsletter sheet ok: " + (newsletter && newsletter.getName()));

  ensureHeaderRow(inquiry);
  ensureHeaderRow(newsletter);

  Logger.log("Headers ready on inquiry + newsletter");
}
