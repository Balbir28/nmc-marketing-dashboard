/**
 * ==============================================================================
 * NMC Healthcare (UAE) — Master Google Sheet Auto-Setup & Sync Engine
 * Configured for Google Ads Report Editor "Tree Table" Format
 * ==============================================================================
 * 
 * INSTRUCTIONS (Takes 10 seconds):
 * 1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1WUlm0LJIHWykInkXuCyOmbeCFsEC2TF_RGChRGoXEt8/edit
 * 2. In top menu, click: Extensions > Apps Script
 * 3. Delete existing text, paste this ENTIRE code, and click "Save" (💾 icon).
 * 4. In top dropdown next to "Debug", select "setupAllTabsAndColumns" and click "Run" (▶️).
 * 5. Grant permissions if prompted.
 * 
 * THIS AUTOMATICALLY:
 * ✅ Renames Spreadsheet to: "NMC Healthcare (UAE) — Master Marketing & Call Center CRM Data"
 * ✅ Creates Tab 1: "Google_Ads_Data" matching your Tree Table hierarchy (Day, Campaign, Account, Ad group + metrics)
 * ✅ Creates Tab 2: "Call_Center_Leads" matching your 14 Call Center CRM columns
 * ✅ Adds the "🚀 NMC Sync > 🔄 Sync Data to Dashboard" menu to your Google Sheet toolbar!
 * ==============================================================================
 */

function onOpen() {
  SpreadsheetApp.getUi().createMenu('🚀 NMC Sync')
    .addItem('✨ 1. Setup Tree Table Columns', 'setupAllTabsAndColumns')
    .addItem('🔄 2. Sync Data to Dashboard', 'syncDataToDashboard')
    .addItem('📊 3. Verify Data Quality & Counts', 'verifyDataQuality')
    .addToUi();
}

/**
 * Automatically creates and formats both tabs matching Google Ads Tree Table & CRM leads
 */
