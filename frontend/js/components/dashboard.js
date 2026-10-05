/**
 * National Dashboard Component for NLGIRP.
 * Renders high-impact government KPIs, publication trends chart,
 * state-level land governance metrics, and quick action launchpads.
 */

import { api } from '../api.js';

export async function renderDashboard(container) {
  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
      <div>
        <h1 style="font-size:22px; font-weight:800; color:var(--gov-navy-900); letter-spacing:-0.3px;">
          National Land Governance & Policy Intelligence Dashboard
        </h1>
        <p style="font-size:12px; color:var(--gov-slate-500); margin-top:2px;">
          Centralized research ecosystem, cadastral intelligence, and evidence-backed decision support across Indian states.
        </p>
      </div>
      <div style="display:flex; gap:10px;">
        <button class="btn btn-outline" id="btn-export-kpis">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export Summary
        </button>
        <button class="btn btn-saffron" id="btn-quick-ask">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          AI Research Search
        </button>
      </div>
    </div>

    <!-- National Statistics KPI Cards -->
    <div class="grid-4" id="kpi-grid" style="margin-bottom:24px;">
      <div class="kpi-card blue">
        <span class="kpi-label">Research Publications</span>
        <span class="kpi-value" id="kpi-research">52</span>
        <span class="kpi-sub">Peer-reviewed studies & policy briefs</span>
      </div>
      <div class="kpi-card emerald">
        <span class="kpi-label">National Datasets</span>
        <span class="kpi-value" id="kpi-datasets">31</span>
        <span class="kpi-sub">Spatial, cadastral & judicial catalogues</span>
      </div>
      <div class="kpi-card saffron">
        <span class="kpi-label">Bhu-Aadhaar Generated</span>
        <span class="kpi-value" id="kpi-parcels">22.4 Cr</span>
        <span class="kpi-sub">Geo-referenced 14-digit ULPIN parcels</span>
      </div>
      <div class="kpi-card crimson">
        <span class="kpi-label">Active Immovable Disputes</span>
        <span class="kpi-value" id="kpi-disputes">6.35 Lakh</span>
        <span class="kpi-sub">38.2% national clearance rate YTD</span>
      </div>
    </div>

    <!-- Charts & Action Section -->
    <div class="grid-2" style="margin-bottom:24px;">
      <!-- Publications & Policy Timeline Chart -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            Research Publications & Evidence Output (2018 - 2024)
          </h2>
          <span class="badge badge-blue">Annual Trend</span>
        </div>
        <div id="chart-publications" style="height:220px; display:flex; align-items:flex-end; gap:16px; padding:20px 10px 10px 10px; border-bottom:1px solid var(--gov-slate-200);">
          <!-- Dynamic SVG/HTML Bar Chart -->
        </div>
        <div style="display:flex; justify-content:space-between; margin-top:12px; font-size:11px; color:var(--gov-slate-500);">
          <span>Source: National Land Governance Research Repository</span>
          <span>Updated Monthly</span>
        </div>
      </div>

      <!-- Quick AI Interactive Launchpad -->
      <div class="card" style="background:linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%);">
        <div class="card-header">
          <h2 class="card-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
            Demonstration Workflow: Problem Statement Killer Demo
          </h2>
          <span class="badge badge-yellow">SIH Workflow</span>
        </div>
        <p style="font-size:12px; color:var(--gov-slate-600); margin-bottom:14px;">
          Execute the end-to-end evidence-based governance cycle with one-click triggers:
        </p>
        <div style="display:flex; flex-direction:column; gap:10px;">
          <button class="btn btn-outline" style="justify-content:flex-start; text-align:left; background:#fff;" id="demo-flow-step1">
            <span style="background:var(--gov-navy-700); color:#fff; width:20px; height:20px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; margin-right:8px;">1</span>
            <strong>Ask Question:</strong> "What are the major causes of agricultural land conversion in Maharashtra?"
          </button>
          <button class="btn btn-outline" style="justify-content:flex-start; text-align:left; background:#fff;" id="demo-flow-step2">
            <span style="background:var(--gov-navy-700); color:#fff; width:20px; height:20px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; margin-right:8px;">2</span>
            <strong>Inspect GIS:</strong> Explore Maharashtra 2015 vs 2025 Satellite Land-Use Changes
          </button>
          <button class="btn btn-outline" style="justify-content:flex-start; text-align:left; background:#fff;" id="demo-flow-step3">
            <span style="background:var(--gov-navy-700); color:#fff; width:20px; height:20px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; margin-right:8px;">3</span>
            <strong>Simulate Policy:</strong> Test 70% Agri-protection + 2.5x Compensation scenario
          </button>
          <button class="btn btn-emerald" style="justify-content:flex-start; text-align:left;" id="demo-flow-step4">
            <span style="background:#fff; color:var(--gov-emerald); width:20px; height:20px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; margin-right:8px;">4</span>
            <strong>Decision Support:</strong> Generate Evidence-Backed Policy Brief for State Government
          </button>
        </div>
      </div>
    </div>

    <!-- State Land Governance Matrix Table -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
          State-Wise Land Governance, Dispute, and Climate Risk Matrix
        </h2>
        <span class="badge badge-green">8 Reporting States</span>
      </div>
      <div style="overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; font-size:12px; text-align:left;">
          <thead>
            <tr style="background:var(--gov-slate-100); border-bottom:2px solid var(--gov-slate-200); color:var(--gov-slate-700);">
              <th style="padding:10px 14px;">State / Jurisdiction</th>
              <th style="padding:10px 14px;">Research Output</th>
              <th style="padding:10px 14px;">Bhu-Aadhaar %</th>
              <th style="padding:10px 14px;">Agricultural Land</th>
              <th style="padding:10px 14px;">Urban Built-up</th>
              <th style="padding:10px 14px;">Active Disputes</th>
              <th style="padding:10px 14px;">Climate Risk Index</th>
              <th style="padding:10px 14px;">Action</th>
            </tr>
          </thead>
          <tbody id="state-table-body">
            <tr><td colspan="8" style="padding:20px; text-align:center; color:var(--gov-slate-500);">Loading state metrics...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Fetch live stats & charts
  try {
    const stats = await api.getDashboardStats();
    document.getElementById('kpi-research').textContent = stats.total_research_publications || '52';
    document.getElementById('kpi-datasets').textContent = stats.total_datasets || '31';
    document.getElementById('kpi-parcels').textContent = `${stats.parcels_with_bhu_aadhaar_crores || 22.4} Cr`;
    document.getElementById('kpi-disputes').textContent = `${((stats.total_immovable_property_disputes || 635000) / 100000).toFixed(2)} Lakh`;

    const charts = await api.getDashboardCharts();
    renderPubChart(charts.publications_by_year);
    renderStateTable(charts.state_metrics);
  } catch (err) {
    console.error('Dashboard load error:', err);
  }

  // Attach Workflow triggers
  document.getElementById('btn-quick-ask').addEventListener('click', () => {
    window.location.hash = '#search';
  });
  document.getElementById('demo-flow-step1').addEventListener('click', () => {
    window.location.hash = '#search?q=causes+of+agricultural+land+conversion+in+Maharashtra';
  });
  document.getElementById('demo-flow-step2').addEventListener('click', () => {
    window.location.hash = '#gis?state=Maharashtra';
  });
  document.getElementById('demo-flow-step3').addEventListener('click', () => {
    window.location.hash = '#simulator?state=Maharashtra';
  });
  document.getElementById('demo-flow-step4').addEventListener('click', () => {
    window.location.hash = '#reports?state=Maharashtra';
  });
  document.getElementById('btn-export-kpis').addEventListener('click', () => {
    window.print();
  });
}

