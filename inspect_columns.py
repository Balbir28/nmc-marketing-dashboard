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

print(f"Total rows: {len(raw_rows)}")

# Let's inspect the distribution of values across all columns for the first 50 rows
col_samples = {}
for r in raw_rows[:50]:
    for idx, val in enumerate(r):
        if idx not in col_samples:
            col_samples[idx] = set()
        col_samples[idx].add(val)

print("\n--- SAMPLE VALUES PER COLUMN (0-indexed) ---")
for idx in sorted(col_samples.keys()):
    sample_list = list(col_samples[idx])[:5]
    print(f"Col {idx:02d}: {sample_list}")
