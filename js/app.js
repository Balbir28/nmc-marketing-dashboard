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
    if (!presetKey) return;

    let startStr = '2020-01-01';
    let endStr = '2030-12-31';

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

    document.querySelectorAll('.date-preset-group .date-preset-btn').forEach(btn => {
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
    this.renderSunnySpecialityMatrix(filteredAds, filteredLeads);
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

  renderSunnySpecialityMatrix(ads, leads) {
    const tbody = document.getElementById('tbodySunnySpecialityMatrix');
    if (!tbody) return;

    const sunnyAds = ads.filter(a => a.Ad_Account === 'Sunny Clinics');
    const sunnyLeads = leads.filter(l => l.Ad_Account === 'Sunny Clinics');

    const depMap = {};
    sunnyAds.forEach(a => {
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
      const depLeads = sunnyLeads.filter(l => l.Department === dep);
      const booked = depLeads.filter(l => l.Status === 'Booked' || l.Status === 'Attended' || l.Status === 'Surgery Scheduled').length;
      const spend = depMap[dep].spend || 0;
      const clicks = depMap[dep].clicks || 0;
      const impr = depMap[dep].impr || 0;
      const conv = depMap[dep].conversions || 0;
      const ctr = impr > 0 ? ((clicks / impr) * 100).toFixed(2) : '0.00';
      const avgCpc = clicks > 0 ? (spend / clicks).toFixed(2) : '0.00';
      const cpba = booked > 0 ? (spend / booked).toFixed(2) : '0.00';

      return {
        department: dep,
        spend,
        clicks,
        impr,
        conv,
        ctr,
        avgCpc,
        booked,
        cpba
      };
    }).sort((a, b) => b.spend - a.spend);

    tbody.innerHTML = results.map(d => `
      <tr>
        <td style="font-weight:700; color:#0b2545;">${d.department}</td>
        <td class="cell-numeric">AED ${Math.round(d.spend).toLocaleString()}</td>
        <td class="cell-numeric">${d.clicks.toLocaleString()}</td>
        <td class="cell-numeric">${d.impr.toLocaleString()} <span style="font-size:0.75rem; color:#64748b;">(${d.ctr}%)</span></td>
        <td class="cell-numeric">AED ${d.avgCpc}</td>
        <td class="cell-numeric">${d.conv}</td>
        <td class="cell-numeric"><strong>${d.booked}</strong></td>
        <td class="cell-numeric" style="font-weight:700; color:#028090;">AED ${d.cpba > 0 ? Number(d.cpba).toFixed(2) : '0.00'}</td>
      </tr>
    `).join('');
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