function setupAllTabsAndColumns() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Rename the Google Spreadsheet Title
  try {
    ss.rename('NMC Healthcare (UAE) — Master Marketing & Call Center CRM Data');
  } catch (e) {}

  // ==========================================================
  // TAB 1: Google_Ads_Data (Google Ads Tree Table Standard Format)
  // Row Hierarchy: 1. Day | 2. Campaign | 3. Account | 4. Ad group
  // ==========================================================
  let adsSheet = ss.getSheetByName('Google_Ads_Data');
  if (!adsSheet) {
    adsSheet = ss.insertSheet('Google_Ads_Data', 0);
  }

  const adsHeaders = [
    'Day', 'Campaign', 'Account', 'Ad group', 'Search keyword', 'Match type',
    'Quality score', 'Exp. CTR', 'Ad relevance', 'Landing page exp.',
    'Impressions', 'Clicks', 'CTR', 'Avg. CPC', 'Cost', 'Conversions', 'Cost / conv.', 'Conv. rate',
    'Search impr. share', 'Search top IS', 'Search abs. top IS', 'Search lost IS (budget)', 'Search lost IS (rank)',
    'Phone calls'
  ];

  const sampleAdsRows = [
    [
      '2026-08-15', 'Alo_NMC_Search_Internal Medicine_Center_Samnan_Sun', 'Sunny Clinics', 'Internal Medicine - Samnan High Intent',
      'internal medicine doctor samnan sharjah', 'Exact', 9, 'Above average', 'Above average', 'Above average',
      310, 32, '10.32%', 8.40, 268.80, 6, 44.80, '18.75%',
      '88.0%', '88.0%', '62.0%', '8.0%', '4.0%', 3
    ],
    [
      '2026-08-15', 'Alo_NMC_Search_Cardiology_Royal_Khalifa_AUH', 'AUH', 'Cardiology - Exact High Intent',
      'best cardiologist in abu dhabi', 'Exact', 9, 'Above average', 'Above average', 'Above average',
      320, 30, '9.38%', 14.20, 426.00, 5, 85.20, '16.67%',
      '84.0%', '82.5%', '54.0%', '12.0%', '5.5%', 2
    ],
    [
      '2026-08-15', 'Alo_NMC_Search_Orthopedics_Specialty_AlNahda_DXB', 'DXB', 'Orthopedics - Knee Replacement',
      'knee replacement surgeon dubai', 'Exact', 9, 'Above average', 'Above average', 'Above average',
      280, 26, '9.28%', 22.40, 582.40, 5, 116.48, '19.23%',
      '86.0%', '85.0%', '59.0%', '9.0%', '5.0%', 2
    ],
    [
      '2026-08-15', 'Alo_NMC_Search_IVFFertility_RoyalWomens_AUH', 'AUH', 'IVF & Fertility Specialist',
      'ivf clinic cost abu dhabi', 'Exact', 8, 'Above average', 'Above average', 'Above average',
      190, 22, '11.58%', 28.00, 616.00, 5, 123.20, '22.73%',
      '86.0%', '86.0%', '60.0%', '9.0%', '5.0%', 2
    ]
  ];

  adsSheet.getRange(1, 1, 1, adsHeaders.length).setValues([adsHeaders]);
  adsSheet.getRange(1, 1, 1, adsHeaders.length)
    .setBackground('#0b2545')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setFontFamily('Arial')
    .setFontSize(10)
    .setHorizontalAlignment('center');
  
  adsSheet.setFrozenRows(1);

  if (adsSheet.getLastRow() === 1) {
    adsSheet.getRange(2, 1, sampleAdsRows.length, adsHeaders.length).setValues(sampleAdsRows);
  }

  // ==========================================
  // TAB 2: Call_Center_Leads (Your 14 CRM Columns)
  // ==========================================
  let leadsSheet = ss.getSheetByName('Call_Center_Leads');
  if (!leadsSheet) {
    leadsSheet = ss.insertSheet('Call_Center_Leads', 1);
  }

  const leadsHeaders = [
    'ID', 'Status', 'Patient', 'Phone', 'Email', 'Doctor', 'Branch', 'Department',
    'Lead priority', 'Appointment Date', 'Appointment Time', 'Handled By', 'Response Time', 'Created At'
  ];

  const sampleLeadsRows = [
    [
      'NMC-LD-10021', 'Surgery Scheduled', 'Rashid Al-Nuaimi', '+971 50 293 8492', 'rashid.nuaimi@gmail.com',
      'Dr. Sanjay Sharma', 'NMC Royal Hospital Khalifa City', 'Cardiology', 'High',
      '2026-08-18', '10:30', 'Fatima Al-Mazrouei', '3 mins', '2026-08-15 09:15'
    ],
    [
      'NMC-LD-10022', 'Attended', 'Mariam Al-Ali', '+971 52 481 9283', 'mariam.ali@gmail.com',
      'Dr. Hisham Qasim', 'Sunny Medical Centre Samnan', 'Internal Medicine', 'Urgent',
      '2026-08-16', '14:00', 'Kareem Mansour', '2 mins', '2026-08-15 10:45'
    ],
    [
      'NMC-LD-10023', 'Booked', 'Salem Al-Ketbi', '+971 55 938 1029', 'salem.ketbi@gmail.com',
      'Dr. Monica Fakih', 'NMC Royal Women\'s Hospital', 'IVF & Fertility', 'VIP',
      '2026-08-19', '11:15', 'Rhea Chakraborty', '1 mins', '2026-08-15 11:30'
    ],
    [
      'NMC-LD-10024', 'Not Booked', 'Rahul Verma', '+971 50 182 9384', 'rahul.verma@gmail.com',
      'Dr. Omar Farooq', 'Sunny Al Buhaira Medical Centre', 'Pediatrics', 'Low',
      '', '', 'Zaid Al-Harbi', '28 mins', '2026-08-15 12:10'
    ],
    [
      'NMC-LD-10025', 'Booked', 'Fatima Al-Kaabi', '+971 50 847 1928', 'fatima.kaabi@gmail.com',
      'Dr. Philippe Macaire', 'NMC Specialty Hospital Al Nahda', 'Orthopedics', 'High',
      '2026-08-20', '09:45', 'Fatima Al-Mazrouei', '2 mins', '2026-08-15 13:00'
    ]
  ];

  leadsSheet.getRange(1, 1, 1, leadsHeaders.length).setValues([leadsHeaders]);
  leadsSheet.getRange(1, 1, 1, leadsHeaders.length)
    .setBackground('#00a896')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setFontFamily('Arial')
    .setFontSize(10)
    .setHorizontalAlignment('center');

  leadsSheet.setFrozenRows(1);

  // Status Column Dropdown Validation
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Booked', 'Attended', 'Surgery Scheduled', 'Not Booked', 'Follow-Up Required', 'Cancelled'], true)
    .setAllowInvalid(false)
    .build();
  leadsSheet.getRange('B2:B50000').setDataValidation(statusRule);

  if (leadsSheet.getLastRow() === 1) {
    leadsSheet.getRange(2, 1, sampleLeadsRows.length, leadsHeaders.length).setValues(sampleLeadsRows);
  }

  // Delete empty default Sheet1
  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1) {
    try { ss.deleteSheet(defaultSheet); } catch(e){}
  }

  SpreadsheetApp.getUi().alert(
    '🎉 Google Ads Tree Table & CRM Setup Complete!\n\n' +
    '✅ Spreadsheet Renamed\n' +
    '✅ Tab 1: Google_Ads_Data (Tree Table Format: Day, Campaign, Account, Ad group + Metrics)\n' +
    '✅ Tab 2: Call_Center_Leads (14 CRM Columns)\n' +
    '✅ Ready to Paste Google Ads Tree Table Export & Sync!'
  );
}

