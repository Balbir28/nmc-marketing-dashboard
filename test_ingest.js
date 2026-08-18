const fs = require('fs');
global.window = {};
global.localStorage = { getItem: () => null, setItem: () => {} };

eval(fs.readFileSync('js/parser.js', 'utf8'));
global.NMC_PARSER = window.NMC_PARSER;
eval(fs.readFileSync('js/data-store.js', 'utf8'));

const N = window.NMC_DATA_STORE;

// Test Ads
const csvAds = fs.readFileSync('ads_data.csv', 'utf8');
const parsedAds = N.parseCsv(csvAds);
const adsCount = N.ingestAdsData(parsedAds);

const totalClicks = N.adsData.reduce((s, a) => s + (a.Clicks || 0), 0);
const totalImpr = N.adsData.reduce((s, a) => s + (a.Impressions || 0), 0);
const totalCost = N.adsData.reduce((s, a) => s + (a.Cost || 0), 0);
const totalConv = N.adsData.reduce((s, a) => s + (a.Conversions || 0), 0);

console.log('=== ADS DATA ===');
console.log('Rows ingested:', adsCount);
console.log('Clicks:', totalClicks);
console.log('Impressions:', totalImpr);
console.log('Cost:', totalCost.toFixed(2));
console.log('Conversions:', totalConv.toFixed(0));

// Test Leads
const csvLeads = fs.readFileSync('leads_data.csv', 'utf8');
const parsedLeads = N.parseCsv(csvLeads);
const leadsCount = N.ingestLeadsData(parsedLeads);

const booked = N.leadsData.filter(l => l.Status === 'Booked' || l.Status === 'Attended' || l.Status === 'Surgery Scheduled').length;
const notBooked = N.leadsData.filter(l => l.Status === 'Not Booked').length;
const notReachable = N.leadsData.filter(l => l.Status === 'Not Reachable').length;
const pending = N.leadsData.filter(l => l.Status === 'Pending').length;

console.log('\n=== LEADS DATA ===');
console.log('Total leads:', leadsCount);
console.log('Booked:', booked);
console.log('Not Booked:', notBooked);
console.log('Not Reachable:', notReachable);
console.log('Pending:', pending);

// Sunny branches
console.log('\n=== SUNNY CLINIC BRANCHES ===');
const sunnyAds = N.adsData.filter(a => a.Ad_Account === 'Sunny Clinics');
const branches = {};
sunnyAds.forEach(a => { branches[a.Hospital_Branch] = (branches[a.Hospital_Branch] || 0) + 1; });
Object.entries(branches).sort((a,b) => b[1] - a[1]).forEach(([name, count]) => {
  console.log(`  ${name}: ${count} rows`);
});

// Check ALL branches across all accounts
console.log('\n=== ALL HOSPITAL BRANCHES ===');
const allBranches = {};
N.adsData.forEach(a => {
  const key = `[${a.Ad_Account}] ${a.Hospital_Branch}`;
  allBranches[key] = (allBranches[key] || 0) + 1;
});
Object.entries(allBranches).sort((a,b) => b[1] - a[1]).forEach(([name, count]) => {
  console.log(`  ${name}: ${count} rows`);
});
