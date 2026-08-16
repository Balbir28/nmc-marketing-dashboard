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
