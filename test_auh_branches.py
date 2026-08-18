import re

auh_camps = [
    'Alo_ARB_NMC_Search_Gen_Surg_RH_AD_MBZC',
    'Alo_ARB_NMC_Search_Ob_gyn_RH_AD_MBZC_V2',
    'Alo_ARB_NMC_Search_Padiac_RH_AD_MBZC',
    'Alo_NMC_Search_Cardiology_RK_AD',
    'Alo_NMC_Search_FamilyMed_ROH_AD',
    'Alo_NMC_Search_Foetal_Medicine_ROH_AD',
    'Alo_NMC_Search_Gen_Surg_RH_AD_MBZC',
    'Alo_NMC_Search_Gen_Surg_RK_AD',
    'Alo_NMC_Search_InternalMed_ROH_AD',
    'Alo_NMC_Search_LactationServices_ROH_AD',
    'Alo_NMC_Search_Neonatology_ROH_AD',
    'Alo_NMC_Search_Nutrition_ROH_AD',
    'Alo_NMC_Search_Ob_Gyn_ROH_AD',
    'Alo_NMC_Search_Ob_gyn_RH_AD_MBZC_V2',
    'Alo_NMC_Search_Ob_gyn_RK_AD_V2',
    'Alo_NMC_Search_Padiac_RH_AD_MBZC',
    'Alo_NMC_Search_Padiac_RK_AD',
    'Alo_NMC_Search_Padiac_ROH_AD',
    'Alo_NMC_Search_Physiotherapy_ROH_AD',
    'Alo_NMC_Search_Radiology_ROH_AD'
]

branches = [
    {'name': "NMC Royal Women's Hospital", 'patterns': [re.compile(p, re.I) for p in [r'royal\s*women', r'brightpoint', r'womens\s*hospital', r'roh_ad', r'_roh_']]},
    {'name': "NMC Bareen International Hospital", 'patterns': [re.compile(p, re.I) for p in [r'bareen', r'mbz\s*city', r'mbz', r'mbzc']]},
    {'name': "NMC Royal Hospital Khalifa City", 'patterns': [re.compile(p, re.I) for p in [r'khalifa', r'rk_ad', r'_rk_']]}
]

for c in auh_camps:
    matched = "UNMATCHED"
    for b in branches:
        if any(p.search(c) for p in b['patterns']):
            matched = b['name']
            break
    print(f"Campaign: {c:45s} => Branch: {matched}")
