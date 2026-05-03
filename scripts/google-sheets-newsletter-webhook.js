/**
 * Google Apps Script webhook for CARLOPHILLIPS newsletter signups.
 *
 * Setup:
 * 1. Create a Google Sheet with a tab named "Newsletter".
 * 2. In Google Sheets, open Extensions > Apps Script.
 * 3. Paste this file into Code.gs.
 * 4. Set SPREADSHEET_ID below to your Google Sheet ID.
 * 5. Deploy > New deployment > Web app.
 * 6. Execute as: Me. Who has access: Anyone.
 * 7. Put the Web App URL in GOOGLE_SHEETS_WEBHOOK_URL.
 */

const SPREADSHEET_ID = 'PASTE_YOUR_SHEET_ID_HERE';
const SHEET_NAME = 'Newsletter';

function doPost(event) {
  const payload = JSON.parse(event.postData.contents || '{}');
  const email = String(payload.email || '').trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse({ success: false, error: 'A valid email is required' }, 400);
  }

  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
  ensureHeaderRow(sheet);

  const values = sheet.getDataRange().getValues();
  const existingRowIndex = values.findIndex((row, index) => index > 0 && String(row[0]).toLowerCase() === email);
  const row = [
    email,
    payload.subscribedAt || new Date().toISOString(),
    payload.source || 'website',
    payload.page || '',
    payload.userAgent || '',
  ];

  if (existingRowIndex > 0) {
    sheet.getRange(existingRowIndex + 1, 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }

  return jsonResponse({ success: true });
}

function ensureHeaderRow(sheet) {
  if (sheet.getLastRow() > 0) {
    return;
  }

  sheet.appendRow(['Email', 'Subscribed At', 'Source', 'Page', 'User Agent']);
}

function jsonResponse(body, statusCode) {
  return ContentService
    .createTextOutput(JSON.stringify({ ...body, statusCode: statusCode || 200 }))
    .setMimeType(ContentService.MimeType.JSON);
}
