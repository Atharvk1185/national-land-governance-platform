/**
 * Collaborative Research Workspace Component.
 * Enables multi-institutional research teams to manage joint projects,
 * link national datasets, assign spatial analysis tasks, and record research notes.
 */

import { api } from '../api.js';

export async function renderWorkspace(container) {
  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
      <div>
        <h1 style="font-size:22px; font-weight:800; color:var(--gov-navy-900); letter-spacing:-0.3px;">
          Collaborative Land Governance Research Workspace
        </h1>
        <p style="font-size:12px; color:var(--gov-slate-500);">
          Joint research labs, multi-agency spatial investigations, and collaborative task tracking.
        </p>
      </div>
      <button class="btn btn-primary" id="btn-new-project">
        + Create New Research Project
      </button>
    </div>

    <!-- Active Projects List -->
    <div id="workspace-projects-container" style="display:flex; flex-direction:column; gap:16px;">
      <div style="text-align:center; padding:30px; color:var(--gov-slate-500);">Loading collaboration projects...</div>
    </div>
  `;

  const projectsContainer = document.getElementById('workspace-projects-container');

  try {
    const res = await api.getProjects();
    const projects = res.projects || [];
    renderProjectsList(projects);
  } catch (err) {
    projectsContainer.innerHTML = `<div class="card" style="color:var(--gov-danger);">Error loading projects: ${err.message}</div>`;
  }

  function renderProjectsList(projects) {
    if (!projects.length) {
      projectsContainer.innerHTML = `<div class="card" style="text-align:center; color:var(--gov-slate-500);">No active research projects found.</div>`;
      return;
    }

    projectsContainer.innerHTML = projects.map(p => {
      let tasks = [];
      let notes = [];
      try {
        tasks = typeof p.tasks_json === 'string' ? JSON.parse(p.tasks_json) : (p.tasks_json || []);
        notes = typeof p.notes_json === 'string' ? JSON.parse(p.notes_json) : (p.notes_json || []);
      } catch (e) {}

      return `
        <div class="card">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
            <div>
              <span class="badge badge-blue">${p.status || 'Active'}</span>
              <span style="font-size:11px; color:var(--gov-slate-500); margin-left:8px;">Lead: ${p.lead_researcher} (${p.lead_institution})</span>
              <h3 style="font-size:16px; font-weight:800; color:var(--gov-navy-900); margin-top:4px;">
                ${p.title}
              </h3>
            </div>
            <div style="text-align:right;">
              <span style="font-size:12px; font-weight:700; color:var(--gov-emerald);">Progress: ${p.progress_pct || 0}%</span>
              <div style="width:120px; height:6px; background:var(--gov-slate-200); border-radius:3px; margin-top:4px; overflow:hidden;">
                <div style="width:${p.progress_pct || 0}%; height:100%; background:var(--gov-emerald);"></div>
              </div>
            </div>
          </div>

          <p style="font-size:13px; color:var(--gov-slate-700); line-height:1.6; margin-bottom:14px;">
            ${p.description}
          </p>

          <!-- Collaborative Tasks -->
          <div style="background:var(--gov-slate-50); padding:12px; border-radius:var(--radius-sm); margin-bottom:14px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <h4 style="font-size:12px; font-weight:700; color:var(--gov-navy-900);">Research Milestones & Tasks:</h4>
              <span style="font-size:11px; color:var(--gov-slate-500);">${tasks.length} Assigned Tasks</span>
            </div>
            <div style="display:flex; flex-direction:column; gap:6px;">
              ${tasks.map(t => `
                <div style="display:flex; align-items:center; justify-content:space-between; background:#fff; padding:6px 10px; border-radius:4px; border:1px solid var(--gov-slate-200); font-size:11px;">
                  <span>${t.title}</span>
                  <span class="badge ${t.status === 'Completed' ? 'badge-green' : (t.status === 'In Progress' ? 'badge-yellow' : 'badge-blue')}">
                    ${t.status}
                  </span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Notes / Collaboration Log -->
          ${notes.length > 0 ? `
            <div style="margin-bottom:12px; font-size:11px; color:var(--gov-slate-600);">
              <strong>Recent Discussion:</strong>
              ${notes.map(n => `
                <div style="margin-top:4px; padding-left:8px; border-left:2px solid var(--gov-slate-300);">
                  <em>"${n.content}"</em> — <strong>${n.author}</strong> (${n.date})
                </div>
              `).join('')}
            </div>
          ` : ''}

          <div style="display:flex; justify-content:flex-end; gap:8px; border-top:1px solid var(--gov-slate-100); padding-top:10px;">
            <button class="btn btn-outline" onclick="alert('Invite collaborator dialog: Send invitation email to accredited researcher.')" style="font-size:11px; padding:4px 10px;">
              + Invite Collaborator
            </button>
            <a href="#search?q=${encodeURIComponent(p.title)}" class="btn btn-primary" style="font-size:11px; padding:4px 10px;">
              AI Literature Assist
            </a>
          </div>
        </div>
      `;
    }).join('');
  }

  document.getElementById('btn-new-project').addEventListener('click', () => {
    openNewProjectModal();
  });
}

