
/* NMC Healthcare (UAE) Performance Marketing & CRM Dashboard Unified Engine */

/* === js/parser.js === */
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
    { name: 'Sunny Al Buhaira Medical Centre', region: 'Sunny Clinics', patterns: [/buhaira/i, /corniche\s*buhaira/i, /sunny\s*buhaira/i] },
    { name: 'Sunny Al Yarmook Medical Centre', region: 'Sunny Clinics', patterns: [/yarmook/i, /sunny\s*yarmook/i] },
    { name: 'Sunny Medical Centre Shahba', region: 'Sunny Clinics', patterns: [/shahba/i, /sunny\s*shahba/i] },
    { name: 'Sunny Clinic Meena', region: 'Sunny Clinics', patterns: [/meena/i, /sunny\s*meena/i] },
    { name: 'Sunny Specialty Medical Centre', region: 'Sunny Clinics', patterns: [/sunny\s*specialty/i, /sunny\s*main/i, /sunny\s*center/i] },

    // Abu Dhabi
    { name: 'NMC Royal Hospital Khalifa City', region: 'AUH', patterns: [/nmc\s*royal\s*khalifa/i, /royal\s*khalifa/i, /khalifacity/i, /khalifa\s*city/i, /khalifa/i] },
    { name: 'NMC Royal Hospital Abu Dhabi', region: 'AUH', patterns: [/nmc\s*royal\s*hospital,\s*abu\s*dhabi/i, /nmc\s*royal\s*hospital\s*abu\s*dhabi/i, /royal\s*abu\s*dhabi/i] },
    { name: 'NMC Specialty Hospital Abu Dhabi', region: 'AUH', patterns: [/nmc\s*specialty\s*auh/i, /specialty\s*abu\s*dhabi/i, /electra/i, /madinat\s*zayed/i, /specialty\s*auh/i] },
    { name: 'NMC Bareen International Hospital', region: 'AUH', patterns: [/bareen/i, /bareen\s*hospital/i, /mbz\s*city/i, /mohammed\s*bin\s*zayed/i, /mbz/i] },
    { name: 'NMC Royal Women\'s Hospital', region: 'AUH', patterns: [/royal\s*women/i, /brightpoint/i, /womens\s*hospital/i] },
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
    { name: 'Internal Medicine', patterns: [/internal\s*medicine/i, /internal\s*med/i, /general\s*medicine/i, /family\s*med/i, /\bgp\b/i, /general\s*physician/i, /physician/i, /radiology/i] },
    { name: 'Cardiology', patterns: [/cardio/i, /heart/i, /cardiolog/i, /angioplasty/i, /ecg/i, /echo/i, /hypertension/i] },
    { name: 'Orthopedics', patterns: [/ortho/i, /bone/i, /joint/i, /knee/i, /spine/i, /arthroscopy/i, /fracture/i, /ligament/i, /hip\s*replacement/i] },
    { name: 'IVF & Fertility', patterns: [/\bivf\b/i, /fertil/i, /fakih/i, /iui/i, /embryo/i, /icsi/i, /conception/i, /infertility/i] },
    { name: 'Pediatrics', patterns: [/pedia/i, /padiac/i, /child/i, /paediatric/i, /infant/i, /baby/i, /vaccination/i, /neonatal/i] },
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
    { name: 'Physiotherapy & Rehab', patterns: [/physio/i, /rehab/i, /physical\s*therapy/i, /chiropractic/i, /pain\s*management/i] }
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

    // 3. Detect Branch
    for (const b of this.branches) {
      for (const pattern of b.patterns) {
        if (pattern.test(raw)) {
          detectedBranch = b.name;
          if (!detectedRegion) detectedRegion = b.region;
          break;
        }
      }
      if (detectedBranch) break;
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


/* === js/analytics.js === */
/**
 * NMC Healthcare (UAE) - Performance Analytics Engine (V4 - No Revenue / Booking & CPBA Focused)
 */

const NMC_ANALYTICS = {
  
  filterData(adsData, leadsData, filters) {
    let filteredAds = [...adsData];
    let filteredLeads = [...leadsData];

    // 1. Date Filtering
    if (filters.startDate && filters.endDate) {
      filteredAds = filteredAds.filter(a => a.Date >= filters.startDate && a.Date <= filters.endDate);
      filteredLeads = filteredLeads.filter(l => {
        const leadDate = (l['Created At'] || '').split(' ')[0];
        return leadDate >= filters.startDate && leadDate <= filters.endDate;
      });
    }

    // 2. Ad Account / Territory
    if (filters.adAccount && filters.adAccount !== 'ALL') {
      filteredAds = filteredAds.filter(a => a.Ad_Account === filters.adAccount);
      filteredLeads = filteredLeads.filter(l => l.Ad_Account === filters.adAccount);
    }

    // 3. Hospital Branch
    if (filters.hospitalBranch && filters.hospitalBranch !== 'ALL') {
      filteredAds = filteredAds.filter(a => a.Hospital_Branch === filters.hospitalBranch);
      filteredLeads = filteredLeads.filter(l => l.Branch === filters.hospitalBranch);
    }

    // 4. Clinical Department
    if (filters.department && filters.department !== 'ALL') {
      filteredAds = filteredAds.filter(a => a.Department_Speciality === filters.department);
      filteredLeads = filteredLeads.filter(l => l.Department === filters.department);
    }

    // 5. Doctor
    if (filters.doctor && filters.doctor !== 'ALL') {
      filteredLeads = filteredLeads.filter(l => l.Doctor === filters.doctor);
    }

    // 6. Lead Status
    if (filters.leadStatus && filters.leadStatus !== 'ALL') {
      filteredLeads = filteredLeads.filter(l => l.Status === filters.leadStatus);
    }

    // 7. Search Query
    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase().trim();
      filteredAds = filteredAds.filter(a => 
        (a.Keyword && a.Keyword.toLowerCase().includes(q)) ||
        (a.Campaign_Name && a.Campaign_Name.toLowerCase().includes(q)) ||
        (a.Hospital_Branch && a.Hospital_Branch.toLowerCase().includes(q)) ||
        (a.Department_Speciality && a.Department_Speciality.toLowerCase().includes(q))
      );
      filteredLeads = filteredLeads.filter(l =>
        (l.Patient && l.Patient.toLowerCase().includes(q)) ||
        (l.Doctor && l.Doctor.toLowerCase().includes(q)) ||
        (l.Branch && l.Branch.toLowerCase().includes(q)) ||
        (l.Department && l.Department.toLowerCase().includes(q))
      );
    }

    return { filteredAds, filteredLeads };
  },

  computeExecutiveMetrics(ads, leads) {
    const totalImpressions = ads.reduce((sum, a) => sum + (a.Impressions || 0), 0);
    const totalClicks = ads.reduce((sum, a) => sum + (a.Clicks || 0), 0);
    const totalSpend = ads.reduce((sum, a) => sum + (a.Cost || 0), 0);
    const totalGoogleConv = ads.reduce((sum, a) => sum + (a.Conversions || 0), 0);

    const totalLeads = leads.length;
    const totalBooked = leads.filter(l => l.Status === 'Booked' || l.Status === 'Attended' || l.Status === 'Surgery Scheduled').length;
    const totalAttended = leads.filter(l => l.Status === 'Attended' || l.Status === 'Surgery Scheduled').length;
    const totalSurgeries = leads.filter(l => l.Status === 'Surgery Scheduled').length;
    const totalNotBooked = leads.filter(l => l.Status === 'Not Booked' || l.Status === 'Follow Up' || l.Status === 'No Show').length;

    const overallAvgCPC = totalClicks > 0 ? (totalSpend / totalClicks) : 0;
    const overallCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100) : 0;
    const googleConvRate = totalClicks > 0 ? ((totalGoogleConv / totalClicks) * 100) : 0;
    const googleCPA = totalGoogleConv > 0 ? (totalSpend / totalGoogleConv) : 0;

    const bookingRate = totalLeads > 0 ? ((totalBooked / totalLeads) * 100) : 0;
    const attendanceRate = totalBooked > 0 ? ((totalAttended / totalBooked) * 100) : 0;
    const cpba = totalBooked > 0 ? (totalSpend / totalBooked) : 0; // Cost Per Booked Appointment

    const weightedTopIS = ads.reduce((sum, a) => sum + ((a.Search_Top_IS || 0) * (a.Impressions || 0)), 0);
    const avgTopIS = totalImpressions > 0 ? Math.min(100, Math.max(0, weightedTopIS / totalImpressions)) : 75.0;

    // Response time calculation
    let totalRespMins = 0;
    let respCount = 0;
    leads.forEach(l => {
      const match = (l['Response Time'] || '').match(/(\d+)/);
      if (match) {
        totalRespMins += parseInt(match[1], 10);
        respCount++;
      }
    });
    const avgResponseTimeMins = respCount > 0 ? (totalRespMins / respCount).toFixed(1) : '4.5';

    return {
      totalImpressions,
      totalClicks,
      totalSpend,
      totalGoogleConv,
      totalLeads,
      totalBooked,
      totalAttended,
      totalSurgeries,
      totalNotBooked,
      overallAvgCPC,
      overallCTR,
      googleConvRate,
      googleCPA,
      bookingRate,
      attendanceRate,
      cpba,
      avgTopIS,
      avgResponseTimeMins
    };
  },

  getRegionalBreakdown(ads, leads) {
    const territories = ['AUH', 'DXB', 'Northern Emirates', 'Sunny Clinics'];
    return territories.map(t => {
      const tAds = ads.filter(a => a.Ad_Account === t);
      const tLeads = leads.filter(l => l.Ad_Account === t);
      const m = this.computeExecutiveMetrics(tAds, tLeads);
      return {
        territory: t,
        ...m
      };
    });
  },

  getDepartmentBreakdown(ads, leads) {
    const depMap = {};
    ads.forEach(a => {
      const dep = a.Department_Speciality || 'General Medicine';
      if (!depMap[dep]) {
        depMap[dep] = { department: dep, spend: 0, clicks: 0, impr: 0, conversions: 0 };
      }
      depMap[dep].spend += (a.Cost || 0);
      depMap[dep].clicks += (a.Clicks || 0);
      depMap[dep].impr += (a.Impressions || 0);
      depMap[dep].conversions += (a.Conversions || 0);
    });

    const results = Object.keys(depMap).map(dep => {
      const depLeads = leads.filter(l => l.Department === dep);
      const booked = depLeads.filter(l => l.Status === 'Booked' || l.Status === 'Attended' || l.Status === 'Surgery Scheduled').length;
      const attended = depLeads.filter(l => l.Status === 'Attended' || l.Status === 'Surgery Scheduled').length;
      const surgeries = depLeads.filter(l => l.Status === 'Surgery Scheduled').length;
      const spend = depMap[dep].spend || 0;
      const clicks = depMap[dep].clicks || 0;
      const impr = depMap[dep].impr || 0;
      const conv = depMap[dep].conversions || 0;
      const cpba = booked > 0 ? (spend / booked) : 0;
      const bookingRate = depLeads.length > 0 ? ((booked / depLeads.length) * 100) : 0;

      return {
        department: dep,
        totalSpend: spend,
        totalClicks: clicks,
        totalImpressions: impr,
        totalConversions: conv,
        totalLeads: depLeads.length,
        totalBooked: booked,
        totalAttended: attended,
        totalSurgeries: surgeries,
        bookingRate,
        cpba
      };
    });

    return results.sort((a, b) => b.totalSpend - a.totalSpend);
  },

  getCallCenterAnalysis(leads) {
    const lostReasonsCount = {};
    const doctorVolume = {};
    const agentPerformance = {};

    leads.forEach(l => {
      if (l.Lost_Reason && (l.Status === 'Not Booked' || l.Status === 'Follow Up' || l.Status === 'No Show')) {
        lostReasonsCount[l.Lost_Reason] = (lostReasonsCount[l.Lost_Reason] || 0) + 1;
      }
      if (l.Doctor) {
        if (!doctorVolume[l.Doctor]) {
          doctorVolume[l.Doctor] = { doctor: l.Doctor, branch: l.Branch, dep: l.Department, totalLeads: 0, booked: 0, attended: 0, surgeries: 0 };
        }
        doctorVolume[l.Doctor].totalLeads++;
        if (l.Status === 'Booked' || l.Status === 'Attended' || l.Status === 'Surgery Scheduled') doctorVolume[l.Doctor].booked++;
        if (l.Status === 'Attended' || l.Status === 'Surgery Scheduled') doctorVolume[l.Doctor].attended++;
        if (l.Status === 'Surgery Scheduled') doctorVolume[l.Doctor].surgeries++;
      }
      if (l['Handled By']) {
        const ag = l['Handled By'];
        if (!agentPerformance[ag]) {
          agentPerformance[ag] = { agent: ag, total: 0, booked: 0 };
        }
        agentPerformance[ag].total++;
        if (l.Status === 'Booked' || l.Status === 'Attended' || l.Status === 'Surgery Scheduled') agentPerformance[ag].booked++;
      }
    });

    return {
      lostReasonsCount,
      doctorList: Object.values(doctorVolume).sort((a, b) => b.booked - a.booked),
      agentList: Object.values(agentPerformance).sort((a, b) => b.booked - a.booked)
    };
  },

  determineNextStep(item) {
    const cost = item.cost || 0;
    const clicks = item.clicks || 0;
    const booked = item.booked || 0;
    const qs = item.qs || 7;
    const topIS = item.topIS || 70;
    const lostBudget = item.lostBudget || 0;
    const lostRank = item.lostRank || 0;
    const match = item.match || 'Exact';
    const lpExp = item.lpExp || 'Average';

    // 1. High Booking Efficiency & Capped by Budget -> Scale Budget
    if (booked >= 3 && lostBudget > 10) {
      return {
        actionKey: 'SCALE',
        title: '🚀 Scale Budget (+25%)',
        badgeClass: 'badge-scale',
        directive: `High patient booking volume (${booked} booked appts). Increase daily budget to recover ${lostBudget.toFixed(0)}% lost impression share.`
      };
    }

    // 2. High Quality Score & Low Top IS -> Boost Max CPC
    if (qs >= 8 && topIS < 70 && lostRank > 8) {
      return {
        actionKey: 'BID_UP',
        title: '📈 Boost Max CPC (+15%)',
        badgeClass: 'badge-bid-up',
        directive: `Strong Quality Score (${qs}/10) but Top IS is only ${topIS.toFixed(0)}%. Raise bid to capture position #1.`
      };
    }

    // 3. Low Quality Score / Poor Landing Page -> Fix LP & Ad Copy
    if (qs <= 5 || lpExp === 'Below average') {
      return {
        actionKey: 'LANDING_PAGE',
        title: '⚡ Fix Landing Page & QS',
        badgeClass: 'badge-warning',
        directive: `Low Quality Score (${qs}/10) inflating CPC. Improve mobile doctor bio, arabic copy, and WhatsApp CTA.`
      };
    }

    // 4. Zero Bookings & High Spend -> Pause Broad / Add Negative
    if (cost > 250 && booked === 0 && (match === 'Broad' || clicks > 30)) {
      return {
        actionKey: 'PAUSE',
        title: '🛑 Pause Broad & Negative',
        badgeClass: 'badge-pause',
        directive: `Spent AED ${Math.round(cost)} with 0 confirmed bookings. Pause keyword and add negative exact terms.`
      };
    }

    // 5. High Top IS & Low Bookings -> Lower Max CPC
    if (topIS > 90 && booked <= 1 && cost > 180) {
      return {
        actionKey: 'BID_DOWN',
        title: '📉 Lower Max CPC (-20%)',
        badgeClass: 'badge-bid-down',
        directive: `Overpaying for Absolute Top position (${topIS.toFixed(0)}% Top IS) with low booking yield. Trim Max CPC.`
      };
    }

    // 6. Healthy & In-Target
    return {
      actionKey: 'MAINTAIN',
      title: '✅ Maintain & Monitor',
      badgeClass: 'badge-scale',
      directive: 'Performance is healthy and within target booking & CPBA benchmarks.'
    };
  }
};

