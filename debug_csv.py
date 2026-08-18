import csv
import sys

# Read the ads CSV and analyze structure
with open('ads_data.csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    rows = list(reader)

header = rows[0]
print(f"=== HEADER ROW ({len(header)} fields) ===")
for i, h in enumerate(header):
    print(f"  Header[{i:2d}] = {h!r}")

print(f"\n=== FIRST DATA ROW ({len(rows[1])} fields) ===")
for i, v in enumerate(rows[1]):
    h = header[i] if i < len(header) else '???'
    print(f"  Data[{i:2d}] = {v!r:40s}  (header: {h!r})")

# Find data rows with non-zero clicks by checking which columns contain plausible numeric data
print(f"\n=== ROWS WITH ACTUAL CLICKS (looking for rows where some col > 5 numerically) ===")
count = 0
for row in rows[1:]:
    if count >= 3:
        break
    # Check if any column 10-15 has a value > 5
    for ci in range(10, 16):
        if ci < len(row):
            try:
                v = float(row[ci].replace('%','').replace(',','').strip())
                if v > 5:
                    print(f"\n  Row campaign: {row[1]}")
                    for i, val in enumerate(row):
                        h = header[i] if i < len(header) else '???'
                        print(f"    [{i:2d}] {h!r:40s} => {val!r}")
                    count += 1
                    break
            except:
                pass

# Sum columns 11 and 12 to verify they're impressions/clicks
print(f"\n=== COLUMN SUMS FOR VERIFICATION ===")
for col_idx in [11, 12, 15, 16, 17]:
    total = 0
    for row in rows[1:]:
        if col_idx < len(row):
            try:
                total += float(row[col_idx].replace('%','').replace(',','').strip())
            except:
                pass
    print(f"  Col {col_idx} ({header[col_idx] if col_idx < len(header) else '?'}): sum = {total:,.2f}")
