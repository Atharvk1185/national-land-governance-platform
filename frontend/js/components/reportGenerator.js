/**
 * Policy Report Generator Component.
 * Compiles evidence, spatial change detection metrics, dispute audits,
 * and simulated policy intervention outcomes into an official executive brief with export support.
 */

import { api } from '../api.js';

export async function renderReportGenerator(container, defaultState = 'Maharashtra') {
  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
      <div>
        <h1 style="font-size:22px; font-weight:800; color:var(--gov-navy-900); letter-spacing:-0.3px;">
          National Evidence-Backed Policy Brief & Report Generator
        </h1>
        <p style="font-size:12px; color:var(--gov-slate-500);">
          Generate comprehensive, cited, decision-support reports synthesizing research, GIS, and simulation data.
        </p>
      </div>
      <div style="display:flex; gap:10px;">
        <button class="btn btn-outline" id="btn-print-report">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          Print / Save as PDF
        </button>
        <button class="btn btn-emerald" id="btn-re-generate">
          Generate Fresh Report
        </button>
      </div>
    </div>

    <!-- Generator Options Card -->
    <div class="card" style="margin-bottom:20px;">
      <div style="display:flex; gap:16px; align-items:center; flex-wrap:wrap;">
        <div style="flex:1; min-width:200px;">
          <label style="font-size:11px; font-weight:700; color:var(--gov-slate-600); text-transform:uppercase;">
            Target Jurisdiction:
          </label>
          <select id="report-state-select" class="role-select" style="width:100%; margin-top:4px; padding:8px;">
            <option value="Maharashtra">Maharashtra (Mumbai-Pune Industrial Corridor)</option>
            <option value="Karnataka">Karnataka (Bengaluru Peri-Urban Zone)</option>
            <option value="Uttar Pradesh">Uttar Pradesh (Gangetic Plains & Expressway Belts)</option>
            <option value="Odisha">Odisha (Coastal Climate Vulnerability Stretch)</option>
            <option value="Gujarat">Gujarat (DMIC Industrial & Agro-Climatic Belt)</option>
            <option value="Tamil Nadu">Tamil Nadu (Urban Agglomerations)</option>
          </select>
        </div>

        <div style="flex:2; min-width:280px;">
          <label style="font-size:11px; font-weight:700; color:var(--gov-slate-600); text-transform:uppercase;">
            Thematic Domain / Problem Focus:
          </label>
          <input type="text" id="report-topic-input" value="Agricultural Land Conversion & Dispute Resolution" 
                 style="width:100%; margin-top:4px; padding:8px 12px; border:1px solid var(--gov-slate-300); border-radius:4px; font-size:13px;" />
        </div>
      </div>
    </div>

    <!-- Formatted Report Document View -->
    <div class="card" id="report-view-container" style="padding:36px; border:1px solid var(--gov-slate-300); background:#fff; box-shadow:var(--shadow-md);">
      <div style="text-align:center; padding:40px; color:var(--gov-slate-500);">Compiling executive governance report...</div>
    </div>
  `;

  const stateSelect = document.getElementById('report-state-select');
  const topicInput = document.getElementById('report-topic-input');
  const generateBtn = document.getElementById('btn-re-generate');
  const printBtn = document.getElementById('btn-print-report');
  const reportContainer = document.getElementById('report-view-container');

  stateSelect.value = defaultState;

  async function buildReport() {
    reportContainer.innerHTML = `<div style="text-align:center; padding:40px; color:var(--gov-slate-500);">Synthesizing multi-temporal evidence and dispute baselines for ${stateSelect.value}...</div>`;
    try {
      const res = await api.generateReport(stateSelect.value, topicInput.value);
      renderReportMarkdown(res);
    } catch (err) {
      reportContainer.innerHTML = `<div style="color:var(--gov-danger);">Failed to compile report: ${err.message}</div>`;
    }
  }

  function renderReportMarkdown(data) {
    const rawMd = data.markdown || '';
    
    // Format Markdown into beautiful document HTML
    const formattedHtml = rawMd
      .replace(/^# (.*$)/gim, '<h1 style="font-size:22px; font-weight:900; color:var(--gov-navy-900); text-align:center; letter-spacing:-0.4px; margin-bottom:4px;">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 style="font-size:15px; font-weight:700; color:var(--gov-saffron); text-align:center; letter-spacing:1px; margin-bottom:20px; text-transform:uppercase;">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 style="font-size:15px; font-weight:800; color:var(--gov-navy-800); border-bottom:2px solid var(--gov-slate-200); padding-bottom:6px; margin:24px 0 10px 0;">$1</h3>')
      .replace(/^#### (.*$)/gim, '<h4 style="font-size:13px; font-weight:700; color:var(--gov-navy-900); margin:14px 0 4px 0;">$1</h4>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code style="background:var(--gov-slate-100); padding:2px 6px; border-radius:3px;">$1</code>')
      .replace(/^- (.*$)/gim, '<li style="margin-bottom:6px; font-size:13px; line-height:1.6;">$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li style="margin-bottom:6px; font-size:13px; line-height:1.6;">$1</li>')
      .replace(/---/g, '<hr style="border:none; border-top:1px solid var(--gov-slate-200); margin:20px 0;" />')
      .replace(/\n\n/g, '<br/>');

    reportContainer.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid var(--gov-slate-200); padding-bottom:14px; margin-bottom:24px;">
        <div style="font-size:11px; font-weight:700; color:var(--gov-slate-500); letter-spacing:1px; text-transform:uppercase;">
          Government of India • Ministry of Rural Development • Department of Land Resources
        </div>
        <span class="gov-disclaimer-pill">${data.disclaimer}</span>
      </div>

      <div style="font-family:var(--font-sans); color:var(--gov-slate-800);">
        ${formattedHtml}
      </div>

      <div style="margin-top:36px; padding-top:16px; border-top:2px solid var(--gov-slate-200); display:flex; justify-content:space-between; align-items:center; font-size:11px; color:var(--gov-slate-500);">
        <span>Generated by <strong>NLGIRP Decision-Support Engine v3.1</strong></span>
        <span>Verified Citations: <strong>${data.citations_count} Peer-Reviewed Studies</strong></span>
      </div>
    `;
  }

  generateBtn.addEventListener('click', buildReport);
  printBtn.addEventListener('click', () => window.print());

  // Initial load
  buildReport();
}
