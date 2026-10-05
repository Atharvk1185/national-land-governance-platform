/**
 * Policy Performance Dashboard Component.
 * Tracks national land policies, performance indicators, targets vs achievements,
 * budget allocations, and visual traffic-light compliance indicators.
 */

import { api } from '../api.js';

export async function renderPolicyDashboard(container) {
  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
      <div>
        <h1 style="font-size:22px; font-weight:800; color:var(--gov-navy-900); letter-spacing:-0.3px;">
          National Land Policy Performance & Implementation Monitor
        </h1>
        <p style="font-size:12px; color:var(--gov-slate-500);">
          Tracking targets, budgets, spatial outcomes, and state compliance indicators across national land reforms.
        </p>
      </div>
      <div style="display:flex; gap:10px;">
        <span class="badge badge-green">Green: Performing (>75)</span>
        <span class="badge badge-yellow">Yellow: Needs Attention (55-75)</span>
        <span class="badge badge-red">Red: Underperforming (<55)</span>
      </div>
    </div>

    <!-- Policy Filter Bar -->
    <div style="display:flex; gap:10px; margin-bottom:16px;">
      <input type="text" id="policy-filter-input" placeholder="Search policies by keyword (e.g. SVAMITVA, DILRMP, Forest Rights)..." 
             style="flex:1; padding:8px 14px; border:1px solid var(--gov-slate-300); border-radius:var(--radius-sm); font-size:13px;" />
      <select id="policy-status-filter" class="role-select">
        <option value="All">All Statuses</option>
        <option value="green">Performing (Green)</option>
        <option value="yellow">Needs Attention (Yellow)</option>
        <option value="red">Underperforming (Red)</option>
      </select>
    </div>

    <!-- Policies Cards List -->
    <div id="policies-list-container" style="display:flex; flex-direction:column; gap:16px;">
      <div style="text-align:center; padding:30px; color:var(--gov-slate-500);">Loading policy framework database...</div>
    </div>
  `;

  const inputEl = document.getElementById('policy-filter-input');
  const statusFilterEl = document.getElementById('policy-status-filter');
  const listContainer = document.getElementById('policies-list-container');

  let allPolicies = [];

  try {
    const res = await api.getPolicies();
    allPolicies = res.policies || [];
    renderPolicies(allPolicies);
  } catch (err) {
    listContainer.innerHTML = `<div class="card" style="color:var(--gov-danger);">Error loading policies: ${err.message}</div>`;
  }

  function renderPolicies(policies) {
    if (!policies.length) {
      listContainer.innerHTML = `<div class="card" style="text-align:center; color:var(--gov-slate-500);">No policies match the selected criteria.</div>`;
      return;
    }

    listContainer.innerHTML = policies.map(p => {
      let indicators = {};
      try {
        indicators = typeof p.indicators_json === 'string' ? JSON.parse(p.indicators_json) : (p.indicators_json || {});
      } catch (e) {}

      const statusBadge = p.status_color === 'green' 
        ? '<span class="badge badge-green">Performing (Score: ' + p.score + '/100)</span>'
        : (p.status_color === 'yellow' 
          ? '<span class="badge badge-yellow">Needs Attention (Score: ' + p.score + '/100)</span>'
          : '<span class="badge badge-red">Underperforming (Score: ' + p.score + '/100)</span>');

      return `
        <div class="card" style="border-left: 5px solid ${p.status_color === 'green' ? 'var(--gov-success)' : (p.status_color === 'yellow' ? 'var(--gov-warning)' : 'var(--gov-danger)')};">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
            <div>
              <span class="badge badge-blue" style="margin-right:6px;">${p.code}</span>
              <span style="font-size:12px; color:var(--gov-slate-500); font-weight:600;">Year: ${p.year} | ${p.department}</span>
              <h3 style="font-size:16px; font-weight:800; color:var(--gov-navy-900); margin-top:4px;">
                ${p.title}
              </h3>
            </div>
            ${statusBadge}
          </div>

          <p style="font-size:13px; color:var(--gov-slate-700); line-height:1.6; margin-bottom:12px;">
            ${p.description}
          </p>

          <!-- Key Targets & Coverage -->
          <div class="grid-3" style="margin-bottom:12px; background:var(--gov-slate-50); padding:10px; border-radius:var(--radius-sm); font-size:11px;">
            <div><strong>Target Mandate:</strong> ${p.target}</div>
            <div><strong>Geographic Coverage:</strong> ${p.coverage}</div>
            <div><strong>Budget Allocation:</strong> ₹ ${p.budget_cr ? p.budget_cr.toLocaleString() : 'N/A'} Crore</div>
          </div>

          <!-- Indicators Grid -->
          ${Object.keys(indicators).length > 0 ? `
            <div style="margin-bottom:12px;">
              <span style="font-size:11px; font-weight:700; color:var(--gov-slate-600); text-transform:uppercase;">
                Monitored Performance Indicators:
              </span>
              <div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:6px;">
                ${Object.entries(indicators).map(([k, v]) => `
                  <div style="background:#fff; border:1px solid var(--gov-slate-200); padding:4px 8px; border-radius:4px; font-size:11px;">
                    <span style="color:var(--gov-slate-500);">${k.replace(/_/g, ' ')}:</span> <strong>${typeof v === 'number' ? v.toLocaleString() : v}</strong>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Outcomes & Challenges -->
          <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--gov-slate-100); padding-top:10px; font-size:12px;">
            <div style="color:var(--gov-slate-600); max-width:70%;">
              <strong>Key Outcome:</strong> ${p.outcomes}
            </div>
            <div style="display:flex; gap:8px;">
              <a href="#simulator?policy=${encodeURIComponent(p.code)}" class="btn btn-outline" style="font-size:11px; padding:4px 10px;">
                Simulate Scenarios →
              </a>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function filterPolicies() {
    const q = inputEl.value.toLowerCase();
    const st = statusFilterEl.value;

    const filtered = allPolicies.filter(p => {
      const matchText = (p.title + ' ' + p.code + ' ' + p.description).toLowerCase().includes(q);
      const matchStatus = st === 'All' || p.status_color === st;
      return matchText && matchStatus;
    });

    renderPolicies(filtered);
  }

  inputEl.addEventListener('input', filterPolicies);
  statusFilterEl.addEventListener('change', filterPolicies);
}
