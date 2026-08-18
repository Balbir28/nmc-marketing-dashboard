import csv

ads_file = "/Users/balbaasaur/.gemini/antigravity/brain/3c9b610a-8c61-4c86-b99d-d52ce4d9dcab/.system_generated/steps/708/content.md"
leads_file = "/Users/balbaasaur/.gemini/antigravity/brain/3c9b610a-8c61-4c86-b99d-d52ce4d9dcab/.system_generated/steps/710/content.md"

print("==================== TAB 1: GOOGLE_ADS_DATA ====================")
with open(ads_file, 'r', encoding='utf-8') as f:
    ads_lines = f.readlines()

start_idx = 0
for i, l in enumerate(ads_lines):
    if l.strip().startswith('"') or l.strip().startswith('Day') or l.strip().startswith('Date') or ',' in l:
        start_idx = i
        break

print(f"Total raw lines in ads_file: {len(ads_lines)}")
print(f"Line {start_idx} (Headers): {ads_lines[start_idx].strip()[:200]}")
for idx in range(1, 10):
    if start_idx + idx < len(ads_lines):
        print(f"Line {start_idx + idx}: {ads_lines[start_idx + idx].strip()[:200]}")

print("\n==================== TAB 2: CALL_CENTER_LEADS ====================")
with open(leads_file, 'r', encoding='utf-8') as f:
    leads_lines = f.readlines()

start_idx_leads = 0
for i, l in enumerate(leads_lines):
    if l.strip().startswith('"') or l.strip().startswith('ID') or ',' in l:
        start_idx_leads = i
        break

print(f"Total raw lines in leads_file: {len(leads_lines)}")
print(f"Line {start_idx_leads} (Headers): {leads_lines[start_idx_leads].strip()[:200]}")
for idx in range(1, 5):
    if start_idx_leads + idx < len(leads_lines):
        print(f"Line {start_idx_leads + idx}: {leads_lines[start_idx_leads + idx].strip()[:200]}")