function renderPubChart(data) {
  const chartBox = document.getElementById('chart-publications');
  if (!chartBox) return;

  const sample = data && data.length > 0 ? data : [
    { year: 2018, count: 4 },
    { year: 2019, count: 6 },
    { year: 2020, count: 8 },
    { year: 2021, count: 11 },
    { year: 2022, count: 14 },
    { year: 2023, count: 18 },
    { year: 2024, count: 24 }
  ];

  const maxVal = Math.max(...sample.map(d => d.count), 1);
  chartBox.innerHTML = sample.map(d => {
    const heightPct = Math.round((d.count / maxVal) * 160);
    return `
      <div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:6px;">
        <span style="font-size:11px; font-weight:700; color:var(--gov-navy-800);">${d.count}</span>
        <div style="width:100%; max-width:38px; height:${heightPct}px; background:linear-gradient(180deg, var(--gov-navy-600) 0%, var(--gov-navy-800) 100%); border-radius:4px 4px 0 0; transition:height 0.4s ease;"></div>
        <span style="font-size:11px; font-weight:600; color:var(--gov-slate-600);">${d.year}</span>
      </div>
    `;
  }).join('');
}

function renderStateTable(states) {
  const tbody = document.getElementById('state-table-body');
  if (!tbody || !states) return;

  tbody.innerHTML = states.map(s => {
    const riskBadge = s.climate_risk > 75 
      ? '<span class="badge badge-red">High Risk</span>' 
      : (s.climate_risk > 65 ? '<span class="badge badge-yellow">Moderate</span>' : '<span class="badge badge-green">Low</span>');

    return `
      <tr style="border-bottom:1px solid var(--gov-slate-200); transition:background 0.15s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
        <td style="padding:10px 14px; font-weight:700; color:var(--gov-navy-900);">
          ${s.state} <span style="font-size:10px; color:var(--gov-slate-400); font-weight:500;">(${s.code})</span>
        </td>
        <td style="padding:10px 14px;"><strong>${s.research_count}</strong> papers</td>
        <td style="padding:10px 14px;"><span style="color:var(--gov-emerald); font-weight:700;">${s.bhu_aadhaar_pct}%</span></td>
        <td style="padding:10px 14px;">${s.agricultural_pct}%</td>
        <td style="padding:10px 14px;"><span style="color:var(--gov-saffron); font-weight:600;">${s.urban_pct}%</span></td>
        <td style="padding:10px 14px;">${s.disputes_total.toLocaleString()}</td>
        <td style="padding:10px 14px;">${s.climate_risk} ${riskBadge}</td>
        <td style="padding:10px 14px;">
          <a href="#gis?state=${encodeURIComponent(s.state)}" class="btn btn-outline" style="padding:4px 8px; font-size:11px;">Inspect GIS</a>
        </td>
      </tr>
    `;
  }).join('');
}
