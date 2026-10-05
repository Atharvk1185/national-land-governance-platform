# Deployment & Operations Guide

## 1. Quick Start (Zero-Dependency Local Development)

The platform runs out-of-the-box on standard Python 3.9 - 3.14 without requiring any pip installations or database daemons:

```bash
# Navigate to the platform directory
cd national-land-governance-platform

# Run automated platform diagnostics
python3 scripts/test_suite.py

# Launch the Application & API Server
python3 run_server.py
```
Open your browser to: **`http://127.0.0.1:8000`**

---

## 2. Docker & Enterprise Production Deployment

Deploy the complete multi-container stack (PostgreSQL 16, PostGIS 3.4, Redis, FastAPI, Nginx):

```bash
# Navigate to docker directory
cd docker

# Launch with Docker Compose
docker compose up --build -d
```

### Services Launched:
- `http://localhost`: Nginx Reverse Proxy with Gzip compression and SSL-ready proxying.
- `http://localhost:8000`: Application server exposing REST API `/api/v1/*` and static SPA.
- `localhost:5432`: PostgreSQL 16 with PostGIS and pgvector extensions.
- `localhost:6379`: Redis cache.

---

## 3. Environment Variables Reference

See `.env.example` for details:
```env
PORT=8000
HOST=127.0.0.1
DATABASE_URL=postgresql://user:password@localhost:5432/land_governance_db
LLM_PROVIDER=rule_based # Switchable to openai or local
OPENAI_API_KEY=
JWT_SECRET_KEY=national_secure_secret
```
