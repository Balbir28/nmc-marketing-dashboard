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
        
        topIS = this.extractNum(row, 'Search impr. share', 'Search_Impr_Share', 'Search_Top_IS') || 75;
        absTopIS = this.extractNum(row, 'Search abs. top IS', 'Search_Abs_Top_IS') || 45;
        lostRank = this.extractNum(row, 'Search lost IS (rank)', 'Search_Lost_IS_Rank') || 10;
        lostBudget = this.extractNum(row, 'Search lost IS (budget)', 'Search_Lost_IS_Budget') || 15;
        phoneCalls = this.extractNum(row, 'Phone calls', 'Phone_Calls') || 0;
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
