/**
 * NMC Healthcare (UAE) - Automated Campaign Name Intelligence & Parser Engine (V4)
 * 
 * Supports real Google Ads campaign formats:
 * - "Alo_NMC_Search_Padiac_Center_Al_Nahda_Dubai"
 * - "Alo_NMC_Search_Internal Medicine_Center_Samnan_Sun"
 * 
 * Extracts:
 * 1. Ad Account / Region (AUH, DXB, Northern Emirates, Sunny Clinics)
 * 2. Hospital Branch (e.g. NMC Specialty Al Nahda, NMC Royal Khalifa City, Sunny Samnan, etc.)
 * 3. Clinical Department / Speciality (e.g. Pediatrics, Cardiology, Orthopedics, etc.)
 * 4. Normalizes dates (M/D/YY, DD-MM-YYYY, YYYY-MM-DD)
 */

const NMC_PARSER = {
  // Ad Account & Territory Mappings
  regions: [
    { key: 'Sunny Clinics', label: 'Sunny Clinics (UAE)', patterns: [/\b_?sun\b/i, /sunny/i, /sunny\s*clinics/i, /sunny\s*medical/i, /samnan/i, /buhaira/i, /yarmook/i, /shahba/i, /meena/i] },
    { key: 'AUH', label: 'AUH (Abu Dhabi)', patterns: [/\bauh\b/i, /abu\s*dhabi/i, /\bcapital\b/i, /khalifa/i, /bareen/i, /al\s*ain/i, /electra/i, /mbz/i, /nmc\s*auh/i] },
    { key: 'DXB', label: 'DXB (Dubai)', patterns: [/\bdxb\b/i, /dubai/i, /al\s*nahda/i, /\bdip\b/i, /deira/i, /al\s*barsha/i, /barsha/i, /nmc\s*dxb/i] },
    { key: 'Northern Emirates', label: 'Northern Emirates', patterns: [/northern\s*emirates/i, /north\s*emirates/i, /\bnmc\s*north/i, /\bne\b/i, /sharjah/i, /\bshj\b/i, /ajman/i, /\bajm\b/i, /rak\b/i, /ras\s*al\s*khaimah/i, /fujairah/i, /\bfuj\b/i, /uaq\b/i, /umm\s*al\s*quwain/i, /rolla/i, /nmc\s*ne/i] }
  ],

  // Hospital & Facility Branches Mappings
  branches: [
    // Sunny Clinics
    { name: 'Sunny Medical Centre Samnan', region: 'Sunny Clinics', patterns: [/samnan/i, /center\s*samnan/i, /sunny\s*samnan/i] },
    { name: 'Sunny Al Buhaira Medical Centre', region: 'Sunny Clinics', patterns: [/buhaira/i, /buhariah/i, /corniche\s*buhaira/i, /sunny\s*buhaira/i] },
    { name: 'Sunny Al Yarmook Medical Centre', region: 'Sunny Clinics', patterns: [/yarmook/i, /sunny\s*yarmook/i] },
    { name: 'Sunny Medical Centre Shahba', region: 'Sunny Clinics', patterns: [/shahba/i, /sunny\s*shahba/i] },
    { name: 'Sunny Clinic Meena', region: 'Sunny Clinics', patterns: [/meena/i, /sunny\s*meena/i] },
    { name: 'Sunny Specialty Medical Centre', region: 'Sunny Clinics', patterns: [/sunny\s*specialty/i, /sunny\s*main/i, /sunny\s*center/i] },
    { name: 'Sunny Sharqan Medical Centre', region: 'Sunny Clinics', patterns: [/sharqan/i, /sunny\s*sharqan/i] },
    { name: 'Sunny Maysaloon Medical Centre', region: 'Sunny Clinics', patterns: [/maysaloon/i, /sunny\s*maysaloon/i] },
    { name: 'Sunny Medical Centre Al Majaz', region: 'Sunny Clinics', patterns: [/al[_\-]?majaz/i, /majaz/i] },
    { name: 'Sunny Medical Centre Safari Mall', region: 'Sunny Clinics', patterns: [/safari[_\-]?mall/i] },
    { name: 'Sunny Medical Centre Al Quoz', region: 'Sunny Clinics', patterns: [/al[_\-]?quoz/i, /quoz/i] },
    { name: 'Sunny Medical Centre Deira', region: 'Sunny Clinics', patterns: [/deira/i] },
    { name: 'Sunny Medical Centre Rolla', region: 'Sunny Clinics', patterns: [/rolla/i] },
    { name: 'Sunny Medical Centre Al Nahda', region: 'Sunny Clinics', patterns: [/al[_\s\-]*nahda/i, /nahda/i] },
    { name: 'Sunny Medical Centre RAK', region: 'Sunny Clinics', patterns: [/\brak\b/i] },

    // Abu Dhabi
    { name: 'NMC Royal Hospital Khalifa City', region: 'AUH', patterns: [/nmc\s*royal\s*khalifa/i, /royal\s*khalifa/i, /khalifacity/i, /khalifa\s*city/i, /khalifa/i, /rk_ad/i, /_rk_/i] },
    { name: 'NMC Royal Hospital Abu Dhabi', region: 'AUH', patterns: [/nmc\s*royal\s*hospital,\s*abu\s*dhabi/i, /nmc\s*royal\s*hospital\s*abu\s*dhabi/i, /royal\s*abu\s*dhabi/i] },
    { name: 'NMC Specialty Hospital Abu Dhabi', region: 'AUH', patterns: [/nmc\s*specialty\s*auh/i, /specialty\s*abu\s*dhabi/i, /electra/i, /madinat\s*zayed/i, /specialty\s*auh/i] },
    { name: 'NMC Bareen International Hospital', region: 'AUH', patterns: [/bareen/i, /bareen\s*hospital/i, /mbz\s*city/i, /mohammed\s*bin\s*zayed/i, /mbz/i, /mbzc/i, /_mbzc_/i] },
    { name: 'NMC Royal Women\'s Hospital', region: 'AUH', patterns: [/royal\s*women/i, /brightpoint/i, /womens\s*hospital/i, /roh_ad/i, /_roh_/i] },
    { name: 'NMC Medical Center Al Ain', region: 'AUH', patterns: [/al\s*ain/i, /nmc\s*al\s*ain/i] },

    // Dubai
    { name: 'NMC Specialty Hospital Al Nahda', region: 'DXB', patterns: [/al\s*nahda/i, /nahda/i, /specialty\s*dxb/i, /specialty\s*dubai/i, /nmc\s*al\s*nahda/i, /al_nahda/i] },
    { name: 'NMC Royal Hospital DIP', region: 'DXB', patterns: [/nmc\s*royal\s*dip/i, /\bdip\b/i, /dubai\s*investments\s*park/i, /royal\s*dip/i, /royal\s*hospital,\s*dip/i] },
    { name: 'NMC Medical Center Deira', region: 'DXB', patterns: [/deira/i, /nmc\s*deira/i, /al\s*rigga/i] },
    { name: 'NMC Day Surgery Al Barsha', region: 'DXB', patterns: [/al\s*barsha/i, /barsha/i, /day\s*surgery\s*barsha/i] },

    // Northern Emirates (Sharjah, Ajman, RAK)
    { name: 'NMC Royal Hospital Sharjah', region: 'Northern Emirates', patterns: [/royal\s*sharjah/i, /nmc\s*sharjah/i, /royal\s*shj/i, /al\s*zahra\s*building/i] },
    { name: 'NMC Medical Center Rolla', region: 'Northern Emirates', patterns: [/rolla/i, /nmc\s*rolla/i, /sharjah\s*rolla/i] },
    { name: 'NMC Medical Center Ajman', region: 'Northern Emirates', patterns: [/ajman/i, /nmc\s*ajman/i, /rashidiya/i] },
    { name: 'NMC Medical Center RAK', region: 'Northern Emirates', patterns: [/\brak\b/i, /ras\s*al\s*khaimah/i, /nmc\s*rak/i] }
  ],

  // Clinical Departments & Medical Specialities Mappings
  departments: [
    { name: 'Internal Medicine', patterns: [/internal\s*medicine/i, /internal\s*med/i, /internalmed/i, /general\s*medicine/i, /gp\b/i, /general\s*physician/i, /physician/i, /radiology/i, /nutrition/i] },
    { name: 'Cardiology', patterns: [/cardio/i, /heart/i, /cardiolog/i, /angioplasty/i, /ecg/i, /echo/i, /hypertension/i] },
    { name: 'Orthopedics', patterns: [/ortho/i, /bone/i, /joint/i, /knee/i, /spine/i, /arthroscopy/i, /fracture/i, /ligament/i, /hip\s*replacement/i] },
    { name: 'IVF & Fertility', patterns: [/\bivf\b/i, /fertil/i, /fakih/i, /iui/i, /embryo/i, /icsi/i, /conception/i, /infertility/i] },
    { name: 'Pediatrics', patterns: [/pedia/i, /paedia/i, /padiac/i, /child/i, /paediatric/i, /infant/i, /baby/i, /vaccination/i, /neonat/i] },
    { name: 'Gynecology & Obstetrics', patterns: [/gyn/i, /obs/i, /maternity/i, /pregnan/i, /delivery/i, /women/i, /c-section/i, /antenatal/i, /obstetrics/i, /gynaecology/i, /lactation/i, /foetal/i, /fetal/i] },
    { name: 'Dental', patterns: [/dent/i, /teeth/i, /orthodont/i, /implant/i, /braces/i, /root\s*canal/i, /veneer/i, /dentistry/i] },
    { name: 'Oncology', patterns: [/onco/i, /cancer/i, /tumor/i, /chemo/i, /radiation/i, /biopsy/i] },
    { name: 'Dermatology & Aesthetics', patterns: [/derma/i, /skin/i, /laser/i, /botox/i, /filler/i, /hair\s*loss/i, /hydrafacial/i, /aesthetic/i] },
    { name: 'ENT (Ear, Nose & Throat)', patterns: [/\bent\b/i, /ear/i, /nose/i, /throat/i, /sinus/i, /audiolog/i, /tonsil/i] },
    { name: 'Neurology & Neurosurgery', patterns: [/neuro/i, /brain/i, /stroke/i, /epilepsy/i, /migraine/i, /dementia/i] },
    { name: 'Gastroenterology', patterns: [/gastro/i, /endoscopy/i, /colonoscopy/i, /stomach/i, /liver/i, /\bgi\b/i, /gerd/i] },
    { name: 'General & Bariatric Surgery', patterns: [/general\s*surg/i, /bariatric/i, /surg/i, /hernia/i, /gallbladder/i, /appendix/i, /laparoscop/i, /weight\s*loss\s*surg/i, /laparoscopic/i] },
    { name: 'Ophthalmology (Eye Care)', patterns: [/ophthal/i, /eye/i, /lasik/i, /cataract/i, /vision/i, /glaucoma/i, /retina/i] },
    { name: 'Urology & Andrology', patterns: [/uro/i, /kidney\s*stone/i, /prostate/i, /androlog/i, /bladder/i] },
    { name: 'Physiotherapy & Rehab', patterns: [/physio/i, /rehab/i, /physical\s*therapy/i, /chiropractic/i, /pain\s*management/i] },
    { name: 'Family Medicine', patterns: [/familymed/i, /family\s*medicine/i, /family\s*doctor/i] },
    { name: 'Endocrinology', patterns: [/endo\b|endo_centre|endocrin/i] }
  ],

  // Campaign Types / Channels
  campaignTypes: [
    { type: 'Search', patterns: [/search/i, /exact/i, /phrase/i, /kw/i, /brand/i, /nonbrand/i] },
    { type: 'Performance Max', patterns: [/pmax/i, /performance\s*max/i] },
    { type: 'Display', patterns: [/display/i, /gdn/i, /banner/i] },
    { type: 'Demand Gen', patterns: [/demand\s*gen/i, /discovery/i] },
    { type: 'Video', patterns: [/video/i, /youtube/i] }
  ],

  /**
   * Normalize any date format to ISO YYYY-MM-DD
   */
  normalizeDate(rawDate) {
    if (!rawDate) return '2026-08-01';
    const str = String(rawDate).trim();
    if (!str) return '2026-08-01';

    // Format: YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

    // Format: M/D/YY or M/D/YYYY (e.g. "8/1/26" or "8/15/2026")
    const mdy = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
    if (mdy) {
      let month = mdy[1].padStart(2, '0');
      let day = mdy[2].padStart(2, '0');
      let year = mdy[3];
      if (year.length === 2) year = '20' + year;
      return `${year}-${month}-${day}`;
    }

    // Format: DD-MM-YYYY or DD/MM/YYYY (e.g. "22-07-2026")
    const dmy = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (dmy) {
      let day = dmy[1].padStart(2, '0');
      let month = dmy[2].padStart(2, '0');
      let year = dmy[3];
      return `${year}-${month}-${day}`;
    }

    // Format: "22 Jul 2026, 12:22"
    const textDate = new Date(str);
    if (!isNaN(textDate.getTime())) {
      return textDate.toISOString().split('T')[0];
    }

    return '2026-08-01';
  },

  /**
   * Parse a raw campaign name string and extract all structured metadata
   */
  parseCampaign(campaignName = '', accountHint = '') {
    const raw = String(campaignName).trim();
    if (!raw) {
      return {
        adAccount: accountHint || 'AUH',
        hospitalBranch: 'NMC Royal Hospital Khalifa City',
        department: 'Internal Medicine',
        campaignType: 'Search',
        language: 'English',
        intent: 'General',
        confidence: 0.5
      };
    }

    let detectedRegion = '';
    let detectedBranch = '';
    let detectedDepartment = '';
    let detectedType = 'Search';
    let detectedLang = /_ar\b|arabic/i.test(raw) ? 'Arabic' : 'English';
    let detectedIntent = /exact/i.test(raw) ? 'Exact High-Intent' : /brand/i.test(raw) ? 'Brand' : 'Non-Brand / Category';

    // 1. Check for 'Sun' / Sunny Clinics specific suffix/token (e.g. ..._Sun or ..._Sunny)
    const isSunny = /_sun\b|_sunny\b|\bsun\b|\bsunny\b/i.test(raw) || /sunny/i.test(accountHint);
    if (isSunny) {
      detectedRegion = 'Sunny Clinics';
    }

    // 2. Detect Region from Account Hint (e.g. "NMC DXB", "NMC AUH", "NMC NE")
    if (!detectedRegion && accountHint) {
      for (const r of this.regions) {
        if (r.key.toLowerCase() === accountHint.toLowerCase() || r.patterns.some(p => p.test(accountHint))) {
          detectedRegion = r.key;
          break;
        }
      }
    }

    // 3. Detect Branch — scope by region to avoid cross-region mismatches
    if (isSunny) {
      // Only try Sunny branches
      for (const b of this.branches) {
        if (b.region !== 'Sunny Clinics') continue;
        for (const pattern of b.patterns) {
          if (pattern.test(raw)) {
            detectedBranch = b.name;
            break;
          }
        }
        if (detectedBranch) break;
      }
    } else {
      // Skip Sunny-only branches (they share location names with DXB/NE)
      for (const b of this.branches) {
        if (b.region === 'Sunny Clinics') continue;
        for (const pattern of b.patterns) {
          if (pattern.test(raw)) {
            detectedBranch = b.name;
            if (!detectedRegion) detectedRegion = b.region;
            break;
          }
        }
        if (detectedBranch) break;
      }
    }

    // 4. Detect Region from campaign name if still unresolved
    if (!detectedRegion) {
      for (const r of this.regions) {
        for (const pattern of r.patterns) {
          if (pattern.test(raw)) {
            detectedRegion = r.key;
            break;
          }
        }
        if (detectedRegion) break;
      }
    }

    // Fallback region
    if (!detectedRegion) detectedRegion = 'AUH';

    // Fallback branch
    if (!detectedBranch) {
      if (detectedRegion === 'Sunny Clinics') detectedBranch = 'Sunny Medical Centre Samnan';
      else if (detectedRegion === 'AUH') detectedBranch = 'NMC Royal Hospital Khalifa City';
      else if (detectedRegion === 'DXB') detectedBranch = 'NMC Specialty Hospital Al Nahda';
      else if (detectedRegion === 'Northern Emirates') detectedBranch = 'NMC Royal Hospital Sharjah';
      else detectedBranch = 'NMC Royal Hospital Khalifa City';
    }

    // 5. Detect Department / Speciality
    for (const d of this.departments) {
      for (const pattern of d.patterns) {
        if (pattern.test(raw)) {
          detectedDepartment = d.name;
          break;
        }
      }
      if (detectedDepartment) break;
    }

    if (!detectedDepartment) {
      detectedDepartment = 'Internal Medicine';
    }

    // 6. Detect Campaign Type
    for (const t of this.campaignTypes) {
      for (const pattern of t.patterns) {
        if (pattern.test(raw)) {
          detectedType = t.type;
          break;
        }
      }
      if (detectedType !== 'Search') break;
    }

    return {
      adAccount: detectedRegion,
      hospitalBranch: detectedBranch,
      department: detectedDepartment,
      campaignType: detectedType,
      language: detectedLang,
      intent: detectedIntent,
      confidence: (detectedBranch && detectedDepartment) ? 1.0 : (detectedBranch || detectedDepartment) ? 0.85 : 0.65
    };
  },

  normalizeDepartment(depName = '') {
    const raw = String(depName).trim();
    if (!raw) return 'Internal Medicine';
    for (const d of this.departments) {
      if (d.name.toLowerCase() === raw.toLowerCase()) return d.name;
      for (const pattern of d.patterns) {
        if (pattern.test(raw)) return d.name;
      }
    }
    return raw;
  },

  normalizeBranch(branchName = '') {
    const raw = String(branchName).trim();
    if (!raw) return 'NMC Royal Hospital Khalifa City';
    for (const b of this.branches) {
      if (b.name.toLowerCase() === raw.toLowerCase()) return b.name;
      for (const pattern of b.patterns) {
        if (pattern.test(raw)) return b.name;
      }
    }
    return raw;
  }
};

if (typeof window !== 'undefined') {
  window.NMC_PARSER = NMC_PARSER;
}
