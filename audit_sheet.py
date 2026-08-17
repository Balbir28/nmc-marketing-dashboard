import csv

ads_file = "/Users/balbaasaur/.gemini/antigravity/brain/3c9b610a-8c61-4c86-b99d-d52ce4d9dcab/.system_generated/steps/521/content.md"
leads_file = "/Users/balbaasaur/.gemini/antigravity/brain/3c9b610a-8c61-4c86-b99d-d52ce4d9dcab/.system_generated/steps/525/content.md"

print("=== 1. AUDITING GOOGLE ADS DATA TAB ===")
with open(ads_file, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# find header line starting with "Day" or "Date"
start_idx = 0
for i, line in enumerate(lines):
    if line.strip().startswith('"Day"') or line.strip().startswith('Day'):
        start_idx = i
        break

csv_lines = lines[start_idx:]
reader = csv.DictReader(csv_lines)

total_rows = 0
total_impr = 0
total_clicks = 0
total_cost = 0.0
total_conv = 0.0
accounts = set()
campaigns = set()
dates = set()

for row in reader:
    total_rows += 1
    impr_str = row.get('Impr.', row.get('Impressions', '0')).replace(',', '').strip()
    clicks_str = row.get('Clicks', '0').replace(',', '').strip()
    cost_str = row.get('Cost', '0').replace(',', '').replace('AED', '').strip()
    conv_str = row.get('Conversions', '0').replace(',', '').strip()
    
    impr = int(impr_str) if impr_str.isdigit() else 0
    clicks = int(clicks_str) if clicks_str.isdigit() else 0
    try:
        cost = float(cost_str)
    except:
        cost = 0.0
    try:
        conv = float(conv_str)
    except:
        conv = 0.0
        
    total_impr += impr
    total_clicks += clicks
    total_cost += cost
    total_conv += conv
    
    acc = row.get('Account name', row.get('Account', '')).strip()
    if acc: accounts.add(acc)
    
    camp = row.get('Campaign', row.get('Campaign_Name', '')).strip()
    if camp: campaigns.add(camp)
    
    d = row.get('Day', row.get('Date', '')).strip()
    if d: dates.add(d)

print(f"Total Google Ads Rows: {total_rows}")
print(f"Total Impressions: {total_impr:,}")
print(f"Total Clicks: {total_clicks:,}")
print(f"Total Spend (AED): AED {total_cost:,.2f}")
print(f"Total Conversions: {total_conv:,.1f}")
print(f"Ad Accounts Detected ({len(accounts)}): {list(accounts)[:5]}")
print(f"Unique Campaigns ({len(campaigns)}): {list(campaigns)[:5]}")
print(f"Date Range Sample ({len(dates)} dates): {sorted(list(dates))[:5]} ... {sorted(list(dates))[-5:]}")

print("\n=== 2. AUDITING CALL CENTER LEADS TAB ===")
with open(leads_file, 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = 0
for i, line in enumerate(lines):
    if line.strip().startswith('"ID"') or line.strip().startswith('ID'):
        start_idx = i
        break

csv_lines = lines[start_idx:]
reader = csv.DictReader(csv_lines)

total_leads = 0
status_counts = {}
doctors = set()
branches = set()
departments = set()

for row in reader:
    total_leads += 1
    st = row.get('Status', 'Unknown').strip()
    status_counts[st] = status_counts.get(st, 0) + 1
    
    doc = row.get('Doctor', '').strip()
    if doc: doctors.add(doc)
    
    br = row.get('Branch', '').strip()
    if br: branches.add(br)
    
    dep = row.get('Department', '').strip()
    if dep: departments.add(dep)

print(f"Total Call Center Leads: {total_leads}")
print(f"Lead Status Breakdown: {status_counts}")
print(f"Unique Doctors ({len(doctors)}): {list(doctors)[:5]}")
print(f"Hospital Branches ({len(branches)}): {list(branches)[:5]}")
print(f"Departments ({len(departments)}): {list(departments)[:5]}")
