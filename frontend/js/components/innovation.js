/**
 * Innovation Portal Component.
 * Supports national hackathons, research grants, open innovation challenges,
 * and academic/startup proposal submissions.
 */

import { api } from '../api.js';

export async function renderInnovation(container) {
  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
      <div>
        <h1 style="font-size:22px; font-weight:800; color:var(--gov-navy-900); letter-spacing:-0.3px;">
          National Land Governance Innovation Ecosystem & Grants Portal
        </h1>
        <p style="font-size:12px; color:var(--gov-slate-500);">
          Grand challenges, academic research grants, and AI pilot incubators for evidence-based land governance.
        </p>
      </div>
      <span class="badge badge-green">₹ 2.45 Crore Active Grant Pool</span>
    </div>

    <!-- Challenges Grid -->
    <div id="challenges-grid-container" style="display:flex; flex-direction:column; gap:16px;">
      <div style="text-align:center; padding:30px; color:var(--gov-slate-500);">Loading innovation challenges...</div>
    </div>
  `;

  const gridContainer = document.getElementById('challenges-grid-container');

  try {
    const res = await api.getChallenges();
    const challenges = res.challenges || [];
    renderChallenges(challenges);
  } catch (err) {
    gridContainer.innerHTML = `<div class="card" style="color:var(--gov-danger);">Error loading innovation challenges: ${err.message}</div>`;
  }

  function renderChallenges(challenges) {
    if (!challenges.length) {
      gridContainer.innerHTML = `<div class="card" style="text-align:center; color:var(--gov-slate-500);">No active innovation challenges.</div>`;
      return;
    }

    gridContainer.innerHTML = challenges.map(c => {
      let themes = [];
      try {
        themes = typeof c.themes_json === 'string' ? JSON.parse(c.themes_json) : (c.themes_json || []);
      } catch (e) {}

      return `
        <div class="card" style="border-left:4px solid var(--gov-saffron);">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
            <div>
              <span class="badge badge-yellow">${c.status}</span>
              <span style="font-size:11px; color:var(--gov-slate-500); margin-left:8px;">Organizer: ${c.organizer}</span>
              <h3 style="font-size:16px; font-weight:800; color:var(--gov-navy-900); margin-top:4px;">
                ${c.title}
              </h3>
            </div>
            <div style="text-align:right;">
              <span style="font-size:16px; font-weight:800; color:var(--gov-emerald);">${c.grant_pool_inr}</span>
              <div style="font-size:11px; color:var(--gov-slate-500);">Grant / Prize Pool</div>
            </div>
          </div>

          <p style="font-size:13px; color:var(--gov-slate-700); line-height:1.6; margin-bottom:12px;">
            ${c.description}
          </p>

          <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:14px;">
            <span style="font-size:11px; font-weight:700; color:var(--gov-slate-600); margin-right:4px;">Key Themes:</span>
            ${themes.map(t => `<span class="badge badge-blue">${t}</span>`).join('')}
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--gov-slate-100); padding-top:10px; font-size:11px;">
            <div style="color:var(--gov-slate-600);">
              <strong>Submission Deadline:</strong> ${c.deadline} | <strong>Current Proposals:</strong> ${c.submissions_count || 0}
            </div>
            <button class="btn btn-saffron btn-submit-proposal" data-id="${c.id}" data-title="${c.title}" style="padding:4px 12px; font-size:11px;">
              Submit Innovation Proposal →
            </button>
          </div>
        </div>
      `;
    }).join('');

    document.querySelectorAll('.btn-submit-proposal').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const title = btn.getAttribute('data-title');
        openProposalModal(id, title);
      });
    });
  }
}

function openProposalModal(challengeId, challengeTitle) {
  let modal = document.getElementById('proposal-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'proposal-modal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-content" style="max-width:650px;">
      <div class="modal-header">
        <h3 class="modal-title">Submit Innovation Proposal: ${challengeTitle}</h3>
        <button class="btn btn-outline" id="btn-close-prop-modal" style="padding:2px 8px;">✕</button>
      </div>
      <div class="modal-body">
        <div style="display:flex; flex-direction:column; gap:12px;">
          <div>
            <label style="font-size:12px; font-weight:700; color:var(--gov-slate-700);">Principal Investigator / Applicant Name:</label>
            <input type="text" id="prop-name" placeholder="Dr. Researcher / Startup Founder" 
                   style="width:100%; padding:8px; border:1px solid var(--gov-slate-300); border-radius:4px; margin-top:4px;" />
          </div>
          <div>
            <label style="font-size:12px; font-weight:700; color:var(--gov-slate-700);">Institution / Organization:</label>
            <input type="text" id="prop-inst" placeholder="e.g. CEPT University, Ahmedabad / Geotech AI Pvt Ltd" 
                   style="width:100%; padding:8px; border:1px solid var(--gov-slate-300); border-radius:4px; margin-top:4px;" />
          </div>
          <div>
            <label style="font-size:12px; font-weight:700; color:var(--gov-slate-700);">Official Email Address:</label>
            <input type="email" id="prop-email" placeholder="pi@university.edu.in" 
                   style="width:100%; padding:8px; border:1px solid var(--gov-slate-300); border-radius:4px; margin-top:4px;" />
          </div>
          <div>
            <label style="font-size:12px; font-weight:700; color:var(--gov-slate-700);">Proposal Title:</label>
            <input type="text" id="prop-title" placeholder="e.g. Self-Supervised Vision Transformer for High-Resolution Cadastral Bund Extraction" 
                   style="width:100%; padding:8px; border:1px solid var(--gov-slate-300); border-radius:4px; margin-top:4px;" />
          </div>
          <div>
            <label style="font-size:12px; font-weight:700; color:var(--gov-slate-700);">Executive Summary & Methodology Abstract:</label>
            <textarea id="prop-abstract" rows="4" placeholder="Summarize technical methodology, target dataset usage, and expected land governance outcome..." 
                      style="width:100%; padding:8px; border:1px solid var(--gov-slate-300); border-radius:4px; margin-top:4px;"></textarea>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" id="btn-cancel-prop-modal">Cancel</button>
        <button class="btn btn-emerald" id="btn-confirm-submit-prop">Confirm & Submit Proposal</button>
      </div>
    </div>
  `;

  modal.classList.add('active');
  document.getElementById('btn-close-prop-modal').addEventListener('click', () => modal.classList.remove('active'));
  document.getElementById('btn-cancel-prop-modal').addEventListener('click', () => modal.classList.remove('active'));
  document.getElementById('btn-confirm-submit-prop').addEventListener('click', async () => {
    const name = document.getElementById('prop-name').value.trim();
    const inst = document.getElementById('prop-inst').value.trim();
    const email = document.getElementById('prop-email').value.trim();
    const title = document.getElementById('prop-title').value.trim();
    const abstract = document.getElementById('prop-abstract').value.trim();

    if (!title || !name || !email) {
      alert("Please fill in the required proposal fields.");
      return;
    }

    await api.submitProposal({
      challenge_id: challengeId,
      applicant_name: name,
      applicant_email: email,
      institution: inst,
      title: title,
      abstract: abstract
    });

    modal.classList.remove('active');
    alert("Innovation Proposal submitted successfully! Application tracking ID generated.");
    renderInnovation(document.getElementById('app-mount'));
  });
}
