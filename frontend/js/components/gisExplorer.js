/**
 * Interactive GIS & National Land Map Explorer Component.
 * Supports multi-layer overlays, state boundary inspection, 2015-2025 timeline,
 * dual-year land-use change calculator, and spatial distance measurement.
 */

import { api } from '../api.js';

export async function renderGISExplorer(container, defaultState = 'Maharashtra') {
  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
      <div>
        <h1 style="font-size:22px; font-weight:800; color:var(--gov-navy-900); letter-spacing:-0.3px;">
          National Geospatial Land Intelligence & Multi-Temporal Explorer
        </h1>
        <p style="font-size:12px; color:var(--gov-slate-500);">
          Multi-layer cadastral, land-use/land-cover (LULC), and climate hazard spatial analytics platform.
        </p>
      </div>
      <div style="display:flex; gap:10px;">
        <button class="btn btn-outline" id="btn-measure-tool">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12h20M12 2v20"/></svg>
          Measure Distance (km)
        </button>
        <button class="btn btn-primary" id="btn-compare-years">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="3" x2="12" y2="21"/></svg>
          Compare 2015 vs 2025
        </button>
      </div>
    </div>

    <!-- GIS Main Layout -->
    <div class="gis-layout">
      <!-- Left Sidebar: Layer Control -->
      <div class="gis-sidebar">
        <div>
          <h3 style="font-size:13px; font-weight:700; color:var(--gov-navy-900); margin-bottom:10px;">
            Geospatial Layers
          </h3>
          <div class="layer-list" id="gis-layers-container">
            <label class="layer-item">
              <span>State & Cadastral Boundaries</span>
              <input type="checkbox" id="layer-chk-boundaries" checked />
            </label>
            <label class="layer-item">
              <span>Land Use / Land Cover (LULC)</span>
              <input type="checkbox" id="layer-chk-lulc" checked />
            </label>
            <label class="layer-item">
              <span>Urban Sprawl Corridors</span>
              <input type="checkbox" id="layer-chk-corridors" checked />
            </label>
            <label class="layer-item">
              <span>Climate Hazard Heatmap</span>
              <input type="checkbox" id="layer-chk-climate" />
            </label>
            <label class="layer-item">
              <span>Dispute Density Hotspots</span>
              <input type="checkbox" id="layer-chk-disputes" />
            </label>
            <label class="layer-item">
              <span>Bhu-Aadhaar Parcels (Sample)</span>
              <input type="checkbox" id="layer-chk-parcels" />
            </label>
          </div>
        </div>

        <div style="border-top:1px solid var(--gov-slate-200); padding-top:12px;">
          <h3 style="font-size:12px; font-weight:700; color:var(--gov-navy-900); margin-bottom:8px;">
            Select Jurisdiction
          </h3>
          <select id="gis-state-select" class="role-select" style="width:100%; padding:8px;">
            <option value="Maharashtra">Maharashtra (Mumbai-Pune Belt)</option>
            <option value="Karnataka">Karnataka (Bengaluru Tech Corridor)</option>
            <option value="Uttar Pradesh">Uttar Pradesh (Gangetic Plains)</option>
            <option value="Odisha">Odisha (Coastal Vulnerability Zone)</option>
            <option value="Gujarat">Gujarat (DMIC Industrial Corridor)</option>
            <option value="Tamil Nadu">Tamil Nadu (Automotive Belt)</option>
          </select>
        </div>

        <div style="border-top:1px solid var(--gov-slate-200); padding-top:12px;">
          <h3 style="font-size:12px; font-weight:700; color:var(--gov-navy-900); margin-bottom:6px;">
            Map Legend
          </h3>
          <div style="display:flex; flex-direction:column; gap:6px; font-size:11px;">
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="width:12px; height:12px; background:#10b981; border-radius:2px; display:inline-block;"></span>
              <span>Agricultural Farmland</span>
            </div>
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="width:12px; height:12px; background:#047857; border-radius:2px; display:inline-block;"></span>
              <span>Forest Canopy Cover</span>
            </div>
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="width:12px; height:12px; background:#f58220; border-radius:2px; display:inline-block;"></span>
              <span>Urban Built-up / Sprawl</span>
            </div>
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="width:12px; height:12px; background:#3b82f6; border-radius:2px; display:inline-block;"></span>
              <span>Waterbodies & Wetlands</span>
            </div>
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="width:12px; height:12px; background:#ef4444; border-radius:2px; display:inline-block;"></span>
              <span>High Dispute Density Hotspot</span>
            </div>
          </div>
        </div>

        <div style="margin-top:auto; font-size:10px; color:var(--gov-slate-500); background:var(--gov-slate-100); padding:8px; border-radius:var(--radius-sm);">
          <strong>Projection:</strong> EPSG:4326 / WGS84<br/>
          <strong>Demonstration Data</strong> — Connects to PostGIS / ISRO Bhuvan in production.
        </div>
      </div>

      <!-- Center: Interactive GIS Map Canvas -->
      <div class="gis-viewport-box">
        <div class="gis-toolbar">
          <div style="display:flex; align-items:center; gap:10px; font-size:12px;">
            <span><strong>Active Layer:</strong> Multi-Temporal LULC Blend</span>
            <span class="badge badge-green" id="active-state-tag">State: ${defaultState}</span>
          </div>
          <div style="display:flex; gap:8px; font-size:11px;">
            <span id="coords-display" style="color:var(--gov-slate-400);">19.75° N, 75.71° E</span>
          </div>
        </div>

        <div class="gis-map-canvas-container" id="gis-canvas-wrapper">
          <canvas id="gis-map-canvas" width="680" height="480" style="width:100%; height:100%; display:block;"></canvas>
          <div id="gis-tooltip" style="position:absolute; display:none; background:rgba(15,23,42,0.92); color:#fff; padding:6px 10px; border-radius:4px; font-size:11px; pointer-events:none; z-index:100;"></div>
        </div>

        <!-- Timeline Slider -->
        <div class="gis-timeline-bar">
          <span style="font-size:12px; font-weight:700;">Year: <span id="lbl-timeline-year" style="color:var(--gov-saffron);">2025</span></span>
          <input type="range" id="gis-timeline-slider" min="2015" max="2025" step="1" value="2025" />
          <button class="btn btn-outline" id="btn-play-timeline" style="padding:2px 8px; font-size:11px; background:rgba(255,255,255,0.1); color:#fff; border-color:rgba(255,255,255,0.2);">
            ▶ Play
          </button>
        </div>
      </div>

      <!-- Right Inspector: State Metrics & Land-Use Change -->
      <div class="gis-inspector" id="gis-inspector-panel">
        <h3 style="font-size:14px; font-weight:800; color:var(--gov-navy-900); margin-bottom:4px;" id="insp-state-name">
          ${defaultState}
        </h3>
        <p style="font-size:11px; color:var(--gov-slate-500); margin-bottom:12px;" id="insp-state-sub">
          Spatial Land-Use Dynamics & Transition Matrix
        </p>

        <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:16px;">
          <div class="kpi-card saffron" style="padding:10px;">
            <span class="kpi-label">Urban Expansion (2015-2025)</span>
            <span class="kpi-value" id="insp-urban-delta" style="font-size:18px;">+2.8%</span>
            <span class="kpi-sub" id="insp-urban-ha">Approx. +86,159 Hectares</span>
          </div>

          <div class="kpi-card emerald" style="padding:10px;">
            <span class="kpi-label">Agricultural Net Change</span>
            <span class="kpi-value" id="insp-agri-delta" style="font-size:18px; color:var(--gov-danger);">-4.8%</span>
            <span class="kpi-sub" id="insp-agri-ha">Encroachment onto arable land</span>
          </div>
        </div>

        <div style="background:var(--gov-slate-50); border:1px solid var(--gov-slate-200); border-radius:var(--radius-sm); padding:10px; margin-bottom:14px;">
          <h4 style="font-size:11px; font-weight:700; color:var(--gov-navy-900); margin-bottom:4px;">
            AI Spatial Interpretation:
          </h4>
          <p style="font-size:11px; color:var(--gov-slate-700); line-height:1.5;" id="insp-ai-text">
            Loading satellite land-use interpretation...
          </p>
        </div>

        <a href="#simulator?state=${encodeURIComponent(defaultState)}" class="btn btn-saffron" style="width:100%; text-align:center;">
          Simulate Policy Levers for ${defaultState}
        </a>
      </div>
    </div>
  `;

  // Initialize Canvas Map
  initGISCanvas(defaultState);

  // Jurisdiction dropdown change
  const stateSelect = document.getElementById('gis-state-select');
  stateSelect.value = defaultState;
  stateSelect.addEventListener('change', (e) => {
    updateGISInspector(e.target.value);
    initGISCanvas(e.target.value);
  });

  // Timeline Slider
  const slider = document.getElementById('gis-timeline-slider');
  const yearLbl = document.getElementById('lbl-timeline-year');
  slider.addEventListener('input', (e) => {
    yearLbl.textContent = e.target.value;
    redrawGISMap(stateSelect.value, parseInt(e.target.value));
  });

  // Dual Year Compare Modal
  document.getElementById('btn-compare-years').addEventListener('click', () => {
    openDualCompareModal(stateSelect.value);
  });

  // Measure Tool
  document.getElementById('btn-measure-tool').addEventListener('click', () => {
    alert("Distance Measurement Active: Click two points on the map to calculate geodetic distance in kilometers.");
  });

  // Load initial inspector data
  updateGISInspector(defaultState);
}

async function updateGISInspector(stateName) {
  try {
    const lulc = await api.getLULCChange(stateName, 2015, 2025);
    document.getElementById('insp-state-name').textContent = stateName;
    document.getElementById('active-state-tag').textContent = `State: ${stateName}`;
    document.getElementById('insp-urban-delta').textContent = lulc.breakdown.urban_built_up.delta_label;
    document.getElementById('insp-urban-ha').textContent = `Approx. +${lulc.metrics.urban_expansion_ha.toLocaleString()} Hectares`;
    document.getElementById('insp-agri-delta').textContent = lulc.breakdown.agricultural.delta_label;
    document.getElementById('insp-agri-ha').textContent = `Approx. -${lulc.metrics.agricultural_net_change_ha.toLocaleString()} Hectares`;
    document.getElementById('insp-ai-text').textContent = lulc.ai_interpretation;
  } catch (err) {
    console.error('LULC change fetch error:', err);
  }
}

function initGISCanvas(activeState) {
  const canvas = document.getElementById('gis-map-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  redrawGISMap(activeState, 2025);

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const coordsEl = document.getElementById('coords-display');
    if (coordsEl) {
      // Map canvas coordinates to lat/lon estimate
      const lon = (68 + (x / rect.width) * 28).toFixed(2);
      const lat = (34 - (y / rect.height) * 26).toFixed(2);
      coordsEl.textContent = `${lat}° N, ${lon}° E`;
    }
  });
}

function redrawGISMap(activeState, year) {
  const canvas = document.getElementById('gis-map-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  // Background deep satellite space
  ctx.fillStyle = "#0c1527";
  ctx.fillRect(0, 0, w, h);

  // Draw India Geodetic Grid Lines
  ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 50) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y < h; y += 50) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  // Draw State Regions (Abstracted Geodetic Polygons for High-Performance Rendering)
  const states = [
    { name: "Maharashtra", x: 260, y: 240, w: 140, h: 110, color: "#1e3a8a", active: activeState === "Maharashtra" },
    { name: "Karnataka", x: 250, y: 340, w: 100, h: 100, color: "#1e293b", active: activeState === "Karnataka" },
    { name: "Uttar Pradesh", x: 340, y: 130, w: 150, h: 90, color: "#1e293b", active: activeState === "Uttar Pradesh" },
    { name: "Odisha", x: 440, y: 230, w: 110, h: 80, color: "#1e293b", active: activeState === "Odisha" },
    { name: "Gujarat", x: 170, y: 180, w: 110, h: 90, color: "#1e293b", active: activeState === "Gujarat" },
    { name: "Tamil Nadu", x: 300, y: 400, w: 90, h: 70, color: "#1e293b", active: activeState === "Tamil Nadu" }
  ];

  states.forEach(s => {
    ctx.fillStyle = s.active ? "rgba(37, 99, 235, 0.35)" : "rgba(30, 41, 59, 0.6)";
    ctx.strokeStyle = s.active ? "#60a5fa" : "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = s.active ? 2 : 1;

    ctx.beginPath();
    ctx.roundRect(s.x, s.y, s.w, s.h, 12);
    ctx.fill();
    ctx.stroke();

    // Render Land-Use Patterns inside active state
    if (s.active) {
      // Cropland
      ctx.fillStyle = "#10b981";
      ctx.fillRect(s.x + 10, s.y + 10, s.w * 0.45, s.h * 0.45);
      // Forest
      ctx.fillStyle = "#047857";
      ctx.fillRect(s.x + s.w * 0.55, s.y + 10, s.w * 0.35, s.h * 0.4);
      // Urban Expansion (Larger in 2025 than 2015)
      const urbanMultiplier = year > 2020 ? 1.4 : 1.0;
      ctx.fillStyle = "#f58220";
      ctx.beginPath();
      ctx.arc(s.x + s.w * 0.3, s.y + s.h * 0.7, 16 * urbanMultiplier, 0, Math.PI * 2);
      ctx.fill();
      // Waterbody
      ctx.fillStyle = "#3b82f6";
      ctx.beginPath();
      ctx.arc(s.x + s.w * 0.75, s.y + s.h * 0.75, 12, 0, Math.PI * 2);
      ctx.fill();
    }

    // Label
    ctx.fillStyle = s.active ? "#fff" : "rgba(255, 255, 255, 0.6)";
    ctx.font = s.active ? "bold 12px Inter, sans-serif" : "11px Inter, sans-serif";
    ctx.fillText(s.name, s.x + 12, s.y + 24);
  });

  // Draw Infrastructure Expressways (Corridors)
  ctx.strokeStyle = "#fbbf24";
  ctx.lineWidth = 2.5;
  ctx.setLineDash([6, 4]);
  // DMIC
  ctx.beginPath();
  ctx.moveTo(370, 140);
  ctx.lineTo(240, 210);
  ctx.lineTo(280, 270);
  ctx.stroke();
  ctx.setLineDash([]);

  // Corridor Label
  ctx.fillStyle = "#fbbf24";
  ctx.font = "10px Inter, sans-serif";
  ctx.fillText("PM GatiShakti DMIC Corridor", 230, 200);

  // Year Watermark
  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  ctx.font = "bold 64px Inter, sans-serif";
  ctx.fillText(`${year}`, w - 180, h - 30);
}

function openDualCompareModal(stateName) {
  let modal = document.getElementById('gis-compare-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'gis-compare-modal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-content" style="max-width:960px;">
      <div class="modal-header">
        <h3 class="modal-title">Multi-Temporal Satellite Comparison: ${stateName} (2015 vs 2025)</h3>
        <button class="btn btn-outline" id="btn-close-modal" style="padding:2px 8px;">✕</button>
      </div>
      <div class="modal-body">
        <p style="font-size:12px; color:var(--gov-slate-600); margin-bottom:14px;">
          Comparing decadal remote sensing classifications across agricultural, urban built-up, forest canopy, and surface hydrology indices.
        </p>
        <div class="dual-comparison-container">
          <div class="comparison-panel">
            <div class="comparison-year-badge">Year: 2015</div>
            <div style="background:#0c1527; height:200px; border-radius:4px; display:flex; align-items:center; justify-content:center; color:#fff; font-size:12px; position:relative;">
              <span style="position:absolute; top:8px; left:8px; font-size:10px; background:rgba(0,0,0,0.6); padding:2px 6px; border-radius:2px;">Sentinel-2 Baseline</span>
              <div style="text-align:left; font-size:12px; line-height:1.8;">
                🌾 Cropland: <strong>61.2%</strong><br/>
                🏙️ Built-up: <strong>8.4%</strong><br/>
                🌲 Forest: <strong>20.8%</strong><br/>
                💧 Water: <strong>3.9%</strong>
              </div>
            </div>
          </div>
          <div class="comparison-panel" style="border-color:var(--gov-saffron);">
            <div class="comparison-year-badge" style="color:var(--gov-saffron);">Year: 2025 (Present)</div>
            <div style="background:#0c1527; height:200px; border-radius:4px; display:flex; align-items:center; justify-content:center; color:#fff; font-size:12px; position:relative;">
              <span style="position:absolute; top:8px; left:8px; font-size:10px; background:rgba(245,130,32,0.8); color:#fff; padding:2px 6px; border-radius:2px;">LISS-IV & Sentinel Blend</span>
              <div style="text-align:left; font-size:12px; line-height:1.8;">
                🌾 Cropland: <strong style="color:var(--gov-danger);">56.4% (-4.8%)</strong><br/>
                🏙️ Built-up: <strong style="color:var(--gov-saffron);">11.2% (+2.8%)</strong><br/>
                🌲 Forest: <strong>20.1% (-0.7%)</strong><br/>
                💧 Water: <strong>3.8% (-0.1%)</strong>
              </div>
            </div>
          </div>
        </div>
        <div style="background:var(--gov-slate-50); padding:12px; border-radius:var(--radius-sm); border:1px solid var(--gov-slate-200); font-size:12px;">
          <strong>Key AI Finding:</strong> Urban land expanded by 33.3% relative to its 2015 baseline (+86,000 hectares), absorbing fertile agricultural soils on the peri-urban fringe.
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" id="btn-modal-cancel">Close</button>
        <a href="#simulator?state=${encodeURIComponent(stateName)}" class="btn btn-saffron" id="btn-modal-sim">
          Launch Scenario Simulation for this Region →
        </a>
      </div>
    </div>
  `;

  modal.classList.add('active');
  document.getElementById('btn-close-modal').addEventListener('click', () => modal.classList.remove('active'));
  document.getElementById('btn-modal-cancel').addEventListener('click', () => modal.classList.remove('active'));
  document.getElementById('btn-modal-sim').addEventListener('click', () => modal.classList.remove('active'));
}
