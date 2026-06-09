/**
 * WashZilla — Google Sheets booking webhook.
 *
 * SETUP (5 minutes):
 * 1) Open your sheet:
 *    https://docs.google.com/spreadsheets/d/1d9_81T6chB77zC7S9fgV6f_kd3tp-c5Z7_xYB0uUKeI/edit
 * 2) Top menu: Extensions → Apps Script
 * 3) Delete any starter code and paste this ENTIRE file.
 * 4) Click "Save" (disk icon), name the project "WashZilla Bookings".
 * 5) Click "Deploy" → "New deployment".
 *      - Select type: Web app
 *      - Description:  WashZilla bookings webhook
 *      - Execute as:   Me (your account)
 *      - Who has access: Anyone        <-- IMPORTANT, required for the website to post
 *    Click "Deploy", grant the requested permissions.
 * 6) Copy the "Web app URL" shown after deploy. It looks like:
 *      https://script.google.com/macros/s/AKfycbx.../exec
 * 7) Paste it into sheets-config.js → sheetsConfig.webAppUrl
 *
 * To redeploy after edits: Deploy → Manage deployments → pencil/edit → New version → Deploy
 * The URL stays the same when you edit the existing deployment.
 */

const SHEET_NAME = "Bookings";

const HEADERS = [
  "Timestamp",
  "Full Name",
  "Mobile",
  "Vehicle Number",
  "Pickup & Drop",
  "Pickup Address",
  "Preferred Date",
  "Preferred Time",
  "Notes",
  "Source",
];

function doPost(e) {
  try {
    const body = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
    const sheet = getOrCreateSheet_();

    sheet.appendRow([
      new Date(),
      body.customerName || "",
      body.customerPhone || "",
      body.vehicleNumber || "",
      body.pickup || "",
      body.address || "",
      body.date || "",
      body.time || "",
      body.notes || "",
      body.source || "website",
    ]);

    return jsonResponse_({ ok: true });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err) });
  }
}

// Quick health-check from a browser.
function doGet() {
  return jsonResponse_({ ok: true, service: "WashZilla bookings webhook" });
}

function getOrCreateSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight("bold")
      .setBackground("#111111")
      .setFontColor("#f5d063");
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, HEADERS.length);
  }
  return sheet;
}

function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