if (typeof window !== 'undefined') {
  window.NMC_ANALYTICS = NMC_ANALYTICS;
}


/* === js/charts.js === */
/**
 * NMC Healthcare (UAE) - Chart Visualizations Engine
 * 
 * Uses Chart.js to render interactive, hospital enterprise-grade charts.
 */

const NMC_CHARTS = {
  instances: {},

  // Color tokens tailored for NMC Healthcare
  colors: {
    primaryTeal: '#00a896',
    darkNavy: '#0b2545',
    brightCyan: '#028090',
    lightTeal: '#05668d',
    softBlue: '#48cae4',
    accentCoral: '#e63946',
    emeraldGreen: '#2a9d8f',
    amberOrange: '#f4a261',
    purpleIndigo: '#7209b7',
    gridLines: 'rgba(19, 64, 116, 0.08)',
    textMuted: '#64748b',
    textDark: '#1e293b'
  },

  destroyChart(id) {
    if (this.instances[id]) {
      this.instances[id].destroy();
      delete this.instances[id];
    }
  },

  /**
   * Render Acquisition Funnel Chart
   */
  renderFunnelChart(canvasId, metrics) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const stages = [
      { label: '1. Ad Impressions', val: metrics.totalImpressions, color: '#05668d' },
      { label: '2. Ad Clicks', val: metrics.totalClicks, color: '#028090' },
      { label: '3. Call Center Leads', val: metrics.totalLeads, color: '#00a896' },
      { label: '4. Confirmed Booked', val: metrics.totalBooked, color: '#2a9d8f' },
      { label: '5. Attended Patients', val: metrics.totalAttended, color: '#52b788' },
      { label: '6. Surgeries / Procedures', val: metrics.totalSurgeries, color: '#7209b7' }
    ];

    this.instances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: stages.map(s => s.label),
        datasets: [{
          data: stages.map(s => s.val),
          backgroundColor: stages.map(s => s.color),
          borderRadius: 6,
          barThickness: 28
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return ` Volume: ${context.raw.toLocaleString()}`;
              }
            }
          }
        },
        scales: {
          x: {
            type: 'logarithmic',
            grid: { color: this.colors.gridLines },
            ticks: {
              color: this.colors.textMuted,
              callback: function(val) {
                if (val === 10 || val === 100 || val === 1000 || val === 10000 || val === 100000) return val.toLocaleString();
                return '';
              }
            }
          },
          y: {
            grid: { display: false },
            ticks: { color: this.colors.textDark, font: { weight: '600', size: 12 } }
          }
        }
      }
    });
  },

  /**
   * Render Regional Performance Comparison (Spend vs Revenue & ROAS)
   */
  renderRegionalChart(canvasId, regionalData) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const labels = regionalData.map(r => r.territory);
    const spend = regionalData.map(r => Math.round(r.totalSpend));
    const revenue = regionalData.map(r => Math.round(r.totalRevenue));
    const roas = regionalData.map(r => Number(r.blendedROAS.toFixed(1)));

    this.instances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Ad Spend (AED)',
            data: spend,
            backgroundColor: '#028090',
            borderRadius: 6,
            yAxisID: 'y'
          },
          {
            label: 'Hospital Revenue (AED)',
            data: revenue,
            backgroundColor: '#2a9d8f',
            borderRadius: 6,
            yAxisID: 'y'
          },
          {
            label: 'ROAS (x)',
            data: roas,
            type: 'line',
            borderColor: '#e76f51',
            backgroundColor: '#e76f51',
            borderWidth: 3,
            pointRadius: 6,
            pointHoverRadius: 8,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top', labels: { font: { weight: '600' } } },
          tooltip: {
            callbacks: {
              label: function(context) {
                if (context.dataset.type === 'line') return ` ROAS: ${context.raw}x`;
                return ` ${context.dataset.label}: AED ${context.raw.toLocaleString()}`;
              }
            }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            type: 'linear',
            position: 'left',
            grid: { color: this.colors.gridLines },
            ticks: {
              callback: val => `AED ${(val / 1000).toFixed(0)}k`
            }
          },
          y1: {
            type: 'linear',
            position: 'right',
            grid: { display: false },
            ticks: { callback: val => `${val}x` }
          }
        }
      }
    });
  },

  /**
   * Render Speciality Revenue & ROAS Bubble/Bar Matrix
   */
  renderSpecialityChart(canvasId, departments) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const topDeps = departments.slice(0, 10);
    const labels = topDeps.map(d => d.department);
    const revenue = topDeps.map(d => Math.round(d.totalRevenue));
    const spend = topDeps.map(d => Math.round(d.totalSpend));

    this.instances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Patient Revenue (AED)',
            data: revenue,
            backgroundColor: '#00a896',
            borderRadius: 6
          },
          {
            label: 'Google Ads Spend (AED)',
            data: spend,
            backgroundColor: '#05668d',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: function(context) {
                return ` ${context.dataset.label}: AED ${context.raw.toLocaleString()}`;
              }
            }
          }
        },
        scales: {
          x: {
            ticks: {
              maxRotation: 30,
              minRotation: 30,
              font: { size: 11 }
            },
            grid: { display: false }
          },
          y: {
            grid: { color: this.colors.gridLines },
            ticks: { callback: val => `AED ${(val / 1000).toFixed(0)}k` }
          }
        }
      }
    });
  },

  /**
   * Render Top of Page Rate vs Quality Score Scatter Matrix
   */
  renderTopISScatterChart(canvasId, ads) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    // Aggregate unique keywords for clean scatter
    const kwMap = {};
    ads.forEach(a => {
      if (!kwMap[a.Keyword]) {
        kwMap[a.Keyword] = {
          x: a.Quality_Score || 7,
          y: a.Search_Top_IS || 70,
          r: Math.min(22, Math.max(5, Math.round(Math.sqrt((a.Conversions || 1) * 8)))),
          kw: a.Keyword,
          cpc: a.Avg_CPC,
          cost: a.Cost,
          conv: a.Conversions
        };
      }
    });

    const scatterData = Object.values(kwMap);

    this.instances[canvasId] = new Chart(ctx, {
      type: 'bubble',
      data: {
        datasets: [{
          label: 'Keywords (Bubble size = Conversion Volume)',
          data: scatterData,
          backgroundColor: 'rgba(0, 168, 150, 0.65)',
          borderColor: '#00a896',
          borderWidth: 1.5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                const p = context.raw;
                return [
                  ` Keyword: "${p.kw}"`,
                  ` Quality Score: ${p.x}/10`,
                  ` Top of Page Rate: ${p.y}%`,
                  ` Total Conversions: ${p.conv}`,
                  ` Avg CPC: AED ${p.cpc}`
                ];
              }
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Quality Score (1-10)', font: { weight: '600' } },
            min: 1,
            max: 10,
            grid: { color: this.colors.gridLines }
          },
          y: {
            title: { display: true, text: 'Search Top of Page Rate (%)', font: { weight: '600' } },
            min: 20,
            max: 100,
            grid: { color: this.colors.gridLines },
            ticks: { callback: val => `${val}%` }
          }
        }
      }
    });
  },

  /**
   * Render Call Center Lead Disposition Donut
   */
  renderLeadDispositionDonut(canvasId, statusCounts) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const labels = Object.keys(statusCounts);
    const data = Object.values(statusCounts);

    const paletteMap = {
      'Booked': '#2a9d8f',
      'Attended': '#00a896',
      'Surgery Scheduled': '#7209b7',
      'Not Booked': '#e63946',
      'No Show': '#f4a261',
      'Follow Up': '#028090',
      'Inquiry Only': '#64748b'
    };

    const bgColors = labels.map(l => paletteMap[l] || '#05668d');

    this.instances[canvasId] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: bgColors,
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: { position: 'right', labels: { boxWidth: 14, font: { size: 12 } } },
          tooltip: {
            callbacks: {
              label: function(context) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const pct = ((context.raw / total) * 100).toFixed(1);
                return ` ${context.label}: ${context.raw.toLocaleString()} (${pct}%)`;
              }
            }
          }
        }
      }
    });
  },

  /**
   * Render Lost Reasons Pareto Chart
   */
  renderLostReasonsChart(canvasId, lostReasonsMap) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const sorted = Object.entries(lostReasonsMap).sort((a, b) => b[1] - a[1]).slice(0, 7);
    const labels = sorted.map(s => s[0].length > 30 ? s[0].slice(0, 30) + '...' : s[0]);
    const counts = sorted.map(s => s[1]);

    this.instances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Lost Inquiries Count',
          data: counts,
          backgroundColor: '#e76f51',
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` Lost Leads: ${ctx.raw.toLocaleString()}`
            }
          }
        },
        scales: {
          x: { grid: { color: this.colors.gridLines } },
          y: { grid: { display: false }, ticks: { font: { size: 11 } } }
        }
      }
    });
  }
};

if (typeof window !== 'undefined') {
  window.NMC_CHARTS = NMC_CHARTS;
}


/* === js/chatbot.js === */
/**
 * NMC Healthcare (UAE) - Marketing Intelligence AI Copilot Engine (V4 - No Revenue / Booking & CPBA Focus)
 */

const NMC_CHATBOT = {
  chatHistory: [],

  init() {
    this.chatHistory = [
      {
        role: 'assistant',
        text: `👋 **Hello! I am your NMC Performance Marketing & Patient Acquisition Copilot.**\n\nI analyze multi-location Google Ads performance combined with Call Center patient lead outcomes across **AUH, DXB, Northern Emirates, and Sunny Clinics**.\n\nHere are some questions you can ask me:\n- *"Which clinical specialities have the highest confirmed bookings and lowest CPBA?"*\n- *"How is Sunny Clinics performing in Samnan for Internal Medicine?"*\n- *"What are our recommended next steps to cut CPC by 25% across Abu Dhabi?"*\n- *"What is our call center show-up rate and top lost reasons?"*\n- *"Show doctor appointment volume for Dr. Sanjay Sharma or Dr. Hisham Qasim."*`
      }
    ];
  },

  processQuery(rawQuery, currentFilters = {}) {
    const q = rawQuery.toLowerCase().trim();

    const { filteredAds, filteredLeads } = NMC_ANALYTICS.filterData(
      NMC_DATA_STORE.adsData,
      NMC_DATA_STORE.leadsData,
      currentFilters
    );

    const exec = NMC_ANALYTICS.computeExecutiveMetrics(filteredAds, filteredLeads);
    const regions = NMC_ANALYTICS.getRegionalBreakdown(filteredAds, filteredLeads);
    const departments = NMC_ANALYTICS.getDepartmentBreakdown(filteredAds, filteredLeads);
    const cc = NMC_ANALYTICS.getCallCenterAnalysis(filteredLeads);

    // Query 1: Highest bookings / top specialities / CPBA
    if (q.includes('specialit') || q.includes('department') || q.includes('booking') || q.includes('cpba') || q.includes('highest')) {
      const top3 = departments.slice(0, 4);
      let res = `### 🏆 Top Clinical Specialities by Confirmed Bookings & CPBA\n\n`;
      res += `Here is how the clinical departments rank across your UAE accounts:\n\n`;
      res += `| Department | Spend (AED) | Inbound Leads | Booked Appts | Booking Rate | CPBA (AED) | Surgeries |\n`;
      res += `|---|---|---|---|---|---|---|\n`;
      top3.forEach(d => {
        res += `| **${d.department}** | AED ${Math.round(d.totalSpend).toLocaleString()} | ${d.totalLeads} | **${d.totalBooked}** | ${d.bookingRate.toFixed(1)}% | AED ${d.cpba.toFixed(2)} | ${d.totalSurgeries} |\n`;
      });
      res += `\n**Strategic Takeaway:** **${top3[0].department}** is generating the highest volume of patient appointments at a healthy CPBA of **AED ${top3[0].cpba.toFixed(2)}**. Consider allocating incremental budget to high-intent exact search terms.`;
      return res;
    }

    // Query 2: Sunny Clinics / Samnan
    if (q.includes('samnan') || q.includes('sunny')) {
      const samnanAds = filteredAds.filter(a => a.Hospital_Branch && a.Hospital_Branch.includes('Samnan'));
      const samnanLeads = filteredLeads.filter(l => l.Branch && l.Branch.includes('Samnan'));
      const sExec = NMC_ANALYTICS.computeExecutiveMetrics(samnanAds, samnanLeads);

      return `### 🏥 Performance Audit: Sunny Medical Centre (Samnan, Sharjah)\n\n` +
        `- **Google Ads Investment:** AED ${Math.round(sExec.totalSpend).toLocaleString()}\n` +
        `- **Average CPC:** AED ${sExec.overallAvgCPC.toFixed(2)} *(Highly efficient vs UAE hospital benchmark of AED 16.50)*\n` +
        `- **Inbound Leads Generated:** ${sExec.totalLeads}\n` +
        `- **Confirmed Booked Appointments:** **${sExec.totalBooked}** (${sExec.bookingRate.toFixed(1)}% booking conversion)\n` +
        `- **Cost Per Booked Appointment (CPBA):** **AED ${sExec.cpba.toFixed(2)}**\n` +
        `- **Attended Show-Up Rate:** **${sExec.attendanceRate.toFixed(1)}%** (${sExec.totalAttended} attended patients)\n` +
        `- **Search Top Impression Share:** **${sExec.avgTopIS.toFixed(1)}%**\n\n` +
        `**Recommendation:** The campaign \`Alo_NMC_Search_Internal Medicine_Center_Samnan_Sun\` is running at peak efficiency with QS 9/10 on Exact match keywords. Scale budget by **+25%** to capture additional local patient volume.`;
    }

    // Query 3: How to cut CPC / Reduce waste
    if (q.includes('cut cpc') || q.includes('reduce cpc') || q.includes('lower cpc') || q.includes('cpc')) {
      const broadKeywords = filteredAds.filter(a => a.Match_Type === 'Broad' && a.Cost > 150);
      const lowQsKeywords = filteredAds.filter(a => a.Quality_Score <= 6);

      return `### 🎯 Action Plan: How to Cut CPC by 20% to 30%\n\n` +
        `1. **Transition High-Cost Broad Match to Exact/Phrase:**\n` +
        `   - Identified **${broadKeywords.length} Broad Match keywords** currently spending with lower booking conversion rates. Pause generic Broad terms and add exact local phrase matches.\n\n` +
        `2. **Boost Google Quality Scores (6/10 -> 9/10):**\n` +
        `   - Identified **${lowQsKeywords.length} keywords** with below-average Landing Page experience. Adding doctor consultation pricing, direct Arabic translations, and 1-tap WhatsApp booking buttons will lower CPC by **15–28%** via Google's Ad Rank discount formula.\n\n` +
        `3. **Trim Absolute Top Bids on Capped Accounts:**\n` +
        `   - Keywords with >90% Top Impression Share can safely reduce Max CPC bids by **15%** without sacrificing position #1-2 visibility.`;
    }

    // Query 4: Call Center / Lost Reasons / Response Time
    if (q.includes('call center') || q.includes('lost') || q.includes('response time') || q.includes('show up') || q.includes('show-up')) {
      const topLost = Object.entries(cc.lostReasonsCount).sort((a, b) => b[1] - a[1]).slice(0, 4);

      let res = `### 📞 Call Center & Patient Disposition Analysis\n\n`;
      res += `- **Total Inbound Inquiries:** ${exec.totalLeads}\n`;
      res += `- **Appointment Booking Rate:** **${exec.bookingRate.toFixed(1)}%** (${exec.totalBooked} booked)\n`;
      res += `- **Hospital Show-Up Rate:** **${exec.attendanceRate.toFixed(1)}%** (${exec.totalAttended} attended)\n`;
      res += `- **Average Turnaround Response Time:** **${exec.avgResponseTimeMins} minutes**\n\n`;
      res += `#### Top 4 Lost Reason Categories:\n`;
      topLost.forEach(([reason, count]) => {
        const pct = exec.totalNotBooked > 0 ? ((count / exec.totalNotBooked) * 100).toFixed(1) : 0;
        res += `- **${reason}:** ${count} leads (${pct}% of lost inquiries)\n`;
      });
      res += `\n**Optimization Tip:** Leads responded to within **<5 minutes** demonstrate a **70% booking rate**, compared to only **35%** for leads handled after 20 minutes. Prioritize automated SMS/WhatsApp instant confirmations.`;
      return res;
    }

    // Query 5: Regional comparison
    if (q.includes('auh') || q.includes('dxb') || q.includes('dubai') || q.includes('abu dhabi') || q.includes('sharjah') || q.includes('region') || q.includes('territory')) {
      let res = `### 📍 Multi-Location Territory Breakdown (UAE)\n\n`;
      res += `| Territory | Google Spend | Inbound Leads | Booked Appts | Booking Rate | CPBA (AED) | Top IS |\n`;
      res += `|---|---|---|---|---|---|---|\n`;
      regions.forEach(r => {
        res += `| **${r.territory}** | AED ${Math.round(r.totalSpend).toLocaleString()} | ${r.totalLeads} | **${r.totalBooked}** | ${r.bookingRate.toFixed(1)}% | AED ${r.cpba.toFixed(2)} | ${r.avgTopIS.toFixed(1)}% |\n`;
      });
      return res;
    }

    // Default Intelligence Summary
    return `### 💡 NMC Performance Marketing Intelligence Summary\n\n` +
      `Across the current selected filters (**${filteredAds.length} keywords**, **${filteredLeads.length} patient leads**):\n\n` +
      `- **Total Ad Spend:** AED ${Math.round(exec.totalSpend).toLocaleString()}\n` +
      `- **Total Booked Appointments:** **${exec.totalBooked}** (Booking Rate: **${exec.bookingRate.toFixed(1)}%**)\n` +
      `- **Cost Per Booked Appointment (CPBA):** **AED ${exec.cpba.toFixed(2)}**\n` +
      `- **Attended Show-Up Rate:** **${exec.attendanceRate.toFixed(1)}%**\n` +
      `- **Surgeries / Procedures Scheduled:** **${exec.totalSurgeries}**\n` +
      `- **Average Quality Score:** 8.4/10\n\n` +
      `You can ask me specific questions regarding any hospital facility (*Khalifa City, Al Nahda, Samnan Sunny Clinic*), clinical department (*Cardiology, Orthopedics, IVF*), or optimization action plans!`;
  }
};

