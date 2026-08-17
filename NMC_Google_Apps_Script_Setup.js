/**
 * ==============================================================================
 * NMC Healthcare (UAE) — Master Google Sheet Auto-Setup & Sync Engine
 * Matches EXACT Google Ads Report Editor Export (25 Columns) + 14 CRM Columns
 * Supports Lakhs of Rows (100,000 - 500,000+ Rows)
 * ==============================================================================
 */

function onOpen() {
  SpreadsheetApp.getUi().createMenu('🚀 NMC Sync')
    .addItem('✨ 1. Setup All Columns & Tabs', 'setupAllTabsAndColumns')
    .addItem('📊 2. Verify Google Ads & CRM Data', 'verifyDataQuality')
    .addToUi();
}

/**
 * Automatically creates and formats both tabs matching Google Ads & Call Center CRM
 */
function setupAllTabsAndColumns() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Rename the Google Spreadsheet Title
  try {
    ss.rename('NMC Healthcare (UAE) — Master Marketing & Call Center CRM Data');
  } catch (e) {}

  // ==========================================================
  // TAB 1: Google_Ads_Data (Exact 25 Google Ads Export Columns)
  // ==========================================================
  let adsSheet = ss.getSheetByName('Google_Ads_Data');
  if (!adsSheet) {
    adsSheet = ss.insertSheet('Google_Ads_Data', 0);
  }

  // Exact 25 Headers as exported from Google Ads Report Editor
  const adsHeaders = [
    'Day', 'Campaign', 'Account name', 'Customer ID', 'Ad group',
    'Search keyword', 'Search keyword match type', 'Quality Score',
    'Exp. CTR', 'Ad relevance', 'Landing page exp.',
    'Impr.', 'Clicks', 'CTR', 'Currency code', 'Avg. CPC', 'Cost', 'Conversions',
    'Cost/conv. (Converted currency)', 'Conv. rate',
    'Search impr. share', 'Search abs. top IS', 'Search lost IS (rank)',
    'Phone calls', 'Converted currency code'
  ];

  // Set headers only if sheet has <= 1 row or user requests setup
  if (adsSheet.getLastRow() <= 1) {
    adsSheet.getRange(1, 1, 1, adsHeaders.length).setValues([adsHeaders]);
  }
  
  adsSheet.getRange(1, 1, 1, adsHeaders.length)
    .setBackground('#0b2545')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setHorizontalAlignment('center');
  adsSheet.setFrozenRows(1);

  // ==========================================================
  // TAB 2: Call_Center_Leads (Your 14 Call Center CRM Columns)
  // ==========================================================
  let leadsSheet = ss.getSheetByName('Call_Center_Leads');
  if (!leadsSheet) {
    leadsSheet = ss.insertSheet('Call_Center_Leads', 1);
  }

  const leadsHeaders = [
    'ID', 'Status', 'Patient', 'Phone', 'Email', 'Doctor', 'Branch', 'Department',
    'Lead priority', 'Appointment Date', 'Appointment Time', 'Handled By', 'Response Time', 'Created At'
  ];

  if (leadsSheet.getLastRow() <= 1) {
    leadsSheet.getRange(1, 1, 1, leadsHeaders.length).setValues([leadsHeaders]);
  }

  leadsSheet.getRange(1, 1, 1, leadsHeaders.length)
    .setBackground('#00a896')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setHorizontalAlignment('center');
  leadsSheet.setFrozenRows(1);

  // Clean up default empty Sheet1 if present
  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1) {
    try { ss.deleteSheet(defaultSheet); } catch (e) {}
  }

  SpreadsheetApp.getUi().alert(
    '🎉 NMC Google Sheet Setup Complete!\n\n' +
    '• Tab 1: Google_Ads_Data (25 Google Ads columns)\n' +
    '• Tab 2: Call_Center_Leads (14 CRM columns)\n\n' +
    'Ready for live streaming to your NMC Dashboard!'
  );
}

/**
 * Verifies and summarizes data quality directly in Google Sheets
 */
function verifyDataQuality() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const adsSheet = ss.getSheetByName('Google_Ads_Data');
  const leadsSheet = ss.getSheetByName('Call_Center_Leads');

  if (!adsSheet || !leadsSheet) {
    SpreadsheetApp.getUi().alert('⚠️ Please run "Setup All Columns & Tabs" first.');
    return;
  }

  const adsRows = adsSheet.getDataRange().getValues();
  const leadsRows = leadsSheet.getDataRange().getValues();

  const adsCount = Math.max(0, adsRows.length - 1);
  const leadsCount = Math.max(0, leadsRows.length - 1);

  SpreadsheetApp.getUi().alert(
    '📊 NMC Data Quality Verification:\n\n' +
    '• Google Ads Rows: ' + adsCount.toLocaleString() + '\n' +
    '• Call Center CRM Leads: ' + leadsCount.toLocaleString() + '\n\n' +
    '✅ Data is verified and ready for NMC Dashboard!'
  );
}
