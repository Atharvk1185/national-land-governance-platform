# Database & Persistence Specification

## 1. Overview
The platform supports dual database architectures:
1. **Zero-Dependency SQLite3 + FTS5** (Default local runtime): Instant startup, sub-millisecond local query speeds, pure stdlib compatibility.
2. **PostgreSQL 16 + PostGIS 3.4 + pgvector** (Enterprise & Docker production runtime): Fully scalable spatial and dense vector indexing.

## 2. Core Entities
| Entity | Primary Key | Description |
|---|---|---|
| `users` | UUID / String | 8 distinct stakeholder roles with institutional credentials |
| `policies` | UUID / Code | National policies (SVAMITVA, DILRMP, ULPIN, FRA, LARR) with targets and budget |
| `research` | UUID / ID | 52+ research papers with metadata, findings, recommendations, and vector embeddings |
| `research_fts`| Virtual FTS5 | Full-text search index across title, authors, state, and summary |
| `datasets` | UUID / ID | 31+ spatial, satellite, and cadastral datasets with quality scores and API endpoints |
| `disputes` | UUID / ID | Aggregated, anonymized judicial land dispute litigation records |
| `projects` | UUID / ID | Collaborative research workspace projects with tasks and notes |
| `innovation_challenges` | UUID / ID | Hackathons, grants, and academic challenges |
| `audit_logs` | BigSerial / Auto | Immutable append-only compliance ledger tracking all actions |

## 3. Seed Data Breakdown
- **52 Research Documents**: Covering peri-urban conversion, dispute adjudication, SVAMITVA evaluation, coastal vulnerability, and FRA rights.
- **31 Datasets**: Cadastral parcel indices, LULC series, forest canopy density, and climate vulnerability grids.
- **20 National Policies**: High-detail operational parameters, budgets, targets, and traffic-light indicators.
- **8 User Stakeholders**: Representing each specified user role.