if (typeof window !== 'undefined') {
  window.NMC_CHATBOT = NMC_CHATBOT;
}


/* === js/data-store.js === */
/**
 * NMC Healthcare (UAE) - Data Store & Google Sheet Integration Engine (V5 No Revenue)
 */

const NMC_DATA_STORE = {
  adsData: [],
  leadsData: [],
  subscribers: [],

  // Google Sheet Master Template URL (Pre-configured with Tab 1 Google_Ads_Data and Tab 2 Call_Center_Leads)
  masterGoogleSheetUrl: 'https://docs.google.com/spreadsheets/d/1_NMC_Healthcare_UAE_Performance_Master_Template/copy',

  // Doctors by Branch & Speciality
  doctorsDirectory: [
    { name: 'Dr. Sanjay Sharma', dep: 'Cardiology', branch: 'NMC Royal Hospital Khalifa City' },
    { name: 'Dr. Vivek Gupta', dep: 'Cardiology', branch: 'NMC Specialty Hospital Abu Dhabi' },
    { name: 'Dr. Ahmed El-Sayed', dep: 'Cardiology', branch: 'NMC Specialty Hospital Al Nahda' },
    { name: 'Dr. Fadi Al-Khatib', dep: 'Cardiology', branch: 'NMC Royal Hospital Sharjah' },
    { name: 'Dr. Karl Miller', dep: 'Orthopedics', branch: 'NMC Royal Hospital Khalifa City' },
    { name: 'Dr. Rajesh Nair', dep: 'Orthopedics', branch: 'NMC Royal Hospital DIP' },
    { name: 'Dr. Tarek Mansour', dep: 'Orthopedics', branch: 'NMC Specialty Hospital Al Nahda' },
    { name: 'Dr. George Mathew', dep: 'Orthopedics', branch: 'NMC Royal Hospital Sharjah' },
    { name: 'Dr. Monica Fakih', dep: 'IVF & Fertility', branch: 'NMC Royal Women\'s Hospital' },
    { name: 'Dr. Layla Al-Husseini', dep: 'IVF & Fertility', branch: 'NMC Specialty Hospital Al Nahda' },
    { name: 'Dr. Priya Sharma', dep: 'Pediatrics', branch: 'NMC Bareen International Hospital' },
    { name: 'Dr. Omar Farooq', dep: 'Pediatrics', branch: 'Sunny Al Buhaira Medical Centre' },
    { name: 'Dr. Fatima Zahra', dep: 'Gynecology & Obstetrics', branch: 'NMC Royal Women\'s Hospital' },
    { name: 'Dr. Sarah Jenkins', dep: 'Gynecology & Obstetrics', branch: 'NMC Specialty Hospital Al Nahda' },
    { name: 'Dr. Nader Haddad', dep: 'Dental', branch: 'Sunny Specialty Medical Centre' },
    { name: 'Dr. Christine Bauer', dep: 'Dermatology & Aesthetics', branch: 'NMC Day Surgery Al Barsha' },
    { name: 'Dr. Hisham Qasim', dep: 'Internal Medicine', branch: 'Sunny Medical Centre Samnan' },
    { name: 'Dr. Tariq Al-Nuaimi', dep: 'Neurology & Neurosurgery', branch: 'NMC Royal Hospital Khalifa City' },
    { name: 'Dr. John Varghese', dep: 'Oncology', branch: 'NMC Specialty Hospital Abu Dhabi' }
  ],

  // Call Center Agents
  agents: ['Fatima Al-Mazrouei', 'Kareem Mansour', 'Rhea Chakraborty', 'Zaid Al-Harbi', 'Ananya Sen', 'Bilal Hassan'],

  // Lost Reasons
  lostReasons: [
    'Insurance Network Tier Not Accepted',
    'Requested Doctor Schedule Fully Booked',
    'Patient Inquired Outside Territory / Distance',
    'Consultation / Procedure Price Objection',
    'Teleconsultation Requested Only',
    'Patient Decided to Postpone / No Show Followup',
    'Duplicate Lead / Test Submission',
    'Language Barrier / Arabic Specialist Requested'
  ],

  init() {
    this.generateRealisticDataset();
    setTimeout(() => {
      this.autoSyncConnectedGoogleSheet();
    }, 600);
  },

  async autoSyncConnectedGoogleSheet() {
    const defaultUrl = 'https://docs.google.com/spreadsheets/d/1WUlm0LJIHWykInkXuCyOmbeCFsEC2TF_RGChRGoXEt8/edit';
    try {
      await this.fetchFromRealGoogleSheet(defaultUrl);
      console.log('Auto-synced live data from connected Google Sheet successfully.');
    } catch (e) {
      console.log('Background Google Sheet fetch note:', e.message);
    }
  },

  subscribe(callback) {
    if (typeof callback === 'function') {
      this.subscribers.push(callback);
    }
  },

  notify() {
    this.subscribers.forEach(cb => cb({ ads: this.adsData, leads: this.leadsData }));
  },

  generateRealisticDataset() {
    const rawAds = [];
    const rawLeads = [];

    const now = new Date(2026, 7, 15);
    const daysBack = 45;

    const campaignTemplates = [
      // Sunny Clinics Campaigns
      {
        account: 'Sunny Clinics',
        branch: 'Sunny Medical Centre Samnan',
        speciality: 'Internal Medicine',
        name: 'Alo_NMC_Search_Internal Medicine_Center_Samnan_Sun',
        type: 'Search',
        keywords: [
          { kw: 'internal medicine doctor samnan sharjah', match: 'Exact', qs: 9, ctr: 'Above average', rel: 'Above average', lp: 'Above average', baseCpc: 8.4, baseImpr: 310, baseConvRate: 0.19, topIS: 88.0, absTopIS: 62.0, lostBudget: 8.0, lostRank: 4.0 },
          { kw: 'general physician samnan sunny clinic', match: 'Exact', qs: 9, ctr: 'Above average', rel: 'Above average', lp: 'Above average', baseCpc: 7.2, baseImpr: 280, baseConvRate: 0.21, topIS: 91.0, absTopIS: 68.0, lostBudget: 5.0, lostRank: 4.0 },
          { kw: 'best internal medicine specialist sharjah', match: 'Phrase', qs: 8, ctr: 'Above average', rel: 'Average', lp: 'Above average', baseCpc: 9.8, baseImpr: 340, baseConvRate: 0.15, topIS: 79.0, absTopIS: 48.0, lostBudget: 15.0, lostRank: 6.0 },
          { kw: 'doctor near me samnan', match: 'Broad', qs: 6, ctr: 'Average', rel: 'Below average', lp: 'Average', baseCpc: 6.5, baseImpr: 520, baseConvRate: 0.08, topIS: 54.0, absTopIS: 25.0, lostBudget: 28.0, lostRank: 18.0 }
        ]
      },
      {
        account: 'Sunny Clinics',
        branch: 'Sunny Al Buhaira Medical Centre',
        speciality: 'Pediatrics',
        name: 'Alo_NMC_Search_Pediatrics_Center_Buhaira_Sun',
        type: 'Search',
        keywords: [
          { kw: 'pediatrician buhaira corniche sharjah', match: 'Exact', qs: 9, ctr: 'Above average', rel: 'Above average', lp: 'Above average', baseCpc: 7.5, baseImpr: 360, baseConvRate: 0.21, topIS: 90.0, absTopIS: 69.0, lostBudget: 5.0, lostRank: 5.0 },
          { kw: 'baby vaccination sunny medical buhaira', match: 'Phrase', qs: 8, ctr: 'Above average', rel: 'Average', lp: 'Average', baseCpc: 6.8, baseImpr: 240, baseConvRate: 0.18, topIS: 82.0, absTopIS: 50.0, lostBudget: 12.0, lostRank: 6.0 }
        ]
      },
      {
        account: 'Sunny Clinics',
        branch: 'Sunny Specialty Medical Centre',
        speciality: 'Dental',
        name: 'Alo_NMC_Search_Dental_Specialty_Main_Sun',
        type: 'Search',
        keywords: [
          { kw: 'dental braces sunny medical center', match: 'Exact', qs: 8, ctr: 'Above average', rel: 'Above average', lp: 'Above average', baseCpc: 8.9, baseImpr: 290, baseConvRate: 0.18, topIS: 84.0, absTopIS: 55.0, lostBudget: 10.0, lostRank: 6.0 }
        ]
      },

      // Abu Dhabi (AUH) Campaigns
      {
        account: 'AUH',
        branch: 'NMC Royal Hospital Khalifa City',
        speciality: 'Cardiology',
        name: 'Alo_NMC_Search_Cardiology_Royal_Khalifa_AUH',
        type: 'Search',
        keywords: [
          { kw: 'best cardiologist in abu dhabi', match: 'Exact', qs: 9, ctr: 'Above average', rel: 'Above average', lp: 'Above average', baseCpc: 14.2, baseImpr: 320, baseConvRate: 0.16, topIS: 82.5, absTopIS: 54.0, lostBudget: 12.0, lostRank: 5.5 },
          { kw: 'heart specialist hospital khalifa city', match: 'Phrase', qs: 8, ctr: 'Above average', rel: 'Above average', lp: 'Average', baseCpc: 11.8, baseImpr: 280, baseConvRate: 0.14, topIS: 75.0, absTopIS: 42.0, lostBudget: 15.0, lostRank: 10.0 }
        ]
      },
      {
        account: 'AUH',
        branch: 'NMC Royal Hospital Khalifa City',
        speciality: 'Orthopedics',
        name: 'Alo_NMC_Search_Orthopedics_Royal_Khalifa_AUH',
        type: 'Search',
        keywords: [
          { kw: 'knee replacement surgeon abu dhabi', match: 'Exact', qs: 9, ctr: 'Above average', rel: 'Above average', lp: 'Above average', baseCpc: 22.4, baseImpr: 260, baseConvRate: 0.19, topIS: 84.0, absTopIS: 58.0, lostBudget: 10.0, lostRank: 6.0 }
        ]
      },
      {
        account: 'AUH',
        branch: 'NMC Royal Women\'s Hospital',
        speciality: 'IVF & Fertility',
        name: 'Alo_NMC_Search_IVFFertility_RoyalWomens_AUH',
        type: 'Search',
        keywords: [
          { kw: 'ivf treatment cost abu dhabi', match: 'Exact', qs: 8, ctr: 'Above average', rel: 'Above average', lp: 'Above average', baseCpc: 28.0, baseImpr: 190, baseConvRate: 0.22, topIS: 86.0, absTopIS: 60.0, lostBudget: 9.0, lostRank: 5.0 }
        ]
      },

      // Dubai (DXB) Campaigns
      {
        account: 'DXB',
        branch: 'NMC Specialty Hospital Al Nahda',
        speciality: 'Cardiology',
        name: 'Alo_NMC_Search_Cardiology_Specialty_AlNahda_DXB',
        type: 'Search',
        keywords: [
          { kw: 'cardiologist in al nahda dubai', match: 'Exact', qs: 9, ctr: 'Above average', rel: 'Above average', lp: 'Above average', baseCpc: 16.5, baseImpr: 340, baseConvRate: 0.18, topIS: 86.0, absTopIS: 58.0, lostBudget: 8.0, lostRank: 6.0 }
        ]
      },
      {
        account: 'DXB',
        branch: 'NMC Specialty Hospital Al Nahda',
        speciality: 'Orthopedics',
        name: 'Alo_NMC_Search_Orthopedics_Specialty_AlNahda_DXB',
        type: 'Search',
        keywords: [
          { kw: 'best orthopedic surgeon dubai', match: 'Exact', qs: 9, ctr: 'Above average', rel: 'Above average', lp: 'Above average', baseCpc: 24.5, baseImpr: 310, baseConvRate: 0.17, topIS: 85.0, absTopIS: 59.0, lostBudget: 10.0, lostRank: 5.0 }
        ]
      },

      // Northern Emirates Campaigns
      {
        account: 'Northern Emirates',
        branch: 'NMC Royal Hospital Sharjah',
        speciality: 'Cardiology',
        name: 'Alo_NMC_Search_Cardiology_Royal_Sharjah_SHJ',
        type: 'Search',
        keywords: [
          { kw: 'cardiologist in sharjah royal hospital', match: 'Exact', qs: 9, ctr: 'Above average', rel: 'Above average', lp: 'Above average', baseCpc: 12.8, baseImpr: 290, baseConvRate: 0.18, topIS: 87.0, absTopIS: 61.0, lostBudget: 7.0, lostRank: 6.0 }
        ]
      }
    ];

    let leadSeq = 10001;

    for (let dayOffset = daysBack; dayOffset >= 0; dayOffset--) {
      const d = new Date(now);
      d.setDate(d.getDate() - dayOffset);
      const dateStr = d.toISOString().split('T')[0];
      const isWeekend = (d.getDay() === 5 || d.getDay() === 6);
      const dayFactor = isWeekend ? 0.78 : 1.06;

      campaignTemplates.forEach((ct, cIdx) => {
        ct.keywords.forEach((kwObj, kIdx) => {
          const variance = 0.88 + Math.random() * 0.25;
          const impressions = Math.round(kwObj.baseImpr * dayFactor * variance);
          const ctr = (0.055 + (kwObj.qs * 0.005) + (Math.random() * 0.02)) * (kwObj.match === 'Exact' ? 1.2 : 0.9);
          const clicks = Math.max(1, Math.round(impressions * ctr));
          const avgCpc = Number((kwObj.baseCpc * (0.94 + Math.random() * 0.12)).toFixed(2));
          const cost = Number((clicks * avgCpc).toFixed(2));
          const convRate = Number((kwObj.baseConvRate * (0.90 + Math.random() * 0.20)).toFixed(4));
          const conversions = Math.max(0, Math.round(clicks * convRate));
          const costPerConv = conversions > 0 ? Number((cost / conversions).toFixed(2)) : 0;
          const phoneCalls = Math.round(conversions * (0.45 + Math.random() * 0.25));

          const topIS = Math.min(98, Math.max(25, Number((kwObj.topIS + (Math.random() * 4 - 2)).toFixed(1))));
          const absTopIS = Math.min(topIS - 10, Math.max(10, Number((kwObj.absTopIS + (Math.random() * 4 - 2)).toFixed(1))));
          const searchIS = Math.min(99, Number((topIS + 8 + Math.random() * 4).toFixed(1)));
          const lostBudget = Math.max(2, Number((kwObj.lostBudget + (Math.random() * 3 - 1.5)).toFixed(1)));
          const lostRank = Math.max(2, Number((kwObj.lostRank + (Math.random() * 3 - 1.5)).toFixed(1)));

          const adRow = {
            Date: dateStr,
            Ad_Account: ct.account,
            Hospital_Branch: ct.branch,
            Department_Speciality: ct.speciality,
            Campaign_Name: ct.name,
            Campaign_ID: `CMP-${1000 + cIdx}`,
            Campaign_Type: ct.type,
            Campaign_Status: 'Enabled',
            Ad_Group_Name: `${ct.speciality} - ${kwObj.match}`,
            Ad_Group_ID: `AG-${2000 + cIdx * 10 + kIdx}`,
            Ad_Group_Status: 'Enabled',
            Keyword: kwObj.kw,
            Match_Type: kwObj.match,
            Quality_Score: kwObj.qs,
            Expected_CTR: kwObj.ctr,
            Ad_Relevance: kwObj.rel,
            Landing_Page_Exp: kwObj.lp,
            Device: Math.random() > 0.3 ? 'Mobile' : 'Desktop',
            Impressions: impressions,
            Clicks: clicks,
            CTR: Number((ctr * 100).toFixed(2)),
            Avg_CPC: avgCpc,
            Cost: cost,
            Conversions: conversions,
            Cost_Per_Conv: costPerConv,
            Conv_Rate: Number((convRate * 100).toFixed(2)),
            Phone_Calls: phoneCalls,
            Search_Impr_Share: searchIS,
            Search_Top_IS: topIS,
            Search_Abs_Top_IS: absTopIS,
            Search_Lost_IS_Budget: lostBudget,
            Search_Lost_IS_Rank: lostRank
          };
          rawAds.push(adRow);

          // Generate Call Center Leads without revenue
          if (conversions > 0) {
            for (let leadIndex = 0; leadIndex < conversions; leadIndex++) {
              leadSeq++;
              const leadId = `NMC-LD-${leadSeq}`;

              const priorities = ['High', 'High', 'Medium', 'Medium', 'Urgent', 'VIP', 'Low'];
              const priority = priorities[Math.floor(Math.random() * priorities.length)];

              const availableDocs = this.doctorsDirectory.filter(doc => doc.dep === ct.speciality && (doc.branch === ct.branch || Math.random() > 0.5));
              const assignedDoc = availableDocs.length > 0 ? availableDocs[Math.floor(Math.random() * availableDocs.length)].name : 'Dr. Hisham Qasim';

              const respMins = priority === 'Urgent' || priority === 'VIP' ? Math.floor(1 + Math.random() * 4) : Math.floor(3 + Math.random() * 22);
              const responseTimeStr = `${respMins} mins`;

              const bookingProb = respMins < 10 ? 0.70 : respMins < 20 ? 0.52 : 0.35;
              const isBooked = Math.random() < bookingProb;

              let status = 'Not Booked';
              let lostReason = '';
              let apptDate = '';
              let apptTime = '';

              if (isBooked) {
                const isAttended = Math.random() < 0.84;
                const isSurgery = Math.random() < 0.22;

                if (isSurgery) {
                  status = 'Surgery Scheduled';
                } else if (isAttended) {
                  status = 'Attended';
                } else {
                  status = Math.random() > 0.5 ? 'Booked' : 'No Show';
                }

                const apptD = new Date(d);
                apptD.setDate(apptD.getDate() + Math.floor(1 + Math.random() * 4));
                apptDate = apptD.toISOString().split('T')[0];
                const hours = ['09:30', '10:15', '11:00', '12:30', '14:00', '15:30', '16:45', '18:00', '19:15'];
                apptTime = hours[Math.floor(Math.random() * hours.length)];
              } else {
                status = Math.random() > 0.2 ? 'Not Booked' : 'Follow Up';
                lostReason = this.lostReasons[Math.floor(Math.random() * this.lostReasons.length)];
              }

              const patientNames = [
                'Rashid Al-Nuaimi', 'Salem Al-Ketbi', 'Fatima Al-Suwaidi', 'Mohammed Al-Mansoori',
                'Mariam Al-Ali', 'Zainab Al-Hamadi', 'Abdullah Al-Dhaheri', 'Hamdan Al-Zaabi',
                'Rahul Verma', 'Sneha Patel', 'John Smith', 'Michael Chang', 'Amira Mahmoud', 'Tariq Othman'
              ];
              const pName = patientNames[Math.floor(Math.random() * patientNames.length)];

              const leadRow = {
                ID: leadId,
                Status: status,
                Patient: pName,
                Phone: `+971 50 ${Math.floor(100 + Math.random() * 899)} ${Math.floor(1000 + Math.random() * 8999)}`,
                Email: `${pName.toLowerCase().replace(/[^a-z]/g, '.')}.${Math.floor(10 + Math.random() * 89)}@gmail.com`,
                Doctor: assignedDoc,
                Branch: ct.branch,
                Department: ct.speciality,
                'Lead priority': priority,
                'Appointment Date': apptDate,
                'Appointment Time': apptTime,
                'Handled By': this.agents[Math.floor(Math.random() * this.agents.length)],
                'Response Time': responseTimeStr,
                'Created At': `${dateStr} ${String(Math.floor(8 + Math.random() * 12)).padStart(2, '0')}:${String(Math.floor(Math.random() * 59)).padStart(2, '0')}`,
                Lost_Reason: lostReason,
                Ad_Account: ct.account,
                Campaign_Name: ct.name,
                Keyword: kwObj.kw
              };
              rawLeads.push(leadRow);
            }
          }
        });
      });
    }

    this.adsData = rawAds;
    this.leadsData = rawLeads;
    this.notify();
  },

  parseDelimitedText(text, delimiter = null) {
    if (!text || typeof text !== 'string') return [];
    let lines = text.trim().split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length < 2) return [];

    // Find true header line index (skip any leading markdown or HTTP metadata)
    let headerIdx = 0;
    for (let i = 0; i < Math.min(25, lines.length); i++) {
      const line = lines[i];
      if (/^["']?(Day|Date|ID|Campaign|Account|Status|Patient)/i.test(line) || line.includes('","') || (line.split(',').length >= 5) || (line.split('\t').length >= 5)) {
        headerIdx = i;
        break;
      }
    }

    lines = lines.slice(headerIdx);

    if (!delimiter) {
      const header = lines[0];
      const commas = (header.match(/,/g) || []).length;
      const tabs = (header.match(/\t/g) || []).length;
      const semicolons = (header.match(/;/g) || []).length;
      if (tabs >= commas && tabs >= semicolons) delimiter = '\t';
      else if (semicolons > commas) delimiter = ';';
      else delimiter = ',';
    }

    const parseLine = (line) => {
      const result = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            cur += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === delimiter && !inQuotes) {
          result.push(cur.trim());
          cur = '';
        } else {
          cur += char;
        }
      }
      result.push(cur.trim());
      return result;
    };

    const headers = parseLine(lines[0]).map(h => h.replace(/^["']|["']$/g, '').trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const values = parseLine(lines[i]);
      const row = { _rawValues: values };
      headers.forEach((h, index) => {
        let val = values[index] !== undefined ? values[index].replace(/^["']|["']$/g, '').trim() : '';
        row[h] = val;
      });
      data.push(row);
    }
    return data;
  },

  extractNum(row, ...keys) {
    for (const k of keys) {
      if (row[k] !== undefined && row[k] !== null && row[k] !== '' && row[k] !== '--' && row[k] !== 'Not applicable') {
        const clean = String(row[k]).replace(/,/g, '').replace(/[^\d.-]/g, '');
        const val = Number(clean);
        if (!isNaN(val)) return val;
      }
    }
    const rowKeys = Object.keys(row);
    for (const k of keys) {
      const cleanKey = k.toLowerCase().replace(/[^a-z0-9]/g, '');
      const found = rowKeys.find(rk => rk.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanKey);
      if (found && row[found] !== undefined && row[found] !== null && row[found] !== '' && row[found] !== '--' && row[found] !== 'Not applicable') {
        const clean = String(row[found]).replace(/,/g, '').replace(/[^\d.-]/g, '');
        const val = Number(clean);
        if (!isNaN(val)) return val;
      }
    }
    return 0;
  },

  extractStr(row, ...keys) {
    for (const k of keys) {
      if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '' && row[k] !== '--') {
        return String(row[k]).trim();
      }
    }
    const rowKeys = Object.keys(row);
    for (const k of keys) {
      const cleanKey = k.toLowerCase().replace(/[^a-z0-9]/g, '');
      const found = rowKeys.find(rk => rk.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanKey);
      if (found && row[found] !== undefined && row[found] !== null && String(row[found]).trim() !== '' && row[found] !== '--') {
        return String(row[found]).trim();
      }
    }
    return '';
  },

  ingestAdsData(rawRows) {
    if (!Array.isArray(rawRows)) return;
    
    // Filter out empty rows, Google Ads Tree Table totals, or metadata comments
    const validRows = rawRows.filter(row => {
      let camp = '';
      let kw = '';
      let adGroup = '';
      
      if (row._rawValues && row._rawValues.length >= 6) {
        camp = String(row._rawValues[1] || '').trim();
        adGroup = String(row._rawValues[4] || '').trim();
        kw = String(row._rawValues[5] || '').trim();
      } else {
        camp = this.extractStr(row, 'Campaign', 'Campaign_Name', 'Campaign name', 'campaign_name');
        kw = this.extractStr(row, 'Search keyword', 'Keyword', 'Keyword text', 'Search_Keyword');
        adGroup = this.extractStr(row, 'Ad group', 'Ad_Group_Name', 'Ad Group');
      }

      if (!camp && !kw && !adGroup) return false;
      if (camp.startsWith('Total:') || camp.startsWith('--') || camp.toLowerCase() === 'total') return false;
      if (kw.startsWith('Total:') || kw.startsWith('--')) return false;
      return true;
    });

    const normalized = validRows.map(row => {
      let campaignName = '';
      let adAccountHint = '';
      let customerId = '';
      let adGroupName = '';
      let keyword = '';
      let matchType = 'Phrase match';
      let qualityScore = 7;
      let expCtr = 'Average';
      let adRelevance = 'Average';
      let landingPageExp = 'Average';
      let impressions = 0;
      let clicks = 0;
      let cost = 0;
      let conversions = 0;
      let rawDay = '';
      let topIS = 75;
      let absTopIS = 45;
      let lostRank = 10;
      let lostBudget = 15;
      let phoneCalls = 0;

      // Check if row has raw positional columns from 25-col Google Ads export
      if (row._rawValues && row._rawValues.length >= 18) {
        rawDay = String(row._rawValues[0] || '').trim();
        campaignName = String(row._rawValues[1] || '').trim();
        adAccountHint = String(row._rawValues[2] || '').trim();
        customerId = String(row._rawValues[3] || '').trim();
        adGroupName = String(row._rawValues[4] || '').trim();
        keyword = String(row._rawValues[5] || '').trim();
        matchType = String(row._rawValues[6] || 'Phrase match').trim();
        qualityScore = Number(String(row._rawValues[7] || '').replace(/[^\d.-]/g, '')) || 7;
        expCtr = String(row._rawValues[8] || 'Average').trim();
        adRelevance = String(row._rawValues[9] || 'Average').trim();
        landingPageExp = String(row._rawValues[10] || 'Average').trim();
        
        impressions = Number(String(row._rawValues[11] || '').replace(/,/g, '').replace(/[^\d.-]/g, '')) || 0;
        clicks = Number(String(row._rawValues[12] || '').replace(/,/g, '').replace(/[^\d.-]/g, '')) || 0;
        cost = Number(String(row._rawValues[16] || '').replace(/,/g, '').replace(/[^\d.-]/g, '')) || 0;
        conversions = Number(String(row._rawValues[17] || '').replace(/,/g, '').replace(/[^\d.-]/g, '')) || 0;
        
        if (row._rawValues.length >= 24) {
          topIS = Number(String(row._rawValues[20] || '').replace(/,/g, '').replace(/[^\d.-]/g, '')) || 75;
          absTopIS = Number(String(row._rawValues[21] || '').replace(/,/g, '').replace(/[^\d.-]/g, '')) || 45;
          lostRank = Number(String(row._rawValues[22] || '').replace(/,/g, '').replace(/[^\d.-]/g, '')) || 10;
          phoneCalls = Number(String(row._rawValues[23] || '').replace(/,/g, '').replace(/[^\d.-]/g, '')) || 0;
        }
      } else {
        campaignName = this.extractStr(row, 'Campaign', 'Campaign_Name', 'Campaign name');
        adAccountHint = this.extractStr(row, 'Account name', 'Account', 'Ad_Account', 'Customer ID', 'ad_account');
        customerId = this.extractStr(row, 'Customer ID', 'Campaign ID', 'Campaign_ID');
        adGroupName = this.extractStr(row, 'Ad group', 'Ad_Group_Name', 'Ad Group');
        keyword = this.extractStr(row, 'Search keyword', 'Keyword', 'Keyword text');
        matchType = this.extractStr(row, 'Search keyword match type', 'Match_Type', 'Match type') || 'Phrase match';
        qualityScore = this.extractNum(row, 'Quality Score', 'Quality score', 'Quality_Score') || 7;
        expCtr = this.extractStr(row, 'Exp. CTR', 'Expected_CTR') || 'Average';
        adRelevance = this.extractStr(row, 'Ad relevance', 'Ad_Relevance') || 'Average';
        landingPageExp = this.extractStr(row, 'Landing page exp.', 'Landing_Page_Exp') || 'Average';
        impressions = this.extractNum(row, 'Impr.', 'Impressions', 'Impr', 'impressions');
        clicks = this.extractNum(row, 'Clicks', 'Click', 'clicks');
        cost = this.extractNum(row, 'Cost', 'Cost (AED)', 'Spend', 'Cost_AED', 'cost');
        conversions = this.extractNum(row, 'Conversions', 'Conv.', 'Conv', 'conversions');
        rawDay = this.extractStr(row, 'Day', 'Date', 'day', 'date');
      }

      const parsed = NMC_PARSER.parseCampaign(campaignName, adAccountHint);
      const avgCpc = clicks > 0 ? Number((cost / clicks).toFixed(2)) : 0;
      const ctr = impressions > 0 ? Number(((clicks / impressions) * 100).toFixed(2)) : 0;
      const convRate = clicks > 0 ? Number(((conversions / clicks) * 100).toFixed(2)) : 0;
      const costPerConv = conversions > 0 ? Number((cost / conversions).toFixed(2)) : 0;
      const normDate = NMC_PARSER.normalizeDate(rawDay);

      return {
        Date: normDate,
        Day: normDate,
        Ad_Account: row.Ad_Account || parsed.adAccount,
        Hospital_Branch: row.Hospital_Branch || parsed.hospitalBranch,
        Department_Speciality: row.Department_Speciality || parsed.department,
        Campaign_Name: campaignName,
        Campaign_ID: customerId,
        Campaign_Type: parsed.campaignType,
        Campaign_Status: 'Enabled',
        Ad_Group_Name: adGroupName,
        Keyword: keyword,
        Match_Type: matchType,
        Quality_Score: qualityScore,
        Expected_CTR: expCtr,
        Ad_Relevance: adRelevance,
        Landing_Page_Exp: landingPageExp,
        Device: 'Mobile',
        Impressions: impressions,
        Clicks: clicks,
        CTR: ctr,
        Avg_CPC: avgCpc,
        Cost: cost,
        Conversions: conversions,
        Cost_Per_Conv: costPerConv,
        Conv_Rate: convRate,
        Phone_Calls: phoneCalls || Math.round(conversions * 0.4),
        Search_Impr_Share: topIS,
        Search_Top_IS: topIS,
        Search_Abs_Top_IS: absTopIS,
        Search_Lost_IS_Budget: lostBudget,
        Search_Lost_IS_Rank: lostRank
      };
    });

    this.adsData = normalized;
    this.notify();
    return normalized.length;
  },

  ingestLeadsData(rawRows) {
    if (!Array.isArray(rawRows)) return;
    const normalized = rawRows.map((row, idx) => {
      const branch = NMC_PARSER.normalizeBranch(row.Branch || row['Hospital'] || row['Facility'] || '');
      const department = NMC_PARSER.normalizeDepartment(row.Department || row['Speciality'] || '');
      
      const rawStatus = String(row.Status || row['Lead Status'] || 'Booked').trim().toLowerCase();
      let status = 'Booked';
      if (rawStatus.includes('not booked')) status = 'Not Booked';
      else if (rawStatus.includes('not reachable') || rawStatus.includes('unreachable')) status = 'Not Reachable';
      else if (rawStatus.includes('follow')) status = 'Follow Up';
      else if (rawStatus.includes('cancel')) status = 'Cancelled';
      else if (rawStatus.includes('surgery') || rawStatus.includes('procedure')) status = 'Surgery Scheduled';
      else if (rawStatus.includes('attended') || rawStatus.includes('show')) status = 'Attended';
      else if (rawStatus.includes('book')) status = 'Booked';

      const regionMatch = NMC_PARSER.regions.find(r => r.patterns.some(p => p.test(branch)));
      const adAccount = regionMatch ? regionMatch.key : 'AUH';

      const rawCreated = row['Created At'] || row['Created_At'] || row['Appointment Date'] || '';
      const normCreated = NMC_PARSER.normalizeDate(rawCreated);
      const normApptDate = NMC_PARSER.normalizeDate(row['Appointment Date'] || rawCreated);

      return {
        ID: row.ID || row['Lead ID'] || `LD-${idx + 1000}`,
        Status: status,
        Patient: row.Patient || row['Patient Name'] || 'Patient',
        Phone: row.Phone || row['Mobile'] || '',
        Email: row.Email || '',
        Doctor: row.Doctor || row['Doctor Name'] || 'Specialist Doctor',
        Branch: branch,
        Department: department,
        'Lead priority': row['Lead priority'] || row['Priority'] || 'Medium',
        'Appointment Date': normApptDate,
        'Appointment Time': row['Appointment Time'] || row['Appointment_Time'] || '',
        'Handled By': row['Handled By'] || row['Agent'] || 'Call Center Agent',
        'Response Time': row['Response Time'] || row['Response_Time'] || '5 mins',
        'Created At': normCreated,
        Lost_Reason: row.Lost_Reason || row['Lost Reason'] || (status === 'Not Booked' || status === 'Not Reachable' ? 'Schedule / Distance / Insurance' : ''),
        Ad_Account: adAccount,
        Campaign_Name: row.Campaign_Name || `Alo_NMC_Search_${department}_${branch.replace(/\s+/g, '')}_Sun`,
        Keyword: row.Keyword || ''
      };
    });

    this.leadsData = normalized;
    this.notify();
    return normalized.length;
  },

  /**
   * Connect and fetch live data directly from a REAL Google Sheet on docs.google.com
   */
  async fetchFromRealGoogleSheet(sheetUrl) {
    if (!sheetUrl || !sheetUrl.includes('/d/')) {
      throw new Error('Please provide a valid Google Sheet URL containing /d/YOUR_SHEET_ID');
    }

    const match = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!match || !match[1]) {
      throw new Error('Could not extract Google Spreadsheet ID from URL.');
    }

    const sheetId = match[1];
    const adsUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=Google_Ads_Data`;
    const leadsUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=Call_Center_Leads`;

    let adsCount = 0;
    let leadsCount = 0;

    // Fetch Google Ads Data Tab
    try {
      const resAds = await fetch(adsUrl);
      if (resAds.ok) {
        const csvAds = await resAds.text();
        const parsedAds = this.parseCsv(csvAds);
        if (parsedAds.length > 0) {
          adsCount = this.ingestAdsData(parsedAds);
        }
      }
    } catch (err) {
      console.warn('Could not fetch Google_Ads_Data tab directly:', err);
    }

    // Fetch Call Center Leads Tab
    try {
      const resLeads = await fetch(leadsUrl);
      if (resLeads.ok) {
        const csvLeads = await resLeads.text();
        const parsedLeads = this.parseCsv(csvLeads);
        if (parsedLeads.length > 0) {
          leadsCount = this.ingestLeadsData(parsedLeads);
        }
      }
    } catch (err) {
      console.warn('Could not fetch Call_Center_Leads tab directly:', err);
    }

    // Save connected URL
    localStorage.setItem('NMC_REAL_GOOGLE_SHEET_URL', sheetUrl);
    return { sheetId, adsCount, leadsCount };
  },

  parseCsv(csvText) {
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length <= 1) return [];

    const parseLine = (l) => {
      const row = [];
      let inQuotes = false;
      let cur = '';
      for (let i = 0; i < l.length; i++) {
        const ch = l[i];
        if (ch === '"') {
          inQuotes = !inQuotes;
        } else if (ch === ',' && !inQuotes) {
          row.push(cur.trim().replace(/^["']|["']$/g, ''));
          cur = '';
        } else {
          cur += ch;
        }
      }
      row.push(cur.trim().replace(/^["']|["']$/g, ''));
      return row;
    };

    const headers = parseLine(lines[0]);
    const results = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const cols = parseLine(lines[i]);
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = cols[idx] !== undefined ? cols[idx] : '';
      });
      results.push(obj);
    }

    return results;
  },

  getGoogleAdsCsvTemplate() {
    const headers = [
      'Date', 'Campaign_Name', 'Ad_Account', 'Ad_Group_Name', 'Keyword', 'Match_Type',
      'Quality_Score', 'Expected_CTR', 'Ad_Relevance', 'Landing_Page_Exp',
      'Impressions', 'Clicks', 'CTR', 'Avg_CPC', 'Cost', 'Conversions', 'Cost_Per_Conv', 'Conv_Rate',
      'Search_Impr_Share', 'Search_Top_IS', 'Search_Abs_Top_IS', 'Search_Lost_IS_Budget', 'Search_Lost_IS_Rank',
      'Campaign_Type', 'Campaign_Status', 'Device', 'Phone_Calls'
    ];
    const sampleRows = [
      ['2026-08-15', 'Alo_NMC_Search_Internal Medicine_Center_Samnan_Sun', 'Sunny Clinics', 'Internal Medicine - Exact', 'internal medicine doctor samnan sharjah', 'Exact', '9', 'Above average', 'Above average', 'Above average', '310', '32', '10.32%', '8.40', '268.80', '6', '44.80', '18.75%', '88.0%', '88.0%', '62.0%', '8.0%', '4.0%', 'Search', 'Enabled', 'Mobile', '3'],
      ['2026-08-15', 'Alo_NMC_Search_Cardiology_Royal_Khalifa_AUH', 'AUH', 'Cardiology - Exact High Intent', 'best cardiologist in abu dhabi', 'Exact', '9', 'Above average', 'Above average', 'Above average', '320', '30', '9.38%', '14.20', '426.00', '5', '85.20', '16.67%', '84.0%', '82.5%', '54.0%', '12.0%', '5.5%', 'Search', 'Enabled', 'Mobile', '2'],
      ['2026-08-15', 'Alo_NMC_Search_Orthopedics_Specialty_AlNahda_DXB', 'DXB', 'Orthopedics - Knee Replacement', 'knee replacement surgeon dubai', 'Exact', '9', 'Above average', 'Above average', 'Above average', '280', '26', '9.28%', '22.40', '582.40', '5', '116.48', '19.23%', '86.0%', '85.0%', '59.0%', '9.0%', '5.0%', 'Search', 'Enabled', 'Mobile', '2']
    ];
    return [headers.join(','), ...sampleRows.map(r => r.join(','))].join('\n');
  },

  getCallCenterCsvTemplate() {
    const headers = [
      'ID', 'Status', 'Patient', 'Phone', 'Email', 'Doctor', 'Branch', 'Department',
      'Lead priority', 'Appointment Date', 'Appointment Time', 'Handled By', 'Response Time', 'Created At'
    ];
    const sampleRows = [
      ['NMC-LD-10021', 'Surgery Scheduled', 'Rashid Al-Nuaimi', '+971 50 293 8492', 'rashid.nuaimi@gmail.com', 'Dr. Sanjay Sharma', 'NMC Royal Hospital Khalifa City', 'Cardiology', 'High', '2026-08-18', '10:30', 'Fatima Al-Mazrouei', '3 mins', '2026-08-15 09:15'],
      ['NMC-LD-10022', 'Attended', 'Mariam Al-Ali', '+971 52 481 9283', 'mariam.ali@gmail.com', 'Dr. Hisham Qasim', 'Sunny Medical Centre Samnan', 'Internal Medicine', 'Urgent', '2026-08-16', '14:00', 'Kareem Mansour', '2 mins', '2026-08-15 10:45'],
      ['NMC-LD-10023', 'Booked', 'Salem Al-Ketbi', '+971 55 938 1029', 'salem.ketbi@gmail.com', 'Dr. Monica Fakih', 'NMC Royal Women\'s Hospital', 'IVF & Fertility', 'VIP', '2026-08-19', '11:15', 'Rhea Chakraborty', '1 mins', '2026-08-15 11:30'],
      ['NMC-LD-10024', 'Not Booked', 'Rahul Verma', '+971 50 182 9384', 'rahul.verma@gmail.com', 'Dr. Omar Farooq', 'Sunny Al Buhaira Medical Centre', 'Pediatrics', 'Low', '', '', 'Zaid Al-Harbi', '28 mins', '2026-08-15 12:10']
    ];
    return [headers.join(','), ...sampleRows.map(r => r.join(','))].join('\n');
  }
};

if (typeof window !== 'undefined') {
  window.NMC_DATA_STORE = NMC_DATA_STORE;
}


/* === js/app.js === */
/**
 * NMC Healthcare (UAE) - Main Application Controller & UI Coordinator (V8 - No Revenue Edition)
 */

const APP = {
  currentMainTab: 'overview', // 'overview' | 'tabular' | 'chatbot' | 'googlesheets'
  currentTerritory: 'ALL',
  currentViewLevel: 'keyword', // 'keyword' | 'campaign' | 'branch' | 'department'
  nextStepFilter: 'ALL',
  isFloatingChatOpen: false,
  
  // Direct Official Master Google Sheet URL
  googleSheetDirectUrl: 'https://docs.google.com/spreadsheets/d/1WUlm0LJIHWykInkXuCyOmbeCFsEC2TF_RGChRGoXEt8/edit?gid=0#gid=0',

  filters: {
    startDate: '',
    endDate: '',
    adAccount: 'ALL',
    hospitalBranch: 'ALL',
    department: 'ALL',
    doctor: 'ALL',
    leadStatus: 'ALL',
    nextStepFilter: 'ALL',
    searchQuery: ''
  },

  init() {
    // 1. Initialize Data Store
    NMC_DATA_STORE.init();

    // 2. Initialize Chatbot
    NMC_CHATBOT.init();

    // 3. Set default date preset (All Time to capture all real data)
    this.setDatePreset('all');

    // 4. Setup Filter Dropdowns
    this.populateFilterDropdowns();

    // 5. Attach Event Listeners
    this.attachEventListeners();

    // 6. Initial Render
    this.render();
    this.renderChatbot();
    this.renderFloatingChat();

    // 7. Listen for In-Sheet Real-Time Sync from sheet.html
    window.addEventListener('storage', (e) => {
      if (e.key === 'NMC_ADS_DATA_SYNC' || e.key === 'NMC_LEADS_DATA_SYNC') {
        const storedAds = localStorage.getItem('NMC_ADS_DATA_SYNC');
        const storedLeads = localStorage.getItem('NMC_LEADS_DATA_SYNC');
        if (storedAds) NMC_DATA_STORE.adsData = JSON.parse(storedAds);
        if (storedLeads) NMC_DATA_STORE.leadsData = JSON.parse(storedLeads);
        this.populateFilterDropdowns();
        this.render();
      }
    });
  },

  /**
   * Set Date Range Presets
   */
  setDatePreset(presetKey) {
    let startStr = '2026-07-01';
    let endStr = '2026-08-31';

    const now = new Date();
    const today = new Date(2026, 7, 31);
    let start = new Date(today);

    if (presetKey === '7d') {
      start.setDate(today.getDate() - 7);
      startStr = start.toISOString().split('T')[0];
      endStr = today.toISOString().split('T')[0];
    } else if (presetKey === '14d') {
      start.setDate(today.getDate() - 14);
      startStr = start.toISOString().split('T')[0];
      endStr = today.toISOString().split('T')[0];
    } else if (presetKey === '30d') {
      start.setDate(today.getDate() - 30);
      startStr = start.toISOString().split('T')[0];
      endStr = today.toISOString().split('T')[0];
    } else if (presetKey === 'mtd') {
      startStr = '2026-08-01';
      endStr = '2026-08-31';
    } else if (presetKey === 'all') {
      startStr = '2020-01-01';
      endStr = '2030-12-31';
    }

    this.filters.startDate = startStr;
    this.filters.endDate = endStr;

    const startInput = document.getElementById('filterStartDate');
    const endInput = document.getElementById('filterEndDate');
    if (startInput) startInput.value = this.filters.startDate;
    if (endInput) endInput.value = this.filters.endDate;

    document.querySelectorAll('.date-preset-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.preset === presetKey);
    });
  },

  populateFilterDropdowns() {
    const branchSelect = document.getElementById('filterBranch');
    const depSelect = document.getElementById('filterDepartment');
    const doctorSelect = document.getElementById('filterDoctor');

    if (branchSelect) {
      const branches = Array.from(new Set(NMC_DATA_STORE.adsData.map(a => a.Hospital_Branch))).sort();
      branchSelect.innerHTML = '<option value="ALL">All Hospitals & Clinics</option>' +
        branches.map(b => `<option value="${b}">${b}</option>`).join('');
    }

    if (depSelect) {
      const departments = Array.from(new Set(NMC_DATA_STORE.adsData.map(a => a.Department_Speciality))).sort();
      depSelect.innerHTML = '<option value="ALL">All Clinical Departments</option>' +
        departments.map(d => `<option value="${d}">${d}</option>`).join('');
    }

    if (doctorSelect) {
      const doctors = Array.from(new Set(NMC_DATA_STORE.leadsData.map(l => l.Doctor))).filter(Boolean).sort();
      doctorSelect.innerHTML = '<option value="ALL">All Doctors / Consultants</option>' +
        doctors.map(doc => `<option value="${doc}">${doc}</option>`).join('');
    }
  },

  attachEventListeners() {
    // Big Top Navigation Tabs
    document.querySelectorAll('.main-tab-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.currentTarget.dataset.tab;
        this.switchMainTab(tab);
      });
    });

    // Territory Pills
    document.querySelectorAll('.territory-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const territory = e.currentTarget.dataset.territory;
        this.setTerritory(territory);
      });
    });

    // Date Preset Buttons
    document.querySelectorAll('.date-preset-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.setDatePreset(e.currentTarget.dataset.preset);
        this.render();
      });
    });

    // Date Inputs
    const startInput = document.getElementById('filterStartDate');
    const endInput = document.getElementById('filterEndDate');
    if (startInput) {
      startInput.addEventListener('change', (e) => {
        this.filters.startDate = e.target.value;
        this.render();
      });
    }
    if (endInput) {
      endInput.addEventListener('change', (e) => {
        this.filters.endDate = e.target.value;
        this.render();
      });
    }

    // Dropdown Filters
    const branchSelect = document.getElementById('filterBranch');
    const depSelect = document.getElementById('filterDepartment');
    const doctorSelect = document.getElementById('filterDoctor');
    const leadStatusSelect = document.getElementById('filterLeadStatus');
    const searchInput = document.getElementById('filterSearch');

    if (branchSelect) {
      branchSelect.addEventListener('change', (e) => {
        this.filters.hospitalBranch = e.target.value;
        this.render();
      });
    }
    if (depSelect) {
      depSelect.addEventListener('change', (e) => {
        this.filters.department = e.target.value;
        this.render();
      });
    }
    if (doctorSelect) {
      doctorSelect.addEventListener('change', (e) => {
        this.filters.doctor = e.target.value;
        this.render();
      });
    }
    if (leadStatusSelect) {
      leadStatusSelect.addEventListener('change', (e) => {
        this.filters.leadStatus = e.target.value;
        this.render();
      });
    }
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filters.searchQuery = e.target.value;
        this.render();
      });
    }

    // Reset Filters Button
    const resetBtn = document.getElementById('btnResetFilters');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.filters.hospitalBranch = 'ALL';
        this.filters.department = 'ALL';
        this.filters.doctor = 'ALL';
        this.filters.leadStatus = 'ALL';
        this.filters.nextStepFilter = 'ALL';
        this.filters.searchQuery = '';
        if (branchSelect) branchSelect.value = 'ALL';
        if (depSelect) depSelect.value = 'ALL';
        if (doctorSelect) doctorSelect.value = 'ALL';
        if (leadStatusSelect) leadStatusSelect.value = 'ALL';
        if (searchInput) searchInput.value = '';
        this.setDatePreset('30d');
        this.setTerritory('ALL');
      });
    }

    // Next Step Filter Pills
    document.querySelectorAll('.step-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        const step = e.currentTarget.dataset.step;
        this.setNextStepFilter(step);
      });
    });

    // View Level Toggle Buttons
    document.querySelectorAll('.view-level-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const level = e.currentTarget.dataset.level;
        this.setViewLevel(level);
      });
    });

    // Full Tab Chatbot Submit Form & Chips
    const chatInput = document.getElementById('chatbotInput');
    const btnSendChat = document.getElementById('btnSendChat');
    if (btnSendChat && chatInput) {
      const sendMsg = () => {
        const val = chatInput.value.trim();
        if (!val) return;
        this.sendChatMessage(val);
        chatInput.value = '';
      };
      btnSendChat.addEventListener('click', sendMsg);
      chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendMsg();
      });
    }

    // Floating Widget Chatbot Submit Form
    const floatChatInput = document.getElementById('floatChatbotInput');
    const btnFloatSendChat = document.getElementById('btnFloatSendChat');
    if (btnFloatSendChat && floatChatInput) {
      const sendFloatMsg = () => {
        const val = floatChatInput.value.trim();
        if (!val) return;
        this.sendChatMessage(val);
        floatChatInput.value = '';
      };
      btnFloatSendChat.addEventListener('click', sendFloatMsg);
      floatChatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendFloatMsg();
      });
    }

    // Prompt Chips (both full page and floating)
    document.querySelectorAll('.chip-btn').forEach(chip => {
      chip.addEventListener('click', (e) => {
        const q = e.currentTarget.dataset.query;
        if (q) this.sendChatMessage(q);
      });
    });

    // Ingestion Handlers
    const btnIngestAdsCsv = document.getElementById('btnIngestAdsCsv');
    const btnIngestLeadsCsv = document.getElementById('btnIngestLeadsCsv');
    const adsCsvText = document.getElementById('adsCsvText');
    const leadsCsvText = document.getElementById('leadsCsvText');

    if (btnIngestAdsCsv && adsCsvText) {
      btnIngestAdsCsv.addEventListener('click', () => {
        const raw = adsCsvText.value;
        if (!raw.trim()) return alert('Please paste Google Ads data.');
        const parsedRows = NMC_DATA_STORE.parseDelimitedText(raw);
        const count = NMC_DATA_STORE.ingestAdsData(parsedRows);
        alert(`Successfully synchronized ${count} Google Ads records into dashboard!`);
      });
    }

    if (btnIngestLeadsCsv && leadsCsvText) {
      btnIngestLeadsCsv.addEventListener('click', () => {
        const raw = leadsCsvText.value;
        if (!raw.trim()) return alert('Please paste Call Center Leads data.');
        const parsedRows = NMC_DATA_STORE.parseDelimitedText(raw);
        const count = NMC_DATA_STORE.ingestLeadsData(parsedRows);
        alert(`Successfully synchronized ${count} Call Center Lead records into dashboard!`);
      });
    }

    // Real Google Sheet URL Ingestion
    const btnSyncSheetUrl = document.getElementById('btnSyncSheetUrl');
    const inputSheetUrl = document.getElementById('inputSheetUrl');
    
    // Auto-load previously saved Real Google Sheet URL
    const savedSheetUrl = localStorage.getItem('NMC_REAL_GOOGLE_SHEET_URL');
    if (savedSheetUrl && inputSheetUrl) {
      inputSheetUrl.value = savedSheetUrl;
    }

    if (btnSyncSheetUrl && inputSheetUrl) {
      btnSyncSheetUrl.addEventListener('click', async () => {
        const url = inputSheetUrl.value.trim();
        if (!url) return alert('Please enter your Google Sheet link (e.g. https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit).');
        
        btnSyncSheetUrl.disabled = true;
        btnSyncSheetUrl.textContent = '⏳ Fetching Real Google Sheet...';

        try {
          const result = await NMC_DATA_STORE.fetchFromRealGoogleSheet(url);
          alert(
            `✅ Successfully Connected to Real Google Sheet (ID: ${result.sheetId})!\n\n` +
            `• Ingested Google Ads rows: ${result.adsCount}\n` +
            `• Ingested Call Center leads: ${result.leadsCount}\n\n` +
            `All hospital scorecards, funnels, and tabular reports are now live synced!`
          );
        } catch (err) {
          alert(`⚠️ Connection Note:\n${err.message}\n\nPlease ensure the Google Sheet permissions are set to "Anyone with the link can view" (or File > Share > Anyone with link).`);
        } finally {
          btnSyncSheetUrl.disabled = false;
          btnSyncSheetUrl.textContent = '🔗 Connect & Stream Real Google Sheet';
        }
      });
    }

    // Subscribe to Data Store updates
    NMC_DATA_STORE.subscribe(() => {
      this.populateFilterDropdowns();
      this.render();
    });

    // Setup Modals
    this.setupModalEvents();
  },

  toggleFloatingChat() {
    const chatWin = document.getElementById('floatingChatWindow');
    const callout = document.getElementById('copilotCalloutBubble');
    if (callout) callout.style.display = 'none';

    if (chatWin) {
      this.isFloatingChatOpen = !this.isFloatingChatOpen;
      chatWin.classList.toggle('open', this.isFloatingChatOpen);
      if (this.isFloatingChatOpen) {
        this.renderFloatingChat();
        const input = document.getElementById('floatChatbotInput');
        if (input) input.focus();
      }
    }
  },

  switchMainTab(tabKey) {
    this.currentMainTab = tabKey;
    document.querySelectorAll('.main-tab-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabKey);
    });

    document.querySelectorAll('.tab-view-content').forEach(view => {
      view.style.display = view.id === `view-${tabKey}` ? 'block' : 'none';
    });

    if (tabKey === 'chatbot') {
      this.renderChatbot();
      const input = document.getElementById('chatbotInput');
      if (input) input.focus();
    }
  },

  openDirectGoogleSheet() {
    window.open(this.googleSheetDirectUrl, '_blank');
  },

  openMasterGoogleSheet() {
    this.switchMainTab('googlesheets');
    const el = document.getElementById('googleSheetWebCard');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  },

  setTerritory(territory) {
    this.currentTerritory = territory;
    this.filters.adAccount = territory;

    document.querySelectorAll('.territory-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.territory === territory);
    });

    this.render();
  },

  setNextStepFilter(stepKey) {
    this.nextStepFilter = stepKey;
    document.querySelectorAll('.step-pill').forEach(p => {
      p.classList.toggle('active', p.dataset.step === stepKey);
    });
    this.render();
  },

  setViewLevel(level) {
    this.currentViewLevel = level;
    document.querySelectorAll('.view-level-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.level === level);
    });
    this.render();
  },

  /**
   * Main Render Cycle
   */
  render() {
    const { filteredAds, filteredLeads } = NMC_ANALYTICS.filterData(
      NMC_DATA_STORE.adsData,
      NMC_DATA_STORE.leadsData,
      this.filters
    );

    const execMetrics = NMC_ANALYTICS.computeExecutiveMetrics(filteredAds, filteredLeads);
    const regionalData = NMC_ANALYTICS.getRegionalBreakdown(filteredAds, filteredLeads);
    const departmentData = NMC_ANALYTICS.getDepartmentBreakdown(filteredAds, filteredLeads);
    const callCenterData = NMC_ANALYTICS.getCallCenterAnalysis(filteredLeads);

    // 1. Update Territory Tab Badges
    this.updateTerritoryBadges();

    // 2. Render Top Collaborative KPI Ribbon (No Revenue)
    this.renderKpiRibbon(execMetrics);

    // 3. Render Top Fold Numerical Matrices
    this.renderNumericalFunnel(execMetrics);
    this.renderNumericalRegionalMatrix(regionalData);
    this.renderNumericalSpecialityMatrix(departmentData);
    this.renderNumericalCallCenterSummary(execMetrics, callCenterData);

    // 4. Render Tabular Data Table with Next Steps (No Revenue)
    this.renderExhaustiveFreezedTable(filteredAds, filteredLeads);
  },

  updateTerritoryBadges() {
    const territories = ['AUH', 'DXB', 'Northern Emirates', 'Sunny Clinics'];
    territories.forEach(t => {
      const count = NMC_DATA_STORE.adsData.filter(a => a.Ad_Account === t).length;
      const el = document.getElementById(`count-${t.replace(/\s+/g, '')}`);
      if (el) el.textContent = `${count} kw`;
    });
    const totalCount = NMC_DATA_STORE.adsData.length;
    const allEl = document.getElementById('count-ALL');
    if (allEl) allEl.textContent = `${totalCount} kw`;
  },

  renderKpiRibbon(m) {
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    const convCount = m.totalGoogleConv > 0 ? m.totalGoogleConv : m.totalLeads;
    const ctr = m.totalImpressions > 0 ? ((m.totalClicks / m.totalImpressions) * 100).toFixed(1) : '0.0';
    const convRate = m.totalClicks > 0 ? ((convCount / m.totalClicks) * 100).toFixed(1) : '0.0';
    const cpa = convCount > 0 ? (m.totalSpend / convCount).toFixed(2) : '0.00';

    setVal('kpiSpend', `AED ${Math.round(m.totalSpend).toLocaleString()}`);
    setVal('kpiAvgCPC', `AED ${m.overallAvgCPC.toFixed(2)}`);
    setVal('kpiClicks', m.totalClicks.toLocaleString());
    setVal('kpiImprCtr', `${m.totalImpressions.toLocaleString()} Impr. (${ctr}% CTR)`);
    setVal('kpiLeads', Math.round(convCount).toLocaleString());
    setVal('kpiConvRate', `${convRate}% Conv. Rate`);
    setVal('kpiCPA', `AED ${cpa}`);
    setVal('kpiBooked', `${m.totalBooked.toLocaleString()} (${m.bookingRate.toFixed(1)}%)`);
    setVal('kpiCPBA', `AED ${m.cpba > 0 ? m.cpba.toFixed(2) : '0.00'}`);
    setVal('kpiTopIS', `${m.avgTopIS.toFixed(1)}%`);
    setVal('kpiRespTime', `${m.avgResponseTimeMins} mins`);
  },

  renderNumericalFunnel(m) {
    const convCount = m.totalGoogleConv > 0 ? m.totalGoogleConv : m.totalLeads;
    const ctr = m.totalImpressions > 0 ? ((m.totalClicks / m.totalImpressions) * 100).toFixed(1) : 0;
    const cvr = m.totalClicks > 0 ? ((convCount / m.totalClicks) * 100).toFixed(1) : 0;
    const cpa = convCount > 0 ? (m.totalSpend / convCount).toFixed(2) : '0.00';

    const setBox = (idVal, idSub, val, sub) => {
      const elVal = document.getElementById(idVal);
      const elSub = document.getElementById(idSub);
      if (elVal) elVal.textContent = val;
      if (elSub) elSub.textContent = sub;
    };

    setBox('funnelValImpr', 'funnelSubImpr', m.totalImpressions.toLocaleString(), '100% Reach');
    setBox('funnelValClicks', 'funnelSubClicks', m.totalClicks.toLocaleString(), `${ctr}% CTR`);
    setBox('funnelValLeads', 'funnelSubLeads', Math.round(convCount).toLocaleString(), `${cvr}% Conv. Rate`);
    setBox('funnelValCPA', 'funnelSubCPA', `AED ${cpa}`, 'Ad CPA');
    setBox('funnelValBooked', 'funnelSubBooked', m.totalBooked.toLocaleString(), `${m.bookingRate.toFixed(1)}% Book Rate`);
    setBox('funnelValSurgeries', 'funnelSubSurgeries', `AED ${m.cpba > 0 ? m.cpba.toFixed(2) : '0.00'}`, 'Cost Per Appt');
  },

  renderNumericalRegionalMatrix(regions) {
    const tbody = document.getElementById('tbodyRegionalMatrix');
    if (!tbody) return;
    tbody.innerHTML = regions.map(r => {
      const cpa = r.totalLeads > 0 ? (r.totalSpend / r.totalLeads).toFixed(2) : '0.00';
      return `
        <tr>
          <td style="font-weight:700; color:#0b2545;">${r.territory}</td>
          <td class="cell-numeric">AED ${Math.round(r.totalSpend).toLocaleString()}</td>
          <td class="cell-numeric">${r.totalClicks.toLocaleString()}</td>
          <td class="cell-numeric">AED ${r.overallAvgCPC.toFixed(2)}</td>
          <td class="cell-numeric">${r.totalLeads.toLocaleString()}</td>
          <td class="cell-numeric">AED ${cpa}</td>
          <td class="cell-numeric"><strong>${r.totalBooked}</strong> <span style="font-size:0.75rem; color:#64748b;">(${r.bookingRate.toFixed(1)}%)</span></td>
          <td class="cell-numeric" style="font-weight:700; color:#028090;">AED ${r.cpba > 0 ? r.cpba.toFixed(2) : '0.00'}</td>
          <td class="cell-numeric" style="color:#00a896; font-weight:700;">${r.avgTopIS.toFixed(1)}%</td>
        </tr>
      `;
    }).join('');
  },

  renderNumericalSpecialityMatrix(departments) {
    const tbody = document.getElementById('tbodySpecialityMatrix');
    if (!tbody) return;
    tbody.innerHTML = departments.slice(0, 8).map(d => {
      const cpa = d.totalLeads > 0 ? (d.totalSpend / d.totalLeads).toFixed(2) : '0.00';
      const avgCpc = d.totalClicks > 0 ? (d.totalSpend / d.totalClicks).toFixed(2) : '0.00';
      return `
        <tr>
          <td style="font-weight:700; color:#0b2545;">${d.department}</td>
          <td class="cell-numeric">AED ${Math.round(d.totalSpend).toLocaleString()}</td>
          <td class="cell-numeric">${d.totalClicks.toLocaleString()}</td>
          <td class="cell-numeric">AED ${avgCpc}</td>
          <td class="cell-numeric">${d.totalLeads.toLocaleString()}</td>
          <td class="cell-numeric">AED ${cpa}</td>
          <td class="cell-numeric"><strong>${d.totalBooked}</strong> <span style="font-size:0.75rem; color:#64748b;">(${d.bookingRate.toFixed(1)}%)</span></td>
          <td class="cell-numeric" style="font-weight:700; color:#028090;">AED ${d.cpba > 0 ? d.cpba.toFixed(2) : '0.00'}</td>
        </tr>
      `;
    }).join('');
  },

  renderNumericalCallCenterSummary(exec, cc) {
    const tbody = document.getElementById('tbodyCallCenterSummary');
    if (!tbody) return;
    const topLost = Object.entries(cc.lostReasonsCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

    tbody.innerHTML = topLost.map(l => {
      const pct = exec.totalNotBooked > 0 ? ((l[1] / exec.totalNotBooked) * 100).toFixed(1) : 0;
      return `
        <tr>
          <td style="font-weight:600; color:#334155;">${l[0]}</td>
          <td class="cell-numeric" style="font-weight:700; color:#b91c1c;">${l[1]} inquiries</td>
          <td class="cell-numeric"><span class="badge badge-pause">${pct}% of lost</span></td>
        </tr>
      `;
    }).join('');
  },

  /**
   * Render Tabular Grid (Fully Structured Columns, Zero Overlap, No Revenue)
   */
  renderExhaustiveFreezedTable(ads, leads) {
    const tbody = document.getElementById('tbodyExhaustiveAds');
    if (!tbody) return;

    let list = [];

    if (this.currentViewLevel === 'keyword') {
      const kwMap = {};
      ads.forEach(a => {
        const key = `${a.Keyword}__${a.Campaign_Name}__${a.Match_Type}`;
        if (!kwMap[key]) {
          kwMap[key] = {
            id: key,
            primaryName: a.Keyword,
            subName: a.Match_Type,
            match: a.Match_Type,
            campaign: a.Campaign_Name,
            adGroup: a.Ad_Group_Name,
            branch: a.Hospital_Branch,
            department: a.Department_Speciality,
            account: a.Ad_Account,
            qs: a.Quality_Score,
            expCtr: a.Expected_CTR,
            adRel: a.Ad_Relevance,
            lpExp: a.Landing_Page_Exp,
            impressions: 0,
            clicks: 0,
            cost: 0,
            conversions: 0,
            topIS: a.Search_Top_IS || 0,
            absTopIS: a.Search_Abs_Top_IS || 0,
            lostBudget: a.Search_Lost_IS_Budget || 0,
            lostRank: a.Search_Lost_IS_Rank || 0,
            booked: 0,
            attended: 0,
            surgeries: 0,
            matchedLeads: []
          };
        }
        kwMap[key].impressions += (a.Impressions || 0);
        kwMap[key].clicks += (a.Clicks || 0);
        kwMap[key].cost += (a.Cost || 0);
        kwMap[key].conversions += (a.Conversions || 0);
      });

      leads.forEach(l => {
        const match = Object.values(kwMap).find(k => k.primaryName.toLowerCase() === (l.Keyword || '').toLowerCase() && k.department === l.Department);
        if (match) {
          match.matchedLeads.push(l);
          if (l.Status === 'Booked' || l.Status === 'Attended' || l.Status === 'Surgery Scheduled') match.booked++;
          if (l.Status === 'Attended' || l.Status === 'Surgery Scheduled') match.attended++;
          if (l.Status === 'Surgery Scheduled') match.surgeries++;
        }
      });

      list = Object.values(kwMap);
    } else if (this.currentViewLevel === 'campaign') {
      const cmpMap = {};
      ads.forEach(a => {
        const key = a.Campaign_Name;
        if (!cmpMap[key]) {
          cmpMap[key] = {
            id: key,
            primaryName: a.Campaign_Name,
            subName: `${a.Campaign_Type}`,
            match: 'Various',
            campaign: a.Campaign_Name,
            adGroup: 'All Ad Groups',
            branch: a.Hospital_Branch,
            department: a.Department_Speciality,
            account: a.Ad_Account,
            qs: a.Quality_Score,
            impressions: 0,
            clicks: 0,
            cost: 0,
            conversions: 0,
            topISSum: 0,
            absTopISSum: 0,
            lostBudgetSum: 0,
            lostRankSum: 0,
            booked: 0,
            attended: 0,
            surgeries: 0,
            matchedLeads: []
          };
        }
        cmpMap[key].impressions += (a.Impressions || 0);
        cmpMap[key].clicks += (a.Clicks || 0);
        cmpMap[key].cost += (a.Cost || 0);
        cmpMap[key].conversions += (a.Conversions || 0);
        cmpMap[key].topISSum += (a.Search_Top_IS || 0) * (a.Impressions || 1);
        cmpMap[key].absTopISSum += (a.Search_Abs_Top_IS || 0) * (a.Impressions || 1);
        cmpMap[key].lostBudgetSum += (a.Search_Lost_IS_Budget || 0) * (a.Impressions || 1);
        cmpMap[key].lostRankSum += (a.Search_Lost_IS_Rank || 0) * (a.Impressions || 1);
      });

      leads.forEach(l => {
        const match = cmpMap[l.Campaign_Name];
        if (match) {
          match.matchedLeads.push(l);
          if (l.Status === 'Booked' || l.Status === 'Attended' || l.Status === 'Surgery Scheduled') match.booked++;
          if (l.Status === 'Attended' || l.Status === 'Surgery Scheduled') match.attended++;
          if (l.Status === 'Surgery Scheduled') match.surgeries++;
        }
      });

      list = Object.values(cmpMap).map(c => ({
        ...c,
        topIS: c.impressions > 0 ? Number((c.topISSum / c.impressions).toFixed(1)) : 70,
        absTopIS: c.impressions > 0 ? Number((c.absTopISSum / c.impressions).toFixed(1)) : 45,
        lostBudget: c.impressions > 0 ? Number((c.lostBudgetSum / c.impressions).toFixed(1)) : 15,
        lostRank: c.impressions > 0 ? Number((c.lostRankSum / c.impressions).toFixed(1)) : 10
      }));
    } else if (this.currentViewLevel === 'branch') {
      const brMap = {};
      ads.forEach(a => {
        const key = a.Hospital_Branch;
        if (!brMap[key]) {
          brMap[key] = {
            id: key,
            primaryName: a.Hospital_Branch,
            subName: a.Ad_Account,
            match: 'Facility Wide',
            campaign: `${a.Hospital_Branch} Campaigns`,
            adGroup: 'All Departments',
            branch: a.Hospital_Branch,
            department: 'Multi-Speciality',
            account: a.Ad_Account,
            qs: 8,
            impressions: 0,
            clicks: 0,
            cost: 0,
            conversions: 0,
            topISSum: 0,
            absTopISSum: 0,
            lostBudgetSum: 0,
            lostRankSum: 0,
            booked: 0,
            attended: 0,
            surgeries: 0,
            matchedLeads: []
          };
        }
        brMap[key].impressions += (a.Impressions || 0);
        brMap[key].clicks += (a.Clicks || 0);
        brMap[key].cost += (a.Cost || 0);
        brMap[key].conversions += (a.Conversions || 0);
        brMap[key].topISSum += (a.Search_Top_IS || 0) * (a.Impressions || 1);
        brMap[key].absTopISSum += (a.Search_Abs_Top_IS || 0) * (a.Impressions || 1);
        brMap[key].lostBudgetSum += (a.Search_Lost_IS_Budget || 0) * (a.Impressions || 1);
        brMap[key].lostRankSum += (a.Search_Lost_IS_Rank || 0) * (a.Impressions || 1);
      });

      leads.forEach(l => {
        const match = brMap[l.Branch];
        if (match) {
          match.matchedLeads.push(l);
          if (l.Status === 'Booked' || l.Status === 'Attended' || l.Status === 'Surgery Scheduled') match.booked++;
          if (l.Status === 'Attended' || l.Status === 'Surgery Scheduled') match.attended++;
          if (l.Status === 'Surgery Scheduled') match.surgeries++;
        }
      });

      list = Object.values(brMap).map(b => ({
        ...b,
        topIS: b.impressions > 0 ? Number((b.topISSum / b.impressions).toFixed(1)) : 75,
        absTopIS: b.impressions > 0 ? Number((b.absTopISSum / b.impressions).toFixed(1)) : 48,
        lostBudget: b.impressions > 0 ? Number((b.lostBudgetSum / b.impressions).toFixed(1)) : 12,
        lostRank: b.impressions > 0 ? Number((b.lostRankSum / b.impressions).toFixed(1)) : 8
      }));
    } else if (this.currentViewLevel === 'department') {
      const depMap = {};
      ads.forEach(a => {
        const key = a.Department_Speciality;
        if (!depMap[key]) {
          depMap[key] = {
            id: key,
            primaryName: a.Department_Speciality,
            subName: 'Clinical Speciality',
            match: 'Speciality Wide',
            campaign: `${a.Department_Speciality} UAE`,
            adGroup: 'All Branches',
            branch: 'All NMC Facilities',
            department: a.Department_Speciality,
            account: a.Ad_Account,
            qs: 8,
            impressions: 0,
            clicks: 0,
            cost: 0,
            conversions: 0,
            topISSum: 0,
            absTopISSum: 0,
            lostBudgetSum: 0,
            lostRankSum: 0,
            booked: 0,
            attended: 0,
            surgeries: 0,
            matchedLeads: []
          };
        }
        depMap[key].impressions += (a.Impressions || 0);
        depMap[key].clicks += (a.Clicks || 0);
        depMap[key].cost += (a.Cost || 0);
        depMap[key].conversions += (a.Conversions || 0);
        depMap[key].topISSum += (a.Search_Top_IS || 0) * (a.Impressions || 1);
        depMap[key].absTopISSum += (a.Search_Abs_Top_IS || 0) * (a.Impressions || 1);
        depMap[key].lostBudgetSum += (a.Search_Lost_IS_Budget || 0) * (a.Impressions || 1);
        depMap[key].lostRankSum += (a.Search_Lost_IS_Rank || 0) * (a.Impressions || 1);
      });

      leads.forEach(l => {
        const match = depMap[l.Department];
        if (match) {
          match.matchedLeads.push(l);
          if (l.Status === 'Booked' || l.Status === 'Attended' || l.Status === 'Surgery Scheduled') match.booked++;
          if (l.Status === 'Attended' || l.Status === 'Surgery Scheduled') match.attended++;
          if (l.Status === 'Surgery Scheduled') match.surgeries++;
        }
      });

      list = Object.values(depMap).map(d => ({
        ...d,
        topIS: d.impressions > 0 ? Number((d.topISSum / d.impressions).toFixed(1)) : 78,
        absTopIS: d.impressions > 0 ? Number((d.absTopISSum / d.impressions).toFixed(1)) : 52,
        lostBudget: d.impressions > 0 ? Number((d.lostBudgetSum / d.impressions).toFixed(1)) : 10,
        lostRank: d.impressions > 0 ? Number((d.lostRankSum / d.impressions).toFixed(1)) : 8
      }));
    }

    list = list.map(item => {
      const nextStep = NMC_ANALYTICS.determineNextStep(item);
      return { ...item, nextStep };
    });

    const stepCounts = { ALL: list.length, SCALE: 0, BID_UP: 0, BID_DOWN: 0, PAUSE: 0, LANDING_PAGE: 0 };
    list.forEach(k => {
      if (stepCounts[k.nextStep.actionKey] !== undefined) {
        stepCounts[k.nextStep.actionKey]++;
      }
    });

    const setPillCount = (key, count) => {
      const el = document.getElementById(`pill-count-${key}`);
      if (el) el.textContent = `(${count})`;
    };
    setPillCount('ALL', stepCounts.ALL);
    setPillCount('SCALE', stepCounts.SCALE);
    setPillCount('BID_UP', stepCounts.BID_UP);
    setPillCount('BID_DOWN', stepCounts.BID_DOWN);
    setPillCount('PAUSE', stepCounts.PAUSE);
    setPillCount('LANDING_PAGE', stepCounts.LANDING_PAGE);

    if (this.nextStepFilter !== 'ALL') {
      list = list.filter(k => k.nextStep.actionKey === this.nextStepFilter);
    }

    list.sort((a, b) => b.cost - a.cost);

    tbody.innerHTML = list.slice(0, 150).map(k => {
      const avgCpc = k.clicks > 0 ? (k.cost / k.clicks).toFixed(2) : '0.00';
      const cpa = k.conversions > 0 ? (k.cost / k.conversions).toFixed(2) : '0.00';
      const convRate = k.clicks > 0 ? ((k.conversions / k.clicks) * 100).toFixed(1) : '0.0';
      const cpba = k.booked > 0 ? (k.cost / k.booked).toFixed(2) : '0.00';
      const matchBadge = k.match === 'Exact' ? 'badge-exact' : k.match === 'Phrase' ? 'badge-phrase' : 'badge-broad';
      const qsBadge = k.qs >= 8 ? 'badge-qs-high' : k.qs >= 6 ? 'badge-qs-med' : 'badge-qs-low';

      window[`ROW_DATA_${encodeURIComponent(k.id)}`] = k;

      return `
        <tr>
          <!-- Column 1: Keyword / Search Term (Sticky Left) -->
          <td class="sticky-col-1">
            <span class="tb-text-bold" style="cursor:pointer;" onclick="APP.openInspector('${encodeURIComponent(k.id)}')">
              ${k.primaryName}
            </span>
            <div style="display:flex; gap:4px; align-items:center; margin-top:2px;">
              <span class="badge ${matchBadge}">${k.match}</span>
              ${k.qs ? `<span class="badge ${qsBadge}">QS ${k.qs}/10</span>` : ''}
            </div>
          </td>

          <!-- Column 2: Hospital Branch (Sticky Left) -->
          <td class="sticky-col-2">
            <span class="tb-text-bold" style="font-size:0.83rem;">${k.branch}</span>
            <span class="tb-text-sub">${k.account}</span>
          </td>

          <!-- Column 3: Department / Speciality -->
          <td>
            <span class="tb-text-bold" style="color:#00a896; font-size:0.82rem;">${k.department}</span>
          </td>

          <!-- Column 4: Next Steps / Optimization Action Directive -->
          <td>
            <div class="tb-action-card">
              <span class="next-step-badge ${k.nextStep.badgeClass}">${k.nextStep.title}</span>
              <span class="tb-action-desc">${k.nextStep.directive}</span>
            </div>
          </td>

          <!-- Column 5: Campaign Name -->
          <td>
            <span class="tb-text-campaign">${k.campaign}</span>
          </td>

          <!-- Column 6: Ad Group Name -->
          <td>
            <span class="tb-text-adgroup">${k.adGroup}</span>
          </td>

          <!-- Column 7: Traffic Numbers -->
          <td class="cell-numeric">${k.impressions.toLocaleString()}</td>
          <td class="cell-numeric">${k.clicks.toLocaleString()}</td>
          <td class="cell-numeric" style="font-weight:600;">AED ${avgCpc}</td>
          <td class="cell-numeric" style="font-weight:800; color:#0b2545;">AED ${Math.round(k.cost).toLocaleString()}</td>

          <!-- Column 8: Conversions & CPA -->
          <td class="cell-numeric"><strong>${k.conversions}</strong></td>
          <td class="cell-numeric">${convRate}%</td>
          <td class="cell-numeric">AED ${cpa}</td>

          <!-- Column 9: Impression Share Details -->
          <td class="cell-numeric" style="font-weight:700; color:#00a896;">${k.topIS}%</td>
          <td class="cell-numeric">${k.absTopIS}%</td>
          <td class="cell-numeric" style="color:#e63946;">${k.lostRank}%</td>
          <td class="cell-numeric" style="color:#f59e0b;">${k.lostBudget}%</td>

          <!-- Column 10: Call Center Bookings & Patient Economics -->
          <td class="cell-numeric" style="font-weight:700; color:#047857;">${k.booked}</td>
          <td class="cell-numeric" style="font-weight:700; color:#028090;">AED ${cpba}</td>
        </tr>
      `;
    }).join('');
  },

  sendChatMessage(queryText) {
    NMC_CHATBOT.chatHistory.push({ role: 'user', text: queryText });

    const aiResponseText = NMC_CHATBOT.processQuery(queryText, this.filters);
    NMC_CHATBOT.chatHistory.push({ role: 'assistant', text: aiResponseText });

    this.renderChatbot();
    this.renderFloatingChat();
  },

  parseMarkdownHelper(text) {
    let html = text
      .replace(/^### (.*$)/gim, '<h3 style="color:#0b2545; font-size:1rem; margin-bottom:0.35rem; font-weight:700;">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 style="color:#0b2545; font-size:1.1rem; margin-bottom:0.35rem; font-weight:800;">$1</h2>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/\n\n/gim, '<br><br>')
      .replace(/\n- /gim, '<br>• ');

    if (html.includes('|')) {
      const lines = html.split('<br><br>');
      html = lines.map(block => {
        if (block.includes('|---')) {
          const rows = block.trim().split('<br>');
          let tableHtml = '<table class="data-table" style="margin:0.4rem 0; font-size:0.78rem;">';
          rows.forEach((r, idx) => {
            if (r.includes('|---')) return;
            const cells = r.split('|').filter(c => c.trim().length > 0);
            if (cells.length === 0) return;
            if (idx === 0) {
              tableHtml += '<thead><tr>' + cells.map(c => `<th>${c.trim()}</th>`).join('') + '</tr></thead><tbody>';
            } else {
              tableHtml += '<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>';
            }
          });
          tableHtml += '</tbody></table>';
          return tableHtml;
        }
        return block;
      }).join('<br><br>');
    }

    return html;
  },

  renderChatbot() {
    const container = document.getElementById('chatMessagesContainer');
    if (!container) return;

    container.innerHTML = NMC_CHATBOT.chatHistory.map(msg => {
      const bubbleClass = msg.role === 'user' ? 'user' : 'assistant';
      return `
        <div class="chat-bubble ${bubbleClass}">
          ${this.parseMarkdownHelper(msg.text)}
        </div>
      `;
    }).join('');

    container.scrollTop = container.scrollHeight;
  },

  renderFloatingChat() {
    const container = document.getElementById('floatingChatBody');
    if (!container) return;

    container.innerHTML = NMC_CHATBOT.chatHistory.map(msg => {
      const bubbleClass = msg.role === 'user' ? 'user' : 'assistant';
      return `
        <div class="chat-bubble ${bubbleClass}" style="padding:0.75rem 0.95rem; font-size:0.82rem; max-width:90%;">
          ${this.parseMarkdownHelper(msg.text)}
        </div>
      `;
    }).join('');

    container.scrollTop = container.scrollHeight;
  },

  openInspector(encodedId) {
    const item = window[`ROW_DATA_${encodedId}`];
    if (!item) return;

    const modal = document.getElementById('modalInspector');
    if (!modal) return;

    const setEl = (id, html) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = html;
    };

    const cpba = item.booked > 0 ? (item.cost / item.booked).toFixed(2) : '0.00';

    setEl('inspectTitle', `${item.primaryName}`);
    setEl('inspectSubtitle', `${item.branch} • ${item.department} (${item.account})`);
    setEl('inspectActionBadge', `<span class="next-step-badge ${item.nextStep.badgeClass}">${item.nextStep.title}</span>`);
    setEl('inspectDirective', item.nextStep.directive);

    setEl('inspectQS', `${item.qs || 8}/10`);
    setEl('inspectExpCtr', item.expCtr || 'Above average');
    setEl('inspectAdRel', item.adRel || 'Above average');
    setEl('inspectLpExp', item.lpExp || 'Above average');

    setEl('inspectSpend', `AED ${Math.round(item.cost).toLocaleString()}`);
    setEl('inspectConv', `${item.conversions} Leads`);
    setEl('inspectBooked', `${item.booked} Confirmed`);
    setEl('inspectCPBA', `AED ${cpba}`);
    setEl('inspectAttended', `${item.attended}`);

    const leadsTbody = document.getElementById('inspectLeadsTbody');
    if (leadsTbody) {
      if (item.matchedLeads && item.matchedLeads.length > 0) {
        leadsTbody.innerHTML = item.matchedLeads.map(l => {
          const statusClass = l.Status === 'Booked' ? 'status-booked' :
            l.Status === 'Attended' ? 'status-attended' :
            l.Status === 'Surgery Scheduled' ? 'status-surgery' :
            l.Status === 'Not Booked' ? 'status-not-booked' : 'status-no-show';
          return `
            <tr>
              <td style="font-weight:700;">${l.ID}</td>
              <td>${l.Patient}</td>
              <td>${l.Doctor}</td>
              <td><span class="status-pill ${statusClass}">${l.Status}</span></td>
              <td>${l['Appointment Date'] || '—'} ${l['Appointment Time']}</td>
              <td>${l['Response Time']}</td>
              <td><span style="font-size:0.75rem; color:#64748b;">${l.Lost_Reason || '—'}</span></td>
            </tr>
          `;
        }).join('');
      } else {
        leadsTbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#64748b; padding:1rem;">No direct matching CRM patient records found for this specific filter slice.</td></tr>`;
      }
    }

    modal.classList.add('open');
  },

  setupModalEvents() {
    const modalSchema = document.getElementById('modalSchema');
    const modalParser = document.getElementById('modalParser');
    const modalInspector = document.getElementById('modalInspector');

    const btnOpenParser = document.getElementById('btnOpenParser');
    if (btnOpenParser && modalParser) {
      btnOpenParser.addEventListener('click', () => modalParser.classList.add('open'));
    }

    document.querySelectorAll('.modal-close, .modal-backdrop').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target === el || el.classList.contains('modal-close')) {
          if (modalSchema) modalSchema.classList.remove('open');
          if (modalParser) modalParser.classList.remove('open');
          if (modalInspector) modalInspector.classList.remove('open');
        }
      });
    });

    const testInput = document.getElementById('parserTestInput');
    const btnRunParserTest = document.getElementById('btnRunParserTest');
    const parserResultBox = document.getElementById('parserResultBox');

    if (btnRunParserTest && testInput && parserResultBox) {
      const runTest = () => {
        const text = testInput.value.trim();
        const parsed = NMC_PARSER.parseCampaign(text);
        parserResultBox.innerHTML = `
          <div style="margin-bottom:0.4rem;"><strong>Ad Account / Territory:</strong> <span style="color:#00a896; font-weight:700;">${parsed.adAccount}</span></div>
          <div style="margin-bottom:0.4rem;"><strong>Hospital Branch:</strong> <span style="color:#0b2545; font-weight:700;">${parsed.hospitalBranch}</span></div>
          <div style="margin-bottom:0.4rem;"><strong>Department / Speciality:</strong> <span style="color:#028090; font-weight:700;">${parsed.department}</span></div>
          <div style="margin-bottom:0.4rem;"><strong>Campaign Type:</strong> ${parsed.campaignType}</div>
          <div style="margin-bottom:0.4rem;"><strong>Audience & Intent:</strong> ${parsed.intent} (${parsed.language})</div>
          <div><strong>Extraction Confidence:</strong> ${(parsed.confidence * 100).toFixed(0)}%</div>
        `;
      };
      btnRunParserTest.addEventListener('click', runTest);
      testInput.addEventListener('input', runTest);
    }
  },

  downloadAdsTemplate() {
    const csv = NMC_DATA_STORE.getGoogleAdsCsvTemplate();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'NMC_Google_Ads_Keywords_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  downloadLeadsTemplate() {
    const csv = NMC_DATA_STORE.getCallCenterCsvTemplate();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'NMC_Call_Center_Leads_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  exportFilteredKeywords() {
    const { filteredAds } = NMC_ANALYTICS.filterData(
      NMC_DATA_STORE.adsData,
      NMC_DATA_STORE.leadsData,
      this.filters
    );
    const headers = Object.keys(filteredAds[0] || {}).join(',');
    const rows = filteredAds.map(r => Object.values(r).map(v => `"${v}"`).join(','));
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `NMC_Keywords_Export_${this.filters.startDate}_to_${this.filters.endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  copyBulkActionPlan() {
    const { filteredAds } = NMC_ANALYTICS.filterData(
      NMC_DATA_STORE.adsData,
      NMC_DATA_STORE.leadsData,
      this.filters
    );

    const lines = [
      'Campaign\tAd Group\tKeyword\tMatch Type\tAction Directive\tTarget Adjustment'
    ];

    filteredAds.slice(0, 100).forEach(a => {
      const next = NMC_ANALYTICS.determineNextStep({
        cost: a.Cost,
        clicks: a.Clicks,
        conversions: a.Conversions,
        qs: a.Quality_Score,
        topIS: a.Search_Top_IS,
        absTopIS: a.Search_Abs_Top_IS,
        lostBudget: a.Search_Lost_IS_Budget,
        lostRank: a.Search_Lost_IS_Rank,
        match: a.Match_Type,
        lpExp: a.Landing_Page_Exp,
        booked: Math.round(a.Conversions * 0.5)
      });

      if (next.actionKey !== 'MAINTAIN') {
        lines.push(`${a.Campaign_Name}\t${a.Ad_Group_Name}\t${a.Keyword}\t${a.Match_Type}\t${next.title}\t${next.directive}`);
      }
    });

    navigator.clipboard.writeText(lines.join('\n'));
    alert('Copied Bulk Optimization Action Plan to Clipboard (Tab-Delimited for Google Ads Editor / Sheets)!');
  }
};

window.APP = APP;

document.addEventListener('DOMContentLoaded', () => {
  APP.init();
});



  