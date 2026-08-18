import json

with open('ads_fresh.csv', 'r', encoding='utf-8') as f:
    ads_csv = f.read()

with open('leads_fresh.csv', 'r', encoding='utf-8') as f:
    leads_csv = f.read()

with open('js/data-store.js', 'r', encoding='utf-8') as f:
    store_code = f.read()

# Replace generateRealisticDataset logic with parsing ads_fresh and leads_fresh
ads_json = json.dumps(ads_csv)
leads_json = json.dumps(leads_csv)

embedded_code = f"""  init() {{
    this.loadDefaultDataset();
    this.autoSyncConnectedGoogleSheet();
  }},

  loadDefaultDataset() {{
    const adsCsv = {ads_json};
    const leadsCsv = {leads_json};
    this.ingestAdsData(this.parseCsv(adsCsv));
    this.ingestLeadsData(this.parseCsv(leadsCsv));
  }},
"""

# Replace generateRealisticDataset and init in store_code
init_pos = store_code.find('init() {')
if init_pos != -1:
    end_gen_pos = store_code.find('  subscribe(callback) {')
    if end_gen_pos != -1:
        new_store_code = store_code[:init_pos] + embedded_code + "\n" + store_code[end_gen_pos:]
        with open('js/data-store.js', 'w', encoding='utf-8') as f:
            f.write(new_store_code)
        print("Successfully updated js/data-store.js with embedded fresh dataset!")
    else:
        print("Could not find end_gen_pos")
else:
    print("Could not find init_pos")
