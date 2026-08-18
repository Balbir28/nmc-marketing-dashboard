import fs from 'fs';
import path from 'path';

const adsCsv = fs.readFileSync('ads_fresh.csv', 'utf8');
const leadsCsv = fs.readFileSync('leads_fresh.csv', 'utf8');

console.log(`Ads CSV length: ${adsCsv.length} chars`);
console.log(`Leads CSV length: ${leadsCsv.length} chars`);