function openNewProjectModal() {
  let modal = document.getElementById('new-project-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'new-project-modal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-content" style="max-width:600px;">
      <div class="modal-header">
        <h3 class="modal-title">Initiate Collaborative Land Governance Project</h3>
        <button class="btn btn-outline" id="btn-close-prj-modal" style="padding:2px 8px;">✕</button>
      </div>
      <div class="modal-body">
        <div style="display:flex; flex-direction:column; gap:12px;">
          <div>
            <label style="font-size:12px; font-weight:700; color:var(--gov-slate-700);">Project Title:</label>
            <input type="text" id="inp-prj-title" placeholder="e.g. Remote Sensing of Peri-Urban Encroachment in Thane District" 
                   style="width:100%; padding:8px; border:1px solid var(--gov-slate-300); border-radius:4px; margin-top:4px;" />
          </div>
          <div>
            <label style="font-size:12px; font-weight:700; color:var(--gov-slate-700);">Lead Researcher & Institution:</label>
            <input type="text" id="inp-prj-lead" value="Prof. Ananya Sen (IIT Bombay)" 
                   style="width:100%; padding:8px; border:1px solid var(--gov-slate-300); border-radius:4px; margin-top:4px;" />
          </div>
          <div>
            <label style="font-size:12px; font-weight:700; color:var(--gov-slate-700);">Research Objectives & Methodology:</label>
            <textarea id="inp-prj-desc" rows="4" placeholder="Describe the spatial research scope, data requirements, and planned policy outputs..." 
                      style="width:100%; padding:8px; border:1px solid var(--gov-slate-300); border-radius:4px; margin-top:4px;"></textarea>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" id="btn-cancel-prj-modal">Cancel</button>
        <button class="btn btn-primary" id="btn-submit-prj">Create Project</button>
      </div>
    </div>
  `;

  modal.classList.add('active');
  document.getElementById('btn-close-prj-modal').addEventListener('click', () => modal.classList.remove('active'));
  document.getElementById('btn-cancel-prj-modal').addEventListener('click', () => modal.classList.remove('active'));
  document.getElementById('btn-submit-prj').addEventListener('click', async () => {
    const title = document.getElementById('inp-prj-title').value.trim();
    const lead = document.getElementById('inp-prj-lead').value.trim();
    const desc = document.getElementById('inp-prj-desc').value.trim();
    if (!title) {
      alert("Please enter a project title.");
      return;
    }
    await api.createProject({ title, lead_researcher: lead, description: desc });
    modal.classList.remove('active');
    alert("Project created successfully in the National Workspace!");
    renderWorkspace(document.getElementById('app-mount'));
  });
}
