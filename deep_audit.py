import csv
from collections import defaultdict

print("==================== 1. RESPONSE TIME AUDIT (LEADS) ====================")
with open('leads_fresh.csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    leads_header = next(reader)
    resp_times = []
    for r in reader:
        if len(r) > 12:
            resp_times.append(r[12])

print(f"Total leads: {len(resp_times)}")
print("Sample Response Times:", resp_times[:20])

# Calculate average response time in minutes
total_mins = 0
valid_count = 0
for r in resp_times:
    s = r.strip().lower()
    mins = 0
    if 'm' in s or 'min' in s:
        import re
        m = re.search(r'(\d+)', s)
        if m:
            mins = int(m.group(1))
    elif 'h' in s or 'hr' in s:
        import re
        m = re.search(r'(\d+)', s)
        if m:
            mins = int(m.group(1)) * 60
    elif s.isdigit():
        mins = int(s)
    
    if mins > 0:
        total_mins += mins
        valid_count += 1

print(f"Parsed valid response times count: {valid_count}")
print(f"Total minutes: {total_mins}")
print(f"Average response time: {total_mins / valid_count if valid_count > 0 else 0:.2f} mins")


print("\n==================== 2. CAMPAIGN NAMES BY AD ACCOUNT ====================")
account_camps = defaultdict(set)
with open('ads_fresh.csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    next(reader) # header
    for r in reader:
        if len(r) > 2:
            camp = r[1].strip()
            acc = r[2].strip()
            if camp and not camp.startswith('Total'):
                account_camps[acc].add(camp)

for acc, camps in account_camps.items():
    print(f"\n--- Account: '{acc}' ({len(camps)} unique campaigns) ---")
    for c in sorted(list(camps)):
        print(f"  - {c}")

