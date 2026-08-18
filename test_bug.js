const fs = require('fs');

// Mock DOM/Window for data-store.js
global.window = {};

const parserCode = fs.readFileSync('js/parser.js', 'utf8');
const storeCode = fs.readFileSync('js/data-store.js', 'utf8');

eval(parserCode);
eval(storeCode);

const adsCsv = fs.readFileSync('ads_data.csv', 'utf8');
const N = window.NMC_DATA_STORE;

N.parseCsv = function(csvText) {
    const lines = csvText.split(/\r?\n/);
    if (lines.length < 1) return [];
    
    const parseLine = (line) => {
      const row = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          inQuotes = !inQuotes;
        } else if (ch === ',' && !inQuotes) {
          row.push(cur.trim().replace(/^["']|["']$/g, ''));
          cur = '';
        } else {
          cur += ch;
        }
      }
      row.push(cur.trim().replace(/^["']|["']$/g, ''));
      return row;
    };
    
    const headers = parseLine(lines[0]).map(h => h.trim());
    const results = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const cols = parseLine(lines[i]);
      const obj = { _rawValues: cols }; // Added positional tracking!
      headers.forEach((h, idx) => {
        obj[h] = cols[idx] !== undefined ? cols[idx] : '';
      });
      results.push(obj);
    }
    return results;
  };

N.ingestAdsData(adsCsv);
const sunnyAds = N.adsData.filter(a => a.Ad_Account === 'Sunny Clinics');
const totalConv = sunnyAds.reduce((sum, a) => sum + (a.Conversions || 0), 0);
console.log("Sunny Conversions:", totalConv);
