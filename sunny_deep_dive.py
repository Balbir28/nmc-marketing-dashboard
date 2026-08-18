import csv
from collections import defaultdict

# Map Sunny campaigns to Specialties
with open('ads_fresh.csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    next(reader)
    sunny_ads = [r for r in reader if len(r) > 2 and r[2].strip() == 'Sunny Clinics']

print(f"Total Sunny Ads rows: {len(sunny_ads)}")

specialties = defaultdict(lambda: {'spend': 0.0, 'clicks': 0, 'impr': 0, 'conv': 0, 'rows': 0})

for r in sunny_ads:
    camp = r[1]
    # Extract department/speciality from campaign name
    dep = "Other"
    if "Dental" in camp: dep = "Dental"
    elif "Derma" in camp: dep = "Dermatology & Aesthetics"
    elif "ENT" in camp: dep = "ENT (Ear, Nose & Throat)"
    elif "Endo" in camp: dep = "Endocrinology"
    elif "FamilyMed" in camp: dep = "Family Medicine"
    elif "Gastro" in camp: dep = "Gastroenterology"
    elif "Gen_Surg" in camp: dep = "General Surgery"
    elif "General_Medicine" in camp: dep = "General Medicine"
    elif "Internal Medicine" in camp or "InternalMed" in camp: dep = "Internal Medicine"
    elif "Ob_Gyn" in camp: dep = "Gynecology & Obstetrics"
    elif "Ophthal" in camp: dep = "Ophthalmology (Eye Care)"
    elif "Ortho" in camp: dep = "Orthopedics"
    elif "Paedia" in camp or "Padiac" in camp: dep = "Pediatrics"

    try:
        impr = float(r[11].replace(',', '').strip() or 0)
        clicks = float(r[12].replace(',', '').strip() or 0)
        cost = float(r[16].replace(',', '').strip() or 0)
        conv = float(r[17].replace(',', '').strip() or 0)
    except:
        impr, clicks, cost, conv = 0, 0, 0, 0

    specialties[dep]['spend'] += cost
    specialties[dep]['clicks'] += clicks
    specialties[dep]['impr'] += impr
    specialties[dep]['conv'] += conv
    specialties[dep]['rows'] += 1

print("\n=== SUNNY CLINICS SPECIALITIES PERFORMANCE BREAKDOWN ===")
print(f"{'Speciality':30s} | {'Spend (AED)':12s} | {'Clicks':8s} | {'Impr':8s} | {'CTR %':7s} | {'CPC':6s} | {'Conversions':12s}")
print("-" * 95)
for dep, m in sorted(specialties.items(), key=lambda x: x[1]['spend'], reverse=True):
    ctr = (m['clicks'] / m['impr'] * 100) if m['impr'] > 0 else 0
    cpc = (m['spend'] / m['clicks']) if m['clicks'] > 0 else 0
    print(f"{dep:30s} | AED {m['spend']:10.2f} | {int(m['clicks']):8d} | {int(m['impr']):8d} | {ctr:6.2f}% | {cpc:5.2f} | {int(m['conv']):12d}")
