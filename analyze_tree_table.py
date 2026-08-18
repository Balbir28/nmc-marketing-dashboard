import csv

ads_file = "/Users/balbaasaur/.gemini/antigravity/brain/3c9b610a-8c61-4c86-b99d-d52ce4d9dcab/.system_generated/steps/638/content.md"
leads_file = "/Users/balbaasaur/.gemini/antigravity/brain/3c9b610a-8c61-4c86-b99d-d52ce4d9dcab/.system_generated/steps/640/content.md"

with open(ads_file, 'r', encoding='utf-8') as f:
    ads_lines = f.readlines()

start_idx = 0
for i, l in enumerate(ads_lines):
    if l.strip().startswith('"Day"') or l.strip().startswith('Day'):
        start_idx = i
        break

reader = csv.DictReader(ads_lines[start_idx:])
ads_rows = list(reader)

print(f"Total Google Ads rows in CSV: {len(ads_rows)}")
print("Header fields:", reader.fieldnames)

# Analyze rows with Day != "" vs Day == ""
dated_rows = [r for r in ads_rows if r.get('Day', '').strip() != '']
undated_rows = [r for r in ads_rows if r.get('Day', '').strip() == '']

print(f"Rows with explicit Date (Day != ''): {len(dated_rows)}")
print(f"Rows without explicit Date (Day == ''): {len(undated_rows)}")

def get_num(r, *keys):
    for k in keys:
        val = r.get(k, '')
        if val not in ('', None, '--', 'Not applicable'):
            clean = ''.join([c for c in val if c.isdigit() or c in '.-'])
            if clean:
                try: return float(clean)
                except: pass
    return 0.0

dated_impr = sum([get_num(r, 'Impr.', 'Impressions') for r in dated_rows])
dated_clicks = sum([get_num(r, 'Clicks') for r in dated_rows])
dated_cost = sum([get_num(r, 'Cost') for r in dated_rows])
dated_conv = sum([get_num(r, 'Conversions') for r in dated_rows])

undated_impr = sum([get_num(r, 'Impr.', 'Impressions') for r in undated_rows])
undated_clicks = sum([get_num(r, 'Clicks') for r in undated_rows])
undated_cost = sum([get_num(r, 'Cost') for r in undated_rows])
undated_conv = sum([get_num(r, 'Conversions') for r in undated_rows])

print("\n--- DATED ROWS TOTALS ---")
print(f"Impr: {dated_impr:,.0f} | Clicks: {dated_clicks:,.0f} | Cost: AED {dated_cost:,.2f} | Conv: {dated_conv:,.0f}")

print("\n--- UNDATED ROWS TOTALS ---")
print(f"Impr: {undated_impr:,.0f} | Clicks: {undated_clicks:,.0f} | Cost: AED {undated_cost:,.2f} | Conv: {undated_conv:,.0f}")

# Look closely at sample undated rows vs dated rows
print("\n--- SAMPLE DATED ROWS ---")
for r in dated_rows[:3]:
    print({k: r[k] for k in ['Day', 'Campaign', 'Account name', 'Ad group', 'Search keyword', 'Impr.', 'Clicks', 'Cost', 'Conversions'] if k in r})

print("\n--- SAMPLE UNDATED ROWS ---")
for r in undated_rows[:3]:
    print({k: r[k] for k in ['Day', 'Campaign', 'Account name', 'Ad group', 'Search keyword', 'Impr.', 'Clicks', 'Cost', 'Conversions'] if k in r})

# Check unique keywords and accounts in dated vs undated
dated_kws = set([r.get('Search keyword', '').strip() for r in dated_rows if r.get('Search keyword', '').strip()])
undated_kws = set([r.get('Search keyword', '').strip() for r in undated_rows if r.get('Search keyword', '').strip()])
print(f"\nUnique keywords in Dated rows: {len(dated_kws)}")
print(f"Unique keywords in Undated rows: {len(undated_kws)}")
print(f"Overlap: {len(dated_kws.intersection(undated_kws))}")
