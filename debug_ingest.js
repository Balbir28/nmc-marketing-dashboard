var window = { addEventListener: function(){} };
var document = {
  addEventListener: function(){},
  getElementById: function(){ return {}; },
  querySelectorAll: function(){ return []; }
};
var localStorage = { getItem: function(){}, setItem: function(){} };
var console = { log: print, warn: print, error: print };
load('extracted_test.js');

NMC_DATA_STORE.parseDelimitedText = function(text, delimiter) {
  if (!text || typeof text !== 'string') return [];
  var lines = text.trim().split(/\r?\n/).filter(function(l) { return l.trim().length > 0; });
  if (lines.length < 2) return [];

  var headerIdx = 0;
  for (var i = 0; i < Math.min(20, lines.length); i++) {
    var line = lines[i];
    if (/^["']?(Day|Date|ID|Campaign|Account|Status|Patient)/i.test(line) || line.includes('","') || (line.split(',').length >= 5) || (line.split('\t').length >= 5)) {
      headerIdx = i;
      break;
    }
  }

  lines = lines.slice(headerIdx);

  if (!delimiter) {
    var header = lines[0];
    var commas = (header.match(/,/g) || []).length;
    var tabs = (header.match(/\t/g) || []).length;
    var semicolons = (header.match(/;/g) || []).length;
    if (tabs >= commas && tabs >= semicolons) delimiter = '\t';
    else if (semicolons > commas) delimiter = ';';
    else delimiter = ',';
  }

  var parseLine = function(line) {
    var result = [];
    var cur = '';
    var inQuotes = false;
    for (var i = 0; i < line.length; i++) {
      var c = line[i];
      if (c === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === delimiter && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += c;
      }
    }
    result.push(cur.trim());
    return result;
  };

  var headers = parseLine(lines[0]).map(function(h) { return h.replace(/^["']|["']$/g, '').trim(); });
  var data = [];

  for (var i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    var values = parseLine(lines[i]);
    var row = { _rawValues: values };
    headers.forEach(function(h, index) {
      var val = values[index] !== undefined ? values[index].replace(/^["']|["']$/g, '').trim() : '';
      row[h] = val;
    });
    data.push(row);
  }
  return data;
};

var adsCsv = read("/Users/balbaasaur/.gemini/antigravity/brain/3c9b610a-8c61-4c86-b99d-d52ce4d9dcab/.system_generated/steps/708/content.md");
var leadsCsv = read("/Users/balbaasaur/.gemini/antigravity/brain/3c9b610a-8c61-4c86-b99d-d52ce4d9dcab/.system_generated/steps/710/content.md");

var parsedAds = NMC_DATA_STORE.parseDelimitedText(adsCsv);
var parsedLeads = NMC_DATA_STORE.parseDelimitedText(leadsCsv);

print("Parsed Ads count: " + parsedAds.length);
print("Parsed Leads count: " + parsedLeads.length);

var ingestedAds = NMC_DATA_STORE.ingestAdsData(parsedAds);
var ingestedLeads = NMC_DATA_STORE.ingestLeadsData(parsedLeads);

print("Ingested Ads: " + ingestedAds);
print("Ingested Leads: " + ingestedLeads);

APP.filters.startDate = '2020-01-01';
APP.filters.endDate = '2030-12-31';

var filterRes = NMC_ANALYTICS.filterData(NMC_DATA_STORE.adsData, NMC_DATA_STORE.leadsData, APP.filters);
var metrics = NMC_ANALYTICS.computeExecutiveMetrics(filterRes.filteredAds, filterRes.filteredLeads);

print("\n--- FINAL COMPUTED METRICS ON REAL DATA ---");
print("Total Spend: AED " + metrics.totalSpend.toLocaleString());
print("Total Clicks: " + metrics.totalClicks.toLocaleString());
print("Total Impressions: " + metrics.totalImpressions.toLocaleString());
print("Total Google Conversions: " + metrics.totalGoogleConv.toLocaleString());
print("Total Leads: " + metrics.totalLeads);
print("Total Booked: " + metrics.totalBooked);
print("Avg CPC: AED " + metrics.overallAvgCPC.toFixed(2));
print("CTR: " + metrics.overallCTR.toFixed(2) + "%");
print("Search Top IS: " + metrics.avgTopIS.toFixed(1) + "%");

var regions = NMC_ANALYTICS.getRegionalBreakdown(filterRes.filteredAds, filterRes.filteredLeads);
print("\n--- REGIONAL BREAKDOWN ---");
regions.forEach(function(r) {
  print(r.territory + ": Spend AED " + r.totalSpend.toFixed(2) + ", Clicks: " + r.totalClicks + ", Leads: " + r.totalLeads + ", Booked: " + r.totalBooked);
});
