/**
 * Main Application Router & State Manager for NLGIRP Single Page App.
 */

import { api } from './api.js';
import { renderDashboard } from './components/dashboard.js';
import { renderAISearch } from './components/aiSearch.js';
import { renderAIAssistant } from './components/aiAssistant.js';
import { renderGISExplorer } from './components/gisExplorer.js';
import { renderPolicyDashboard } from './components/policyDashboard.js';
import { renderPolicySimulator } from './components/policySimulator.js';
import { renderAnalytics } from './components/analytics.js';
import { renderResearchRepo } from './components/researchRepo.js';
import { renderDatasetCatalog } from './components/datasetCatalog.js';
import { renderWorkspace } from './components/workspace.js';
import { renderInnovation } from './components/innovation.js';
import { renderKnowledgeGraph } from './components/knowledgeGraph.js';
import { renderReportGenerator } from './components/reportGenerator.js';
import { renderAdminPanel } from './components/adminPanel.js';

let currentUser = null;

async function initApp() {
  const mountEl = document.getElementById('app-mount');
  const roleSelect = document.getElementById('header-role-select');

  // Populate roles and fetch initial user (default: Researcher)
  try {
    const rolesData = await api.getRoles();
    const users = rolesData.users || [];
    
    roleSelect.innerHTML = users.map(u => `
      <option value="${u.role}" ${u.role === 'RESEARCHER' ? 'selected' : ''}>
        ${u.role}: ${u.name}
      </option>
    `).join('');

    currentUser = users.find(u => u.role === 'RESEARCHER') || users[0];
    updateUserProfileBadge(currentUser);

    roleSelect.addEventListener('change', async (e) => {
      const selectedRole = e.target.value;
      const user = await api.getMe(selectedRole);
      currentUser = user;
      updateUserProfileBadge(user);
    });
  } catch (err) {
    console.error('Auth initialization error:', err);
  }

  // Handle Route Transitions
  window.addEventListener('hashchange', () => handleRoute(mountEl));
  handleRoute(mountEl);
}

function updateUserProfileBadge(user) {
  if (!user) return;
  document.getElementById('header-user-avatar').src = user.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150';
  document.getElementById('header-user-name').textContent = user.name;
  document.getElementById('header-user-role').textContent = user.role;
  document.getElementById('header-user-inst').textContent = user.institution || '';
}

function handleRoute(mountEl) {
  const rawHash = window.location.hash.slice(1) || 'dashboard';
  const [route, queryString] = rawHash.split('?');
  const params = new URLSearchParams(queryString || '');

  // Highlight active nav item
  document.querySelectorAll('.gov-nav .nav-item').forEach(nav => {
    const href = nav.getAttribute('href') || '';
    if (href.startsWith(`#${route}`)) {
      nav.classList.add('active');
    } else {
      nav.classList.remove('active');
    }
  });

  // Render Target View
  switch (route) {
    case 'dashboard':
      renderDashboard(mountEl);
      break;
    case 'search':
      renderAISearch(mountEl, params.get('q') || '');
      break;
    case 'assistant':
      renderAIAssistant(mountEl);
      break;
    case 'gis':
      renderGISExplorer(mountEl, params.get('state') || 'Maharashtra');
      break;
    case 'policies':
      renderPolicyDashboard(mountEl);
      break;
    case 'simulator':
      renderPolicySimulator(mountEl, params.get('state') || 'Maharashtra');
      break;
    case 'analytics':
      renderAnalytics(mountEl);
      break;
    case 'research':
      renderResearchRepo(mountEl);
      break;
    case 'datasets':
      renderDatasetCatalog(mountEl);
      break;
    case 'workspace':
      renderWorkspace(mountEl);
      break;
    case 'innovation':
      renderInnovation(mountEl);
      break;
    case 'knowledge-graph':
      renderKnowledgeGraph(mountEl);
      break;
    case 'reports':
      renderReportGenerator(mountEl, params.get('state') || 'Maharashtra');
      break;
    case 'admin':
      renderAdminPanel(mountEl);
      break;
    default:
      renderDashboard(mountEl);
      break;
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', initApp);
