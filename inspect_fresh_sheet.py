import csv

print("=== ADS_FRESH.CSV INSPECTION ===")
with open('ads_fresh.csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    rows = list(reader)

if rows:
    header = rows[0]
    print(f"Header length: {len(header)}")
    for i, h in enumerate(header):
        print(f"  Col {i:2d}: {h}")

    print("\nFirst 3 data rows:")
    for r_idx in range(1, min(4, len(rows))):
        print(f"Row {r_idx}: {rows[r_idx]}")

    # Let's inspect column data types / contents
    print("\nColumn position analysis across all rows:")
    col_sums = {}
    col_non_zero = {}
    for i in range(len(header)):
        col_sums[i] = 0.0
        col_non_zero[i] = 0

    for r in rows[1:]:
        for i, val in enumerate(r):
            if i >= len(header): continue
            clean = val.replace(',', '').replace('%', '').strip()
            try:
                num = float(clean)
                col_sums[i] += num
                if num != 0:
                    col_non_zero[i] += 1
            except ValueError:
                pass

    for i in range(len(header)):
        print(f"  Col {i:2d} ({header[i]}): sum = {col_sums[i]:,.2f}, non-zero rows = {col_non_zero[i]}")

print("\n=== LEADS_FRESH.CSV INSPECTION ===")
with open('leads_fresh.csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    l_rows = list(reader)

if l_rows:
    l_header = l_rows[0]
    print(f"Header length: {len(l_header)}")
    for i, h in enumerate(l_header):
        print(f"  Col {i:2d}: {h}")

    print(f"\nTotal lead rows: {len(l_rows) - 1}")
    status_counts = {}
    for r in l_rows[1:]:
        if len(r) > 1:
            st = r[1].strip()
            status_counts[st] = status_counts.get(st, 0) + 1
    print("Status Breakdown:", status_counts)
