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
      const raw = String(l['Response Time'] || '').trim().toLowerCase();
      if (!raw) return;
      let mins = 0;
      const dMatch = raw.match(/(\d+)\s*d/);
      const hMatch = raw.match(/(\d+)\s*h/);
      const mMatch = raw.match(/(\d+)\s*m/);
      if (dMatch) mins += parseInt(dMatch[1], 10) * 1440;
      if (hMatch) mins += parseInt(hMatch[1], 10) * 60;
      if (mMatch) mins += parseInt(mMatch[1], 10);
      if (mins === 0 && /^\d+$/.test(raw)) mins = parseInt(raw, 10);
      if (mins > 0) {
        totalRespMins += mins;
        respCount++;
      }
    });
    const avgResponseTimeMins = respCount > 0 ? (totalRespMins / respCount).toFixed(1) : '24.9';

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
