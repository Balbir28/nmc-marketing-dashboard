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
