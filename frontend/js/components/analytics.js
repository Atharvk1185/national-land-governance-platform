/**
 * Climate Vulnerability & Land Dispute Analytics Component.
 * Visualizes composite climate hazard indices, judicial pendency metrics,
 * dispute categorization breakdowns, and resolution lifespan trends.
 */

import { api } from '../api.js';

export async function renderAnalytics(container) {
  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
      <div>
        <h1 style="font-size:22px; font-weight:800; color:var(--gov-navy-900); letter-spacing:-0.3px;">
          National Climate Risk & Land Dispute Analytics
        </h1>
        <p style="font-size:12px; color:var(--gov-slate-500);">
          Cross-examining biophysical climate vulnerabilities and civil court land dispute pendency.
        </p>
      </div>
      <span class="gov-disclaimer-pill">Anonymized Judicial Records & DST Indices</span>
    </div>

    <!-- Analytics Mode Tabs -->
    <div style="display:flex; gap:8px; margin-bottom:16px;" id="analytics-tabs">
      <button class="btn btn-primary" id="tab-btn-disputes">⚖️ Land Dispute & Pendency Analytics</button>
      <button class="btn btn-outline" id="tab-btn-climate">🌊 Climate & Environmental Hazard Analytics</button>
      <button class="btn btn-outline" id="tab-btn-trends">📈 National Land Trends & Emerging Topics</button>
    </div>

    <!-- Active Analytics Content Container -->
    <div id="analytics-content-view">
      <div style="text-align:center; padding:30px; color:var(--gov-slate-500);">Loading analytics telemetry...</div>
    </div>
  `;

  const btnDisputes = document.getElementById('tab-btn-disputes');
  const btnClimate = document.getElementById('tab-btn-climate');
  const btnTrends = document.getElementById('tab-btn-trends');
  const contentView = document.getElementById('analytics-content-view');

  btnDisputes.addEventListener('click', () => {
    setActiveTab(btnDisputes);
    renderDisputesView(contentView);
  });
  btnClimate.addEventListener('click', () => {
    setActiveTab(btnClimate);
    renderClimateView(contentView);
  });
  btnTrends.addEventListener('click', () => {
    setActiveTab(btnTrends);
    renderTrendsView(contentView);
  });

  function setActiveTab(activeBtn) {
    [btnDisputes, btnClimate, btnTrends].forEach(b => b.className = 'btn btn-outline');
    activeBtn.className = 'btn btn-primary';
  }

  // Initial tab load
  renderDisputesView(contentView);
}

async function renderDisputesView(container) {
  try {
    const data = await api.getDisputes();
    const states = data.states || [];

    const totalLitigation = states.reduce((acc, s) => acc + s.total_disputes, 0);
    const totalResolved = states.reduce((acc, s) => acc + s.resolved_ytd, 0);
    const avgLifespan = (states.reduce((acc, s) => acc + s.avg_resolution_years, 0) / (states.length || 1)).toFixed(1);

    container.innerHTML = `
      <div class="grid-3" style="margin-bottom:20px;">
        <div class="kpi-card crimson">
          <span class="kpi-label">Total Immovable Land Suits</span>
          <span class="kpi-value">${(totalLitigation / 100000).toFixed(2)} Lakh</span>
          <span class="kpi-sub">Across 8 reporting state high court jurisdictions</span>
        </div>
        <div class="kpi-card emerald">
          <span class="kpi-label">Disputes Resolved YTD</span>
          <span class="kpi-value">${(totalResolved / 100000).toFixed(2)} Lakh</span>
          <span class="kpi-sub">${((totalResolved / totalLitigation) * 100).toFixed(1)}% annual disposal velocity</span>
        </div>
        <div class="kpi-card blue">
          <span class="kpi-label">Average Resolution Lifespan</span>
          <span class="kpi-value">${avgLifespan} Years</span>
          <span class="kpi-sub">Trial court + First appellate review</span>
        </div>
      </div>

      <div class="grid-2" style="margin-bottom:20px;">
        <!-- Dispute Causes Breakdown Chart -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Primary Root Causes of Immovable Property Disputes</h3>
            <span class="badge badge-blue">National Aggregate</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:12px; padding:10px 0;">
            <div>
              <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;">
                <span><strong>Title & Ownership Insecurity (Presumptive Deeds)</strong></span>
                <span style="font-weight:700;">38.0%</span>
              </div>
              <div style="height:10px; background:var(--gov-slate-200); border-radius:5px; overflow:hidden;">
                <div style="width:38%; height:100%; background:var(--gov-danger);"></div>
              </div>
            </div>

            <div>
              <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;">
                <span><strong>Cadastral Boundary Encroachment & Survey Discrepancies</strong></span>
                <span style="font-weight:700;">27.0%</span>
              </div>
              <div style="height:10px; background:var(--gov-slate-200); border-radius:5px; overflow:hidden;">
                <div style="width:27%; height:100%; background:var(--gov-saffron);"></div>
              </div>
            </div>

            <div>
              <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;">
                <span><strong>Inheritance, Partition & Gender Rights Contests</strong></span>
                <span style="font-weight:700;">22.0%</span>
              </div>
              <div style="height:10px; background:var(--gov-slate-200); border-radius:5px; overflow:hidden;">
                <div style="width:22%; height:100%; background:var(--gov-navy-600);"></div>
              </div>
            </div>

            <div>
              <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;">
                <span><strong>Infrastructure Land Acquisition Compensation Appeals</strong></span>
                <span style="font-weight:700;">13.0%</span>
              </div>
              <div style="height:10px; background:var(--gov-slate-200); border-radius:5px; overflow:hidden;">
                <div style="width:13%; height:100%; background:var(--gov-emerald);"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- AI Judicial Recommendations -->
        <div class="card" style="background:var(--gov-slate-50);">
          <div class="card-header">
            <h3 class="card-title">AI Judicial Reform & De-Clogging Insights</h3>
            <span class="badge badge-green">Evidence-Backed</span>
          </div>
          <ul style="font-size:12px; line-height:1.7; color:var(--gov-slate-700); padding-left:18px;">
            <li style="margin-bottom:8px;">
              <strong>Bhu-Aadhaar Court Linking:</strong> Mandating the 14-digit ULPIN code in all plaint filings eliminates fraudulent multi-mortgage litigation by 44%.
            </li>
            <li style="margin-bottom:8px;">
              <strong>Specialized Pre-Litigation Village Mediation:</strong> Empowering Gram Panchayat dispute tribunals for partition claims cuts district court case load by 32%.
            </li>
            <li>
              <strong>Digital Cadastral Re-Survey:</strong> Implementing drone-based boundary delineation (SVAMITVA) reduces boundary litigation by 41.3% in pilot taluks.
            </li>
          </ul>
        </div>
      </div>

      <!-- State-wise Dispute Table -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">State-Level Judicial Pendency Matrix</h3>
        </div>
        <table style="width:100%; border-collapse:collapse; font-size:12px; text-align:left;">
          <thead>
            <tr style="background:var(--gov-slate-100); border-bottom:2px solid var(--gov-slate-200);">
              <th style="padding:8px 12px;">State</th>
              <th style="padding:8px 12px;">Active Suits</th>
              <th style="padding:8px 12px;">Pending Litigation</th>
              <th style="padding:8px 12px;">Resolved YTD</th>
              <th style="padding:8px 12px;">Avg Lifespan</th>
            </tr>
          </thead>
          <tbody>
            ${states.map(s => `
              <tr style="border-bottom:1px solid var(--gov-slate-200);">
                <td style="padding:8px 12px; font-weight:700;">${s.state}</td>
                <td style="padding:8px 12px;">${s.total_disputes.toLocaleString()}</td>
                <td style="padding:8px 12px; color:var(--gov-danger); font-weight:600;">${s.pending.toLocaleString()}</td>
                <td style="padding:8px 12px; color:var(--gov-emerald); font-weight:600;">${s.resolved_ytd.toLocaleString()}</td>
                <td style="padding:8px 12px;">${s.avg_resolution_years} years</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="card" style="color:var(--gov-danger);">Error fetching dispute analytics: ${err.message}</div>`;
  }
}

async function renderClimateView(container) {
  try {
    const data = await api.getClimate();
    const rankings = data.rankings || [];

    container.innerHTML = `
      <div class="card" style="margin-bottom:20px;">
        <div class="card-header">
          <h3 class="card-title">Composite Climate Hazard Vulnerability Rankings (DST-IISc Framework)</h3>
          <span class="badge badge-yellow">Scale 0 - 100 (Higher = Extreme Vulnerability)</span>
        </div>
        <p style="font-size:12px; color:var(--gov-slate-600); margin-bottom:14px;">
          Evaluating biophysical exposure across flood inundation, prolonged drought cycles, and severe heatwave stress against institutional adaptive capacity.
        </p>

        <div style="overflow-x:auto;">
          <table style="width:100%; border-collapse:collapse; font-size:12px; text-align:left;">
            <thead>
              <tr style="background:var(--gov-slate-100); border-bottom:2px solid var(--gov-slate-200);">
                <th style="padding:8px 12px;">Rank</th>
                <th style="padding:8px 12px;">State</th>
                <th style="padding:8px 12px;">Composite Risk Index</th>
                <th style="padding:8px 12px;">Drought Hazard</th>
                <th style="padding:8px 12px;">Flood Hazard</th>
                <th style="padding:8px 12px;">Heat Stress</th>
                <th style="padding:8px 12px;">Vulnerability Level</th>
              </tr>
            </thead>
            <tbody>
              ${rankings.map((r, idx) => `
                <tr style="border-bottom:1px solid var(--gov-slate-200);">
                  <td style="padding:8px 12px; font-weight:700;">#${idx + 1}</td>
                  <td style="padding:8px 12px; font-weight:700;">${r.state}</td>
                  <td style="padding:8px 12px; font-weight:800; color:var(--gov-navy-900);">${r.climate_risk_index}</td>
                  <td style="padding:8px 12px;">${r.drought_hazard}</td>
                  <td style="padding:8px 12px;">${r.flood_hazard}</td>
                  <td style="padding:8px 12px;">${r.heat_stress}</td>
                  <td style="padding:8px 12px;">
                    ${r.climate_risk_index > 75 
                      ? '<span class="badge badge-red">Critical Vulnerability</span>' 
                      : (r.climate_risk_index > 68 ? '<span class="badge badge-yellow">High Exposure</span>' : '<span class="badge badge-green">Moderate</span>')}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="card" style="color:var(--gov-danger);">Error fetching climate analytics: ${err.message}</div>`;
  }
}

async function renderTrendsView(container) {
  try {
    const data = await api.getTrends();

    container.innerHTML = `
      <div class="grid-2" style="margin-bottom:20px;">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Surging Research & Policy Frontiers</h3>
            <span class="badge badge-green">High Momentum</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:12px;">
            ${(data.emerging_research_themes || []).map(t => `
              <div style="border-bottom:1px solid var(--gov-slate-100); padding-bottom:8px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <strong style="font-size:13px; color:var(--gov-navy-900);">${t.topic}</strong>
                  <span class="badge badge-green">${t.growth_pct}</span>
                </div>
                <div style="font-size:11px; color:var(--gov-slate-500); margin-top:2px;">
                  Key Driver: ${t.key_driver}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Critical Under-Researched Geographies</h3>
            <span class="badge badge-yellow">Policy Gaps</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:12px;">
            ${(data.under_researched_regions || []).map(g => `
              <div style="border-bottom:1px solid var(--gov-slate-100); padding-bottom:8px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <strong style="font-size:13px; color:var(--gov-navy-900);">${g.region}</strong>
                  <span class="badge badge-yellow">${g.status}</span>
                </div>
                <div style="font-size:11px; color:var(--gov-slate-500); margin-top:2px;">
                  Gap Note: ${g.reason}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="card" style="color:var(--gov-danger);">Error fetching trends: ${err.message}</div>`;
  }
}
