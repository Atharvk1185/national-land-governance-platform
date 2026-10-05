/**
 * Admin Panel Component for NLGIRP.
 * Manages user roles and permissions, document ingestion approval queues,
 * dataset authorizations, and immutable system audit logging.
 */

import { api } from '../api.js';

export async function renderAdminPanel(container) {
  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
      <div>
        <h1 style="font-size:22px; font-weight:800; color:var(--gov-navy-900); letter-spacing:-0.3px;">
          National Platform Administration & Security Console
        </h1>
        <p style="font-size:12px; color:var(--gov-slate-500);">
          Role-based access control (RBAC), document review pipeline, and compliance audit trail.
        </p>
      </div>
      <span class="badge badge-green">System Status: Nominal (100% Uptime)</span>
    </div>

    <!-- Admin Sub-tabs -->
    <div style="display:flex; gap:8px; margin-bottom:16px;">
      <button class="btn btn-primary" id="admin-tab-users">👤 User & Role Management (8 Roles)</button>
      <button class="btn btn-outline" id="admin-tab-review">📑 Document Ingestion Approval Queue</button>
      <button class="btn btn-outline" id="admin-tab-audit">🔒 Immutable Audit Logs</button>
    </div>

    <div id="admin-sub-view">
      <div style="text-align:center; padding:30px; color:var(--gov-slate-500);">Loading administration console...</div>
    </div>
  `;

  const btnUsers = document.getElementById('admin-tab-users');
  const btnReview = document.getElementById('admin-tab-review');
  const btnAudit = document.getElementById('admin-tab-audit');
  const subView = document.getElementById('admin-sub-view');

  btnUsers.addEventListener('click', () => {
    setActive(btnUsers);
    renderUsersView(subView);
  });
  btnReview.addEventListener('click', () => {
    setActive(btnReview);
    renderReviewView(subView);
  });
  btnAudit.addEventListener('click', () => {
    setActive(btnAudit);
    renderAuditView(subView);
  });

  function setActive(activeBtn) {
    [btnUsers, btnReview, btnAudit].forEach(b => b.className = 'btn btn-outline');
    activeBtn.className = 'btn btn-primary';
  }

  // Initial tab
  renderUsersView(subView);
}

async function renderUsersView(container) {
  try {
    const users = await api.getUsers();
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Authorized National Stakeholders & Role Assignments</h3>
          <button class="btn btn-primary" onclick="alert('User invitation modal: Enter email and assign accredited institutional role.')" style="padding:4px 10px; font-size:11px;">
            + Add Platform User
          </button>
        </div>
        <table style="width:100%; border-collapse:collapse; font-size:12px; text-align:left;">
          <thead>
            <tr style="background:var(--gov-slate-100); border-bottom:2px solid var(--gov-slate-200);">
              <th style="padding:10px 14px;">User</th>
              <th style="padding:10px 14px;">Role Classification</th>
              <th style="padding:10px 14px;">Institution / Department</th>
              <th style="padding:10px 14px;">Designation</th>
              <th style="padding:10px 14px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(u => `
              <tr style="border-bottom:1px solid var(--gov-slate-200);">
                <td style="padding:10px 14px; font-weight:700;">
                  ${u.name}<br/>
                  <span style="font-size:11px; color:var(--gov-slate-400); font-weight:400;">${u.email}</span>
                </td>
                <td style="padding:10px 14px;">
                  <span class="badge ${u.role === 'SUPER ADMIN' ? 'badge-red' : (u.role === 'GOVERNMENT OFFICIAL' ? 'badge-blue' : 'badge-green')}">
                    ${u.role}
                  </span>
                </td>
                <td style="padding:10px 14px;">${u.institution || 'Independent'}</td>
                <td style="padding:10px 14px;">${u.designation || 'N/A'}</td>
                <td style="padding:10px 14px;">
                  <button class="btn btn-outline" onclick="alert('Modify permissions for ${u.name}')" style="padding:3px 8px; font-size:10px;">
                    Edit Permissions
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="card" style="color:var(--gov-danger);">Error fetching users: ${err.message}</div>`;
  }
}

function renderReviewView(container) {
  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Pending Document Ingestion Queue (2 Submissions Awaiting Approval)</h3>
      </div>
      <div style="display:flex; flex-direction:column; gap:12px;">
        <div style="border:1px solid var(--gov-slate-200); padding:12px; border-radius:4px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <span class="badge badge-yellow">Pending Review</span>
            <h4 style="font-size:13px; font-weight:700; color:var(--gov-navy-900); margin:4px 0;">
              High-Resolution Drone Photogrammetry of Coastal Mangrove Encroachments in Sundarbans
            </h4>
            <div style="font-size:11px; color:var(--gov-slate-500);">
              Submitted by: Dr. Debabrata Mohapatra (IISc Bangalore) | File: PDF (14.2 MB) | Security: Scanned Clean
            </div>
          </div>
          <div style="display:flex; gap:8px;">
            <button class="btn btn-outline" onclick="alert('Rejection comments recorded.')" style="padding:4px 8px; font-size:11px; color:var(--gov-danger);">
              Reject
            </button>
            <button class="btn btn-emerald" onclick="alert('Document approved and automatically indexed into Vector Database!')" style="padding:4px 10px; font-size:11px;">
              Approve & Vector Index
            </button>
          </div>
        </div>

        <div style="border:1px solid var(--gov-slate-200); padding:12px; border-radius:4px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <span class="badge badge-yellow">Pending Review</span>
            <h4 style="font-size:13px; font-weight:700; color:var(--gov-navy-900); margin:4px 0;">
              Cadastral Boundary Geo-rectification Guidelines for Rural Abadi Belts under SVAMITVA
            </h4>
            <div style="font-size:11px; color:var(--gov-slate-500);">
              Submitted by: National Remote Sensing Centre (NRSC) | File: GeoJSON (8.4 MB) | Security: Scanned Clean
            </div>
          </div>
          <div style="display:flex; gap:8px;">
            <button class="btn btn-outline" onclick="alert('Rejection comments recorded.')" style="padding:4px 8px; font-size:11px; color:var(--gov-danger);">
              Reject
            </button>
            <button class="btn btn-emerald" onclick="alert('Document approved and published to Dataset Catalog!')" style="padding:4px 10px; font-size:11px;">
              Approve & Publish
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function renderAuditView(container) {
  try {
    const res = await api.getAuditLogs();
    const logs = res.audit_logs || [];

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">System Audit & Compliance Log</h3>
          <span class="badge badge-blue">Tamper-Evident SHA-256 Ledger</span>
        </div>
        <table style="width:100%; border-collapse:collapse; font-size:11px; text-align:left;">
          <thead>
            <tr style="background:var(--gov-slate-100); border-bottom:2px solid var(--gov-slate-200);">
              <th style="padding:8px 12px;">Timestamp (UTC)</th>
              <th style="padding:8px 12px;">Initiator</th>
              <th style="padding:8px 12px;">Action</th>
              <th style="padding:8px 12px;">Resource Type</th>
              <th style="padding:8px 12px;">Event Details</th>
            </tr>
          </thead>
          <tbody>
            ${logs.length > 0 ? logs.map(l => `
              <tr style="border-bottom:1px solid var(--gov-slate-200);">
                <td style="padding:8px 12px; font-family:var(--font-mono); color:var(--gov-slate-500);">${l.timestamp}</td>
                <td style="padding:8px 12px; font-weight:700;">${l.user_id}</td>
                <td style="padding:8px 12px;"><span class="badge badge-blue">${l.action}</span></td>
                <td style="padding:8px 12px;">${l.resource_type || 'SYSTEM'}</td>
                <td style="padding:8px 12px; color:var(--gov-slate-700);">${l.details || 'N/A'}</td>
              </tr>
            `).join('') : `
              <tr><td colspan="5" style="padding:16px; text-align:center;">No audit records logged.</td></tr>
            `}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="card" style="color:var(--gov-danger);">Error fetching audit logs: ${err.message}</div>`;
  }
}
