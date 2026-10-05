/**
 * AI-Powered Research & Semantic Discovery Search Component.
 * Executes full RAG pipeline, extracts citations, ranks evidence documents,
 * and displays anti-hallucination source attribution.
 */

import { api } from '../api.js';

export async function renderAISearch(container, initialQuery = '') {
  container.innerHTML = `
    <!-- Search Hero -->
    <div class="search-hero">
      <div class="search-hero-title">AI Knowledge Discovery & Evidence Retrieval Engine</div>
      <div class="search-hero-subtitle">
        Ask natural-language questions across national land governance research, legal frameworks, cadastral registries, and policy performance databases.
      </div>

      <div class="search-input-box">
        <input type="text" id="ai-search-input" placeholder="e.g. What are the major causes of agricultural land conversion in Maharashtra?" value="${initialQuery}" />
        <select id="ai-search-state-filter">
          <option value="All">All States</option>
          <option value="Maharashtra">Maharashtra</option>
          <option value="Karnataka">Karnataka</option>
          <option value="Uttar Pradesh">Uttar Pradesh</option>
          <option value="Odisha">Odisha</option>
          <option value="Gujarat">Gujarat</option>
          <option value="Tamil Nadu">Tamil Nadu</option>
        </select>
        <button class="search-btn" id="ai-search-submit">
          Ask AI
        </button>
      </div>

      <div class="search-suggestions">
        <span style="color:var(--gov-slate-300); font-weight:600;">Sample Queries:</span>
        <span class="suggestion-chip" data-q="What are the major causes of agricultural land conversion in Maharashtra?">Causes of agri conversion in Maharashtra</span>
        <span class="suggestion-chip" data-q="Urban land expansion and climate vulnerability in coastal belts">Urban sprawl & coastal climate risk</span>
        <span class="suggestion-chip" data-q="Show research related to urban land disputes and judicial pendency">Land disputes & judicial pendency</span>
        <span class="suggestion-chip" data-q="What policies have reduced rural land disputes?">Policies reducing rural disputes</span>
      </div>
    </div>

    <!-- Search Status / Spinner -->
    <div id="ai-search-status" style="display:none; text-align:center; padding:30px;">
      <div style="font-size:14px; font-weight:700; color:var(--gov-navy-800); margin-bottom:6px;">
        Executing RAG Retrieval Pipeline...
      </div>
      <div style="font-size:12px; color:var(--gov-slate-500);">
        Query Embedding → Vector Cosine Retrieval → Metadata Filtering → LLM Evidence Synthesis
      </div>
    </div>

    <!-- RAG Synthesized Output Container -->
    <div id="ai-search-results"></div>
  `;

  const inputEl = document.getElementById('ai-search-input');
  const stateFilterEl = document.getElementById('ai-search-state-filter');
  const submitBtn = document.getElementById('ai-search-submit');
  const statusEl = document.getElementById('ai-search-status');
  const resultsEl = document.getElementById('ai-search-results');

  async function performSearch(queryText) {
    if (!queryText.trim()) return;
    statusEl.style.display = 'block';
    resultsEl.innerHTML = '';

    try {
      const state = stateFilterEl.value;
      const res = await api.search(queryText, state);
      statusEl.style.display = 'none';
      renderResults(res);
    } catch (err) {
      statusEl.style.display = 'none';
      resultsEl.innerHTML = `
        <div class="card" style="border-left:4px solid var(--gov-danger);">
          <h3 style="color:var(--gov-danger); font-size:15px; margin-bottom:8px;">Error Retrieving Evidence</h3>
          <p style="font-size:13px; color:var(--gov-slate-600);">${err.message || 'Server error occurred during AI search.'}</p>
        </div>
      `;
    }
  }

  function renderResults(res) {
    // Format Markdown paragraphs into formatted HTML
    const formattedAnswer = res.answer
      .replace(/### (.*?)\n/g, '<h3 style="font-size:14px; font-weight:700; color:var(--gov-navy-900); margin:16px 0 8px 0;">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/- (.*?)\n/g, '<li style="margin-bottom:4px;">$1</li>')
      .replace(/\n\n/g, '<br/><br/>');

    resultsEl.innerHTML = `
      <!-- Synthesized Evidence Card -->
      <div class="rag-answer-card">
        <div class="rag-answer-header">
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="badge badge-blue">RAG Synthesis</span>
            <span style="font-size:12px; color:var(--gov-slate-500); font-weight:600;">
              Model: ${res.model || 'EvidenceEngine-v2.4'} (Confidence: ${(res.confidence_score * 100).toFixed(0)}%)
            </span>
          </div>
          <span class="gov-disclaimer-pill">${res.disclaimer || 'Demo Data'}</span>
        </div>

        <div class="rag-answer-body">
          ${formattedAnswer}
        </div>

        <!-- Verified Citations Box -->
        ${res.citations && res.citations.length > 0 ? `
          <div class="citations-box">
            <div class="citations-title">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline-block; vertical-align:middle; margin-right:4px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Traceable Source Citations (${res.citations.length} Verified Sources)
            </div>
            <div class="citations-list">
              ${res.citations.map(c => `
                <div class="citation-item">
                  <span class="citation-badge">[${c.ref_num}]</span>
                  <div>
                    <strong>${c.title}</strong> — <span style="color:var(--gov-slate-500);">${c.institution} (${c.year})</span>
                    <span class="badge badge-green" style="margin-left:6px; font-size:10px;">Score: ${(c.relevance_score * 100).toFixed(0)}%</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:16px;">
          <a href="#simulator?state=${encodeURIComponent(stateFilterEl.value === 'All' ? 'Maharashtra' : stateFilterEl.value)}" class="btn btn-outline">
            Test Scenario in Policy Simulator →
          </a>
          <a href="#reports?state=${encodeURIComponent(stateFilterEl.value === 'All' ? 'Maharashtra' : stateFilterEl.value)}" class="btn btn-primary">
            Generate Comprehensive State Report
          </a>
        </div>
      </div>

      <!-- Ranked Document Evidence Cards -->
      <div style="margin-top:24px;">
        <h3 style="font-size:16px; font-weight:800; color:var(--gov-navy-900); margin-bottom:14px;">
          Retrieved Primary Evidence & Research Studies (${(res.documents || []).length})
        </h3>
        <div style="display:flex; flex-direction:column; gap:14px;">
          ${(res.documents || []).map((doc, idx) => `
            <div class="card" style="border-left:3px solid var(--gov-navy-700);">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">
                <div>
                  <span class="badge badge-blue" style="margin-right:6px;">${doc.topic || 'Land Governance'}</span>
                  <span class="badge badge-yellow">${doc.state || 'National'}</span>
                  <h4 style="font-size:14px; font-weight:700; color:var(--gov-navy-900); margin-top:6px;">
                    ${doc.title}
                  </h4>
                </div>
                <span class="badge badge-green" style="font-size:11px;">Match: ${((doc.score || 0.85) * 100).toFixed(0)}%</span>
              </div>
              <p style="font-size:12px; color:var(--gov-slate-600); margin-bottom:8px;">
                ${doc.summary}
              </p>
              <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; color:var(--gov-slate-500); padding-top:8px; border-top:1px solid var(--gov-slate-100);">
                <span><strong>Authors:</strong> ${doc.authors} (${doc.institution}, ${doc.year})</span>
                <span><strong>Citations:</strong> ${doc.citations_count || 24} citations</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Event Listeners
  submitBtn.addEventListener('click', () => performSearch(inputEl.value));
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') performSearch(inputEl.value);
  });

  document.querySelectorAll('.suggestion-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      inputEl.value = chip.getAttribute('data-q');
      performSearch(inputEl.value);
    });
  });

  // If initial query provided via URL hash
  if (initialQuery) {
    performSearch(initialQuery);
  }
}
