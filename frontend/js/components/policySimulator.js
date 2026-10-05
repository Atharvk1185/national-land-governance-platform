/**
 * Policy Simulation Engine Component.
 * Enables policy makers and researchers to simulate multi-variable interventions,
 * observing economic, environmental, land-use, and social impact dynamics.
 */

import { api } from '../api.js';

export async function renderPolicySimulator(container, defaultState = 'Maharashtra') {
  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
      <div>
        <h1 style="font-size:22px; font-weight:800; color:var(--gov-navy-900); letter-spacing:-0.3px;">
          National Policy Simulation Sandbox & Scenario Modeler
        </h1>
        <p style="font-size:12px; color:var(--gov-slate-500);">
          Simulate legislative and planning interventions to forecast land-use shifts, acquisition velocities, and dispute impacts.
        </p>
      </div>
      <div style="display:flex; gap:10px;">
        <button class="btn btn-outline" id="btn-reset-sim">Reset Levers</button>
        <button class="btn btn-emerald" id="btn-export-sim-report">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          Export Scenario Brief
        </button>
      </div>
    </div>

    <!-- Mandatory Legal / Scientific Disclaimer Banner -->
    <div style="background:var(--gov-warning-light); border:1px solid #fcd34d; border-left:4px solid var(--gov-warning); padding:10px 16px; border-radius:var(--radius-md); margin-bottom:20px; display:flex; align-items:center; justify-content:space-between;">
      <div style="font-size:12px; color:#78350f;">
        <strong>Scientific Notice:</strong> AI-generated scenario simulation — Not an official government forecast. Used exclusively for academic and decision-support modeling.
      </div>
      <span class="badge badge-yellow">Parametric Elasticity Model</span>
    </div>

    <!-- Simulation Configuration Card -->
    <div class="card" style="margin-bottom:20px;">
      <div class="card-header">
        <h2 class="card-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          Scenario Target & Parametric Policy Levers
        </h2>
        <div style="display:flex; align-items:center; gap:10px;">
          <label style="font-size:11px; font-weight:600; color:var(--gov-slate-600);">Jurisdiction:</label>
          <select id="sim-state-select" class="role-select">
            <option value="Maharashtra">Maharashtra</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Odisha">Odisha</option>
            <option value="Gujarat">Gujarat</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
          </select>
        </div>
      </div>

      <!-- Levers Grid -->
      <div class="sim-controls-grid">
        <!-- Lever 1: Agricultural Land Protection -->
        <div class="sim-slider-group">
          <div class="sim-slider-header">
            <span>🌾 Agricultural Land Protection Quota</span>
            <span class="sim-slider-val" id="lbl-agri-prot">70%</span>
          </div>
          <input type="range" id="slider-agri-prot" min="20" max="95" step="5" value="70" />
          <div class="sim-slider-hint">Statutory restriction on conversion of prime multi-crop arable land.</div>
        </div>

        <!-- Lever 2: Urban Expansion Rate -->
        <div class="sim-slider-group">
          <div class="sim-slider-header">
            <span>🏙️ Urban Infill & Expansion Allowance</span>
            <span class="sim-slider-val" id="lbl-urban-growth">+10%</span>
          </div>
          <input type="range" id="slider-urban-growth" min="-10" max="35" step="1" value="10" />
          <div class="sim-slider-hint">Annual permitted built-up perimeter expansion around transit corridors.</div>
        </div>

        <!-- Lever 3: Acquisition Compensation Multiplier -->
        <div class="sim-slider-group">
          <div class="sim-slider-header">
            <span>💰 Land Acquisition Compensation Multiplier</span>
            <span class="sim-slider-val" id="lbl-comp-mult">2.5x</span>
          </div>
          <input type="range" id="slider-comp-mult" min="1.0" max="4.0" step="0.25" value="2.5" />
          <div class="sim-slider-hint">Ratio of compensation relative to registered circle rate (RFCTLARR 2013).</div>
        </div>

        <!-- Lever 4: Buffer Zone Strictness -->
        <div class="sim-slider-group">
          <div class="sim-slider-header">
            <span>💧 Waterbody & Wetland Eco-Buffer Enforcement</span>
            <span class="sim-slider-val" id="lbl-buffer-strict">80%</span>
          </div>
          <input type="range" id="slider-buffer-strict" min="30" max="100" step="5" value="80" />
          <div class="sim-slider-hint">Enforcement fidelity of 500m mandatory non-development hydrological rings.</div>
        </div>

        <!-- Lever 5: Title Guarantee Speed -->
        <div class="sim-slider-group" style="grid-column: span 2;">
          <div class="sim-slider-header">
            <span>📜 Bhu-Aadhaar & Conclusive Title Guarantee Adoption</span>
            <span class="sim-slider-val" id="lbl-title-speed">85%</span>
          </div>
          <input type="range" id="slider-title-speed" min="20" max="100" step="5" value="85" />
          <div class="sim-slider-hint">Pace of transitioning from presumptive registration to state-backed conclusive title indemnification.</div>
        </div>
      </div>

      <div style="display:flex; justify-content:flex-end;">
        <button class="btn btn-saffron" id="btn-recompute-sim">
          Compute Projected Scenario Outcomes
        </button>
      </div>
    </div>

    <!-- Projected Impact Results -->
    <div id="sim-results-container">
      <div style="text-align:center; padding:20px; color:var(--gov-slate-500);">Computing simulation baseline...</div>
    </div>
  `;

  const stateSelect = document.getElementById('sim-state-select');
  stateSelect.value = defaultState;

  // Sliders
  const sliderAgri = document.getElementById('slider-agri-prot');
  const sliderUrban = document.getElementById('slider-urban-growth');
  const sliderComp = document.getElementById('slider-comp-mult');
  const sliderBuffer = document.getElementById('slider-buffer-strict');
  const sliderTitle = document.getElementById('slider-title-speed');

  const lblAgri = document.getElementById('lbl-agri-prot');
  const lblUrban = document.getElementById('lbl-urban-growth');
  const lblComp = document.getElementById('lbl-comp-mult');
  const lblBuffer = document.getElementById('lbl-buffer-strict');
  const lblTitle = document.getElementById('lbl-title-speed');

  function updateSliderLabels() {
    lblAgri.textContent = `${sliderAgri.value}%`;
    lblUrban.textContent = `${sliderUrban.value > 0 ? '+' : ''}${sliderUrban.value}%`;
    lblComp.textContent = `${parseFloat(sliderComp.value).toFixed(2)}x`;
    lblBuffer.textContent = `${sliderBuffer.value}%`;
    lblTitle.textContent = `${sliderTitle.value}%`;
  }

  [sliderAgri, sliderUrban, sliderComp, sliderBuffer, sliderTitle].forEach(s => {
    s.addEventListener('input', () => {
      updateSliderLabels();
      triggerSimulation();
    });
  });

  stateSelect.addEventListener('change', () => triggerSimulation());
  document.getElementById('btn-recompute-sim').addEventListener('click', () => triggerSimulation());
  document.getElementById('btn-reset-sim').addEventListener('click', () => {
    sliderAgri.value = 70;
    sliderUrban.value = 10;
    sliderComp.value = 2.5;
    sliderBuffer.value = 80;
    sliderTitle.value = 85;
    updateSliderLabels();
    triggerSimulation();
  });

  document.getElementById('btn-export-sim-report').addEventListener('click', () => {
    window.location.hash = `#reports?state=${encodeURIComponent(stateSelect.value)}`;
  });

  async function triggerSimulation() {
    const resultsContainer = document.getElementById('sim-results-container');
    try {
      const payload = {
        state: stateSelect.value,
        agri_protection_pct: parseFloat(sliderAgri.value),
        urban_growth_rate: parseFloat(sliderUrban.value),
        compensation_multiplier: parseFloat(sliderComp.value),
        buffer_zone_strictness: parseFloat(sliderBuffer.value),
        title_guarantee_speed: parseFloat(sliderTitle.value)
      };
      const res = await api.runSimulation(payload);
      renderSimulationResults(resultsContainer, res);
    } catch (err) {
      resultsContainer.innerHTML = `<div class="card" style="color:var(--gov-danger);">Simulation execution failed: ${err.message}</div>`;
    }
  }

  function renderSimulationResults(targetEl, res) {
    targetEl.innerHTML = `
      <div class="grid-4" style="margin-bottom:20px;">
        <!-- Economic Result -->
        <div class="sim-result-box highlight">
          <div style="font-size:11px; font-weight:700; color:var(--gov-slate-500); text-transform:uppercase;">
            Project Clearance Time
          </div>
          <div style="font-size:24px; font-weight:800; color:var(--gov-emerald); margin:4px 0;">
            ${res.economic_impact.project_clearance_time_months} Months
          </div>
          <div style="font-size:11px; color:var(--gov-slate-600);">
            Down from <strong>28.4 mo</strong> (${res.economic_impact.time_saved_months} mo saved)
          </div>
        </div>

        <!-- Dispute Reduction -->
        <div class="sim-result-box highlight">
          <div style="font-size:11px; font-weight:700; color:var(--gov-slate-500); text-transform:uppercase;">
            Dispute Reduction
          </div>
          <div style="font-size:24px; font-weight:800; color:var(--gov-emerald); margin:4px 0;">
            -${res.social_dispute_impact.dispute_reduction_pct}%
          </div>
          <div style="font-size:11px; color:var(--gov-slate-600);">
            ~${res.social_dispute_impact.projected_disputes_prevented.toLocaleString()} civil lawsuits prevented
          </div>
        </div>

        <!-- Farmland Protected -->
        <div class="sim-result-box highlight">
          <div style="font-size:11px; font-weight:700; color:var(--gov-slate-500); text-transform:uppercase;">
            Farmland Protected (5-Yr)
          </div>
          <div style="font-size:24px; font-weight:800; color:var(--gov-navy-900); margin:4px 0;">
            ${res.land_use_impact.agri_hectares_protected_5yr.toLocaleString()} Ha
          </div>
          <div style="font-size:11px; color:var(--gov-slate-600);">
            Shielded from distress conversion
          </div>
        </div>

        <!-- Flood Resilience -->
        <div class="sim-result-box highlight">
          <div style="font-size:11px; font-weight:700; color:var(--gov-slate-500); text-transform:uppercase;">
            Flood Resilience Score
          </div>
          <div style="font-size:24px; font-weight:800; color:var(--gov-blue-500); margin:4px 0;">
            ${res.environmental_impact.flood_resilience_score} / 100
          </div>
          <div style="font-size:11px; color:var(--gov-slate-600);">
            Hydrological buffer retention
          </div>
        </div>
      </div>

      <!-- Comprehensive Evaluation Card -->
      <div class="card" style="margin-bottom:20px;">
        <div class="card-header">
          <h3 class="card-title">
            Detailed Multi-Domain Impact Evaluation (Scenario ID: ${res.simulation_id})
          </h3>
          <span class="badge badge-green">Overall Policy Viability: ${res.overall_viability_score}/100</span>
        </div>
        <div class="grid-2">
          <div>
            <h4 style="font-size:12px; font-weight:700; color:var(--gov-navy-900); margin-bottom:6px;">Economic & Farmer Security Dynamics:</h4>
            <p style="font-size:12px; color:var(--gov-slate-700); line-height:1.6; margin-bottom:12px;">
              ${res.economic_impact.summary}
            </p>
            <h4 style="font-size:12px; font-weight:700; color:var(--gov-navy-900); margin-bottom:6px;">Social Stability & Tenancy Formalization:</h4>
            <p style="font-size:12px; color:var(--gov-slate-700); line-height:1.6;">
              ${res.social_dispute_impact.summary}
            </p>
          </div>
          <div>
            <h4 style="font-size:12px; font-weight:700; color:var(--gov-navy-900); margin-bottom:6px;">Ecological Canopy & Wetland Integrity:</h4>
            <p style="font-size:12px; color:var(--gov-slate-700); line-height:1.6; margin-bottom:12px;">
              ${res.environmental_impact.summary}
            </p>
            <h4 style="font-size:12px; font-weight:700; color:var(--gov-navy-900); margin-bottom:6px;">Urban Sprawl Containment:</h4>
            <p style="font-size:12px; color:var(--gov-slate-700); line-height:1.6;">
              ${res.land_use_impact.summary}
            </p>
          </div>
        </div>

        <!-- Model Assumptions & Limitations -->
        <div style="margin-top:16px; padding-top:14px; border-top:1px solid var(--gov-slate-200); font-size:11px; color:var(--gov-slate-500);">
          <strong>Model Assumptions:</strong> ${res.assumptions.join(' | ')}<br/>
          <strong>Confidence Interval:</strong> ${res.confidence_interval} | <strong>Model:</strong> ${res.model_version}
        </div>
      </div>
    `;
  }

  // Initial trigger
  triggerSimulation();
}
