import csv

ads_file = "/Users/balbaasaur/.gemini/antigravity/brain/3c9b610a-8c61-4c86-b99d-d52ce4d9dcab/.system_generated/steps/638/content.md"
with open(ads_file, 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = 0
for i, l in enumerate(lines):
    if l.strip().startswith('"Day"') or l.strip().startswith('Day'):
        start_idx = i
        break

raw_rows = [list(csv.reader([l.strip()]))[0] for l in lines[start_idx+1:] if l.strip()]

# Let's check Account names in Col 2
accounts = {}
for r in raw_rows:
    acc = r[2].strip()
    accounts[acc] = accounts.get(acc, 0) + 1

print("Accounts in Col 2:", accounts)

# Let's see: How does the parser classify regions?
regions_map = {
    'Sunny Clinics': ['sun', 'sunny', 'samnan', 'buhaira', 'yarmook', 'shahba', 'meena'],
    'AUH': ['auh', 'abu dhabi', 'capital', 'khalifa', 'bareen', 'al ain', 'electra', 'mbz'],
    'DXB': ['dxb', 'dubai', 'al nahda', 'dip', 'deira', 'al barsha', 'barsha'],
    'Northern Emirates': ['northern emirates', 'north emirates', 'ne', 'sharjah', 'shj', 'ajman', 'ajm', 'rak', 'ras al khaimah', 'fujairah', 'fuj', 'uaq', 'umm al quwain', 'rolla']
}

def classify_account(acc_name, camp_name):
    combined = (acc_name + ' ' + camp_name).lower()
    for reg, patterns in regions_map.items():
        for p in patterns:
            if p in combined:
                return reg
    return 'AUH'

region_counts = {}
for r in raw_rows:
    reg = classify_account(r[2], r[1])
    region_counts[reg] = region_counts.get(reg, 0) + 1

print("\nClassified Region counts:", region_counts)

# Let's check why Search Top IS gave 2572.5%:
# In analytics.js:
# const weightedTopIS = ads.reduce((sum, a) => sum + ((a.Search_Top_IS || 0) * (a.Impressions || 1)), 0);
# const avgTopIS = totalImpressions > 0 ? (weightedTopIS / totalImpressions) : 75;
# Look at that: If totalImpressions is small (like 491) or if (a.Impressions || 1) multiplies by 1 for 16,386 rows:
# 16,386 * 75 / 491 = 2,502%! THAT IS WHY Search Top IS was 2572.5%!

# Let's check why Impressions was 491:
# Where does 491 come from?
# Let's sum column values in raw_rows:
col_sums = {}
for col_idx in range(len(raw_rows[0])):
    s = 0.0
    for r in raw_rows:
        if col_idx < len(r):
            v = r[col_idx].replace(',', '').replace('%', '').replace('AED', '').strip()
            try:
                s += float(v)
            except:
                pass
    col_sums[col_idx] = s

print("\n--- SUM OF EVERY COLUMN (0 to 24) ---")
for col_idx, s in col_sums.items():
    print(f"Col {col_idx:02d}: Sum = {s:,.2f}")
