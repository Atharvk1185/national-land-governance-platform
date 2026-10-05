/**
 * Dataset Catalog Component for NLGIRP.
 * Catalogs 30+ national land, cadastral, satellite, and judicial datasets
 * with quality scores, API access details, and schema previews.
 */

import { api } from '../api.js';

export async function renderDatasetCatalog(container) {
  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
      <div>
        <h1 style="font-size:22px; font-weight:800; color:var(--gov-navy-900); letter-spacing:-0.3px;">
          National Land Governance Dataset Catalog
        </h1>
        <p style="font-size:12px; color:var(--gov-slate-500);">
          Discovery, metadata standards, and REST API access for national geospatial and cadastral datasets.
        </p>
      </div>
      <span class="badge badge-green">Open Data Architecture (NODL)</span>
    </div>

    <!-- Filter Bar -->
    <div style="display:flex; gap:12px; margin-bottom:16px;">
      <input type="text" id="dataset-search-input" placeholder="Search datasets by name, publisher, or keywords..." 
             style="flex:1; padding:8px 14px; border:1px solid var(--gov-slate-300); border-radius:var(--radius-sm); font-size:13px;" />
      <select id="dataset-format-filter" class="role-select">
        <option value="All">All Formats</option>
        <option value="GeoJSON">GeoJSON</option>
        <option value="CSV">CSV</option>
        <option value="Shapefile">Shapefile</option>
        <option value="JSON">JSON</option>
      </select>
    </div>

    <!-- Datasets List -->
    <div id="datasets-list-container" style="display:flex; flex-direction:column; gap:14px;">
      <div style="text-align:center; padding:30px; color:var(--gov-slate-500);">Loading dataset catalog...</div>
    </div>
  `;

  const searchInput = document.getElementById('dataset-search-input');
  const formatFilter = document.getElementById('dataset-format-filter');
  const listContainer = document.getElementById('datasets-list-container');

  let allDatasets = [];

  try {
    const res = await api.getDatasets();
    allDatasets = res.datasets || [];
    renderDatasets(allDatasets);
  } catch (err) {
    listContainer.innerHTML = `<div class="card" style="color:var(--gov-danger);">Error loading datasets: ${err.message}</div>`;
  }

  function renderDatasets(datasets) {
    if (!datasets.length) {
      listContainer.innerHTML = `<div class="card" style="text-align:center; color:var(--gov-slate-500);">No datasets match your search criteria.</div>`;
      return;
    }

    listContainer.innerHTML = datasets.map(d => `
      <div class="card" style="border-left:4px solid var(--gov-emerald);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">
          <div>
            <span class="badge badge-green" style="margin-right:6px;">${d.format || 'Vector'}</span>
            <span class="badge badge-blue">${d.coverage || 'National'}</span>
            <span style="font-size:11px; color:var(--gov-slate-500); margin-left:8px;">Temporal: ${d.temporal || '2020-2025'}</span>
            <h3 style="font-size:15px; font-weight:800; color:var(--gov-navy-900); margin-top:4px;">
              ${d.name}
            </h3>
          </div>
          <div style="display:flex; flex-direction:column; align-items:flex-end;">
            <span style="font-size:11px; font-weight:700; color:var(--gov-emerald); background:#ecfdf5; padding:2px 8px; border-radius:4px;">
              Quality Score: ${d.quality_score}/100
            </span>
            <span style="font-size:10px; color:var(--gov-slate-400); margin-top:2px;">Size: ${d.size_mb} MB</span>
          </div>
        </div>

        <p style="font-size:12px; color:var(--gov-slate-700); line-height:1.6; margin-bottom:10px;">
          ${d.description}
        </p>

        <div style="background:var(--gov-slate-50); padding:8px 12px; border-radius:4px; font-size:11px; color:var(--gov-slate-600); margin-bottom:10px;">
          <strong>Publisher:</strong> ${d.publisher} (${d.department || 'Government Data Division'}) | <strong>Update Frequency:</strong> ${d.update_freq} | <strong>License:</strong> ${d.license}
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--gov-slate-100); padding-top:8px; font-size:11px;">
          <div style="color:var(--gov-slate-500);">
            <strong>API Endpoint:</strong> <code style="background:var(--gov-slate-100); padding:2px 6px; border-radius:3px;">${d.api_endpoint || '/api/v1/datasets/query'}</code>
          </div>
          <div style="display:flex; gap:8px;">
            <button class="btn btn-outline" onclick="alert('Downloading dataset sample package in ${d.format} format...')" style="padding:4px 8px; font-size:11px;">
              Download ${d.format}
            </button>
            <a href="#gis" class="btn btn-primary" style="padding:4px 8px; font-size:11px;">
              Overlay in GIS Map
            </a>
          </div>
        </div>
      </div>
    `).join('');
  }

  function filterDatasets() {
    const q = searchInput.value.toLowerCase();
    const fmt = formatFilter.value;

    const filtered = allDatasets.filter(d => {
      const matchText = (d.name + ' ' + d.publisher + ' ' + d.description).toLowerCase().includes(q);
      const matchFormat = fmt === 'All' || (d.format && d.format.includes(fmt));
      return matchText && matchFormat;
    });

    renderDatasets(filtered);
  }

  searchInput.addEventListener('input', filterDatasets);
  formatFilter.addEventListener('change', filterDatasets);
}
