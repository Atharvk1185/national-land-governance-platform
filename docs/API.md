# REST API Specification (OpenAPI v3.0 Compatible)

All API endpoints are versioned under `/api/v1/`.

## Endpoints Summary

### 1. System & Authentication
- `GET /api/v1/health`: Server health check, uptime, and timestamp.
- `GET /api/v1/auth/roles`: Returns list of all 8 roles and sample accredited users.
- `GET /api/v1/auth/me?role={ROLE}`: Retrieves active profile for the requested role.

### 2. National Dashboard
- `GET /api/v1/dashboard/stats`: Returns national aggregations (publications, datasets, policies, parcels, disputes).
- `GET /api/v1/dashboard/charts`: Returns annual publication trend data and state matrix metrics.

### 3. AI Semantic Search & Assistant
- `POST /api/v1/search/query`
  - Body: `{ "query": "string", "state": "optional string" }`
  - Returns: `{ "answer": "string", "citations": [...], "documents": [...], "confidence_score": float, "model": "string" }`
- `POST /api/v1/assistant/chat`
  - Body: `{ "prompt": "string", "task_type": "literature_synthesis | gap_identification | policy_comparison | question_generation" }`
  - Returns: `{ "answer": "string", "citations": [...], "task_type": "string" }`

### 4. GIS & Geospatial Services
- `GET /api/v1/gis/layers`: Manifest of all geospatial layers, types, and default opacities.
- `GET /api/v1/gis/geojson/states`: GeoJSON FeatureCollection of state geodetic polygons and attributes.
- `GET /api/v1/gis/corridors`: GeoJSON of national expressways and industrial corridors.
- `GET /api/v1/gis/lulc-change?state={STATE}&start={YEAR}&end={YEAR}`: Computes land-use transition delta and AI interpretation.

### 5. Policy Simulation
- `POST /api/v1/simulation/run`
  - Body: `{ "state": "string", "agri_protection_pct": float, "urban_growth_rate": float, "compensation_multiplier": float, "buffer_zone_strictness": float, "title_guarantee_speed": float }`
  - Returns: `{ "simulation_id": "string", "economic_impact": {...}, "environmental_impact": {...}, "land_use_impact": {...}, "social_dispute_impact": {...}, "assumptions": [...], "disclaimer": "..." }`

### 6. Research & Datasets
- `GET /api/v1/research?state={STATE}&topic={TOPIC}`: Filterable list of research publications.
- `GET /api/v1/research/{id}`: Detailed metadata and findings for a specific paper.
- `GET /api/v1/datasets`: Full catalog of 30+ datasets with metadata and quality scores.

### 7. Analytics & Reports
- `GET /api/v1/analytics/disputes`: State-wise dispute statistics and root-cause breakdowns.
- `GET /api/v1/analytics/climate`: Climate hazard index rankings (Flood, Drought, Heat).
- `POST /api/v1/reports/generate`
  - Body: `{ "state": "string", "topic": "string" }`
  - Returns: Formatted executive policy brief with citations, markdown, and export metrics.

### 8. Collaboration & Innovation
- `GET /api/v1/workspace/projects`: List of active collaborative research projects.
- `POST /api/v1/workspace/projects`: Create a new project.
- `GET /api/v1/innovation/challenges`: List of active grants and hackathons.
- `POST /api/v1/innovation/proposals`: Submit an innovation proposal.