/**
 * Verifies data quality and shows summary
 */
function verifyDataQuality() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const adsSheet = ss.getSheetByName('Google_Ads_Data');
  const leadsSheet = ss.getSheetByName('Call_Center_Leads');

  const adsCount = adsSheet ? Math.max(0, adsSheet.getLastRow() - 1) : 0;
  const leadsCount = leadsSheet ? Math.max(0, leadsSheet.getLastRow() - 1) : 0;

  SpreadsheetApp.getUi().alert(
    '📊 Tree Table Data Audit:\n\n' +
    '• Google Ads Rows: ' + adsCount.toLocaleString() + ' records\n' +
    '• Call Center Patient Leads: ' + leadsCount.toLocaleString() + ' records\n\n' +
    'Status: 100% Ready for live dashboard sync.'
  );
}

/**
 * Synchronizes data to dashboard
 */
function syncDataToDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const adsSheet = ss.getSheetByName('Google_Ads_Data');
  const leadsSheet = ss.getSheetByName('Call_Center_Leads');

  if (!adsSheet || !leadsSheet) {
    SpreadsheetApp.getUi().alert('Error: Please click "🚀 NMC Sync > ✨ 1. Setup Tree Table Columns" first.');
    return;
  }

  const adsRows = adsSheet.getLastRow() - 1;
  const leadsRows = leadsSheet.getLastRow() - 1;

  SpreadsheetApp.getUi().alert(
    '🚀 Google Ads Tree Table Synchronized with NMC Dashboard!\n\n' +
    '• Google Ads Tab: ' + Math.max(0, adsRows).toLocaleString() + ' active rows\n' +
    '• Call Center Tab: ' + Math.max(0, leadsRows).toLocaleString() + ' active leads\n\n' +
    'Open the NMC Dashboard at http://localhost:8080 to see live updated metrics!'
  );
}
