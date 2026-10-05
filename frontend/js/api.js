/**
 * API Client for National Digital Platform for Land Governance.
 * Provides unified, asynchronous methods for all RESTful endpoints.
 */

const API_BASE = '/api/v1';

export const api = {
  async get(endpoint, params = {}) {
    const url = new URL(endpoint, window.location.origin);
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });
    try {
      const res = await fetch(url.toString(), {
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
      return await res.json();
    } catch (err) {
      console.error(`API GET error on ${endpoint}:`, err);
      throw err;
    }
  },

  async post(endpoint, data = {}) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
      return await res.json();
    } catch (err) {
      console.error(`API POST error on ${endpoint}:`, err);
      throw err;
    }
  },

  // Auth & Roles
  async getRoles() {
    return this.get(`${API_BASE}/auth/roles`);
  },
  async getMe(role) {
    return this.get(`${API_BASE}/auth/me`, { role });
  },

  // Dashboard
  async getDashboardStats() {
    return this.get(`${API_BASE}/dashboard/stats`);
  },
  async getDashboardCharts() {
    return this.get(`${API_BASE}/dashboard/charts`);
  },

  // AI Semantic Search
  async search(query, state) {
    return this.post('/search/query', { query, state });
  },

  // AI Research Assistant
  async askAssistant(prompt, task_type = 'literature_synthesis') {
    return this.post('/assistant/chat', { prompt, task_type });
  },

  // Research
  async getResearch(state, topic) {
    return this.get(`${API_BASE}/research`, { state, topic });
  },
  async getResearchDetail(id) {
    return this.get(`${API_BASE}/research/${id}`);
  },

  // Datasets
  async getDatasets() {
    return this.get(`${API_BASE}/datasets`);
  },
  async getDatasetDetail(id) {
    return this.get(`${API_BASE}/datasets/${id}`);
  },

  // Policies
  async getPolicies() {
    return this.get(`${API_BASE}/policies`);
  },
  async getPolicyDetail(id) {
    return this.get(`${API_BASE}/policies/${id}`);
  },

  // GIS
  async getGISLayers() {
    return this.get(`${API_BASE}/gis/layers`);
  },
  async getGISStates() {
    return this.get(`${API_BASE}/gis/geojson/states`);
  },
  async getGISCorridors() {
    return this.get(`${API_BASE}/gis/corridors`);
  },
  async getLULCChange(state, start, end) {
    return this.get(`${API_BASE}/gis/lulc-change`, { state, start, end });
  },

  // Analytics
  async getDisputes() {
    return this.get(`${API_BASE}/analytics/disputes`);
  },
  async getClimate() {
    return this.get(`${API_BASE}/analytics/climate`);
  },
  async getTrends() {
    return this.get(`${API_BASE}/trends`);
  },

  // Policy Simulation
  async runSimulation(params) {
    return this.post('/simulation/run', params);
  },

  // Collaboration Workspace
  async getProjects() {
    return this.get(`${API_BASE}/workspace/projects`);
  },
  async createProject(data) {
    return this.post('/workspace/projects', data);
  },

  // Innovation Portal
  async getChallenges() {
    return this.get(`${API_BASE}/innovation/challenges`);
  },
  async submitProposal(data) {
    return this.post('/innovation/proposals', data);
  },

  // Knowledge Graph
  async getKnowledgeGraph() {
    return this.get(`${API_BASE}/knowledge-graph/data`);
  },

  // Reports
  async generateReport(state, topic) {
    return this.post('/reports/generate', { state, topic });
  },

  // Admin
  async getUsers() {
    return this.get(`${API_BASE}/admin/users`);
  },
  async getAuditLogs() {
    return this.get(`${API_BASE}/admin/audit-logs`);
  }
};
