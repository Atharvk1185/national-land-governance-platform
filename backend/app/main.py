"""
Main REST API & Application Server for National Digital Platform for Land Governance.
Provides:
- Complete RESTful API v1 endpoints
- Multi-threaded request processing
- Static file serving for the Single Page Application frontend
- Zero external package dependency (runs on Python 3.9 - 3.14 stdlib)
- OpenAPI-ready architecture
"""

import os
import sys
import json
import urllib.parse
import mimetypes
import logging
from http.server import HTTPServer, SimpleHTTPRequestHandler
from socketserver import ThreadingMixIn
from datetime import datetime
from typing import Dict, Any, List, Optional

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.app.database import init_db, get_connection
from backend.app.utils.seed_data import (
    USERS_SEED, STATE_INDICATORS, KNOWLEDGE_GRAPH, DEMO_DISCLAIMER
)
from backend.app.services.ai_service import ai_service
from backend.app.services.gis_service import gis_service
from backend.app.services.simulation_service import simulation_engine
from backend.app.services.recommendation_service import recommendation_service
from backend.app.services.report_service import report_generator

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("nlgirp.server")

FRONTEND_DIR = os.path.join(PROJECT_ROOT, "frontend")

class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True

class LandGovernanceAPIHandler(SimpleHTTPRequestHandler):

    def send_json(self, data: Any, status: int = 200):
        body = json.dumps(data, indent=2, default=str).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
        self.end_headers()

    def parse_query_params(self, url_path: str) -> Dict[str, str]:
        parsed = urllib.parse.urlparse(url_path)
        qs = urllib.parse.parse_qs(parsed.query)
        return {k: v[0] for k, v in qs.items()}

    def read_json_body(self) -> Dict[str, Any]:
        content_len = int(self.headers.get("Content-Length", 0))
        if content_len == 0:
            return {}
        raw = self.rfile.read(content_len).decode("utf-8")
        try:
            return json.loads(raw)
        except Exception:
            return {}

    # ------------------ GET ROUTING ------------------
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        params = self.parse_query_params(self.path)

        # 1. API Health
        if path == "/api/v1/health":
            return self.send_json({
                "status": "operational",
                "service": "National Digital Platform for Land Governance API",
                "version": "1.0.0",
                "timestamp": datetime.utcnow().isoformat(),
                "disclaimer": DEMO_DISCLAIMER
            })

        # 2. Auth & Roles
        elif path == "/api/v1/auth/roles":
            return self.send_json({"roles": [u["role"] for u in USERS_SEED], "users": USERS_SEED})

        elif path == "/api/v1/auth/me":
            role_param = params.get("role", "RESEARCHER")
            matched_user = next((u for u in USERS_SEED if u["role"].upper() == role_param.upper()), USERS_SEED[2])
            return self.send_json(matched_user)

        # 3. National Dashboard KPIs & Charts
        elif path == "/api/v1/dashboard/stats":
            con = get_connection()
            cur = con.cursor()
            pub_count = cur.execute("SELECT COUNT(*) FROM research;").fetchone()[0]
            ds_count = cur.execute("SELECT COUNT(*) FROM datasets;").fetchone()[0]
            pol_count = cur.execute("SELECT COUNT(*) FROM policies;").fetchone()[0]
            prj_count = cur.execute("SELECT COUNT(*) FROM projects;").fetchone()[0]
            con.close()

            total_disputes = sum(s["disputes_total"] for s in STATE_INDICATORS.values())
            resolved_disputes = sum(s["disputes_resolved_ytd"] for s in STATE_INDICATORS.values())

            return self.send_json({
                "total_research_publications": pub_count,
                "total_datasets": ds_count,
                "total_policies_monitored": pol_count,
                "active_research_projects": prj_count,
                "registered_institutions": 142,
                "ongoing_policy_experiments": 18,
                "parcels_with_bhu_aadhaar_crores": 22.4,
                "total_immovable_property_disputes": total_disputes,
                "disputes_resolved_ytd": resolved_disputes,
                "national_clearance_rate_pct": round(resolved_disputes / total_disputes * 100, 1),
                "states_reporting": len(STATE_INDICATORS),
                "disclaimer": DEMO_DISCLAIMER
            })

        elif path == "/api/v1/dashboard/charts":
            trends = recommendation_service.get_national_trends()
            state_chart = []
            for sname, sdata in STATE_INDICATORS.items():
                state_chart.append({
                    "state": sname,
                    "code": sdata["code"],
                    "research_count": sdata["research_count"],
                    "datasets_count": sdata["datasets_count"],
                    "disputes_total": sdata["disputes_total"],
                    "climate_risk": sdata["climate_risk_index"],
                    "bhu_aadhaar_pct": sdata["bhu_aadhaar_coverage_pct"],
                    "agricultural_pct": sdata["agricultural_pct"],
                    "urban_pct": sdata["urban_pct"],
                    "forest_pct": sdata["forest_pct"]
                })
            
            # Publications by year (aggregate from research table)
            con = get_connection()
            cur = con.cursor()
            cur.execute("SELECT year, COUNT(*) as count FROM research GROUP BY year ORDER BY year;")
            year_data = [dict(r) for r in cur.fetchall()]
            con.close()

            return self.send_json({
                "publications_by_year": year_data,
                "state_metrics": state_chart,
                "trends": trends
            })

        # 4. Research Repository
        elif path == "/api/v1/research":
            state_filter = params.get("state")
            topic_filter = params.get("topic")
            con = get_connection()
            cur = con.cursor()
            
            query = "SELECT * FROM research WHERE 1=1"
            q_args = []
            if state_filter and state_filter.lower() != "all":
                query += " AND state LIKE ?"
                q_args.append(f"%{state_filter}%")
            if topic_filter and topic_filter.lower() != "all":
                query += " AND (topic LIKE ? OR title LIKE ?)"
                q_args.append(f"%{topic_filter}%")
                q_args.append(f"%{topic_filter}%")
            
            query += " ORDER BY citations_count DESC LIMIT 50;"
            cur.execute(query, q_args)
            docs = [dict(r) for r in cur.fetchall()]
            con.close()
            return self.send_json({"total": len(docs), "documents": docs})

        elif path.startswith("/api/v1/research/"):
            doc_id = path.split("/")[-1]
            con = get_connection()
            cur = con.cursor()
            cur.execute("SELECT * FROM research WHERE id = ?;", (doc_id,))
            row = cur.fetchone()
            con.close()
            if row:
                return self.send_json(dict(row))
            return self.send_json({"error": "Research document not found"}, 404)

        # 5. Dataset Catalog
        elif path == "/api/v1/datasets":
            con = get_connection()
            cur = con.cursor()
            cur.execute("SELECT * FROM datasets ORDER BY quality_score DESC;")
            ds_list = [dict(r) for r in cur.fetchall()]
            con.close()
            return self.send_json({"total": len(ds_list), "datasets": ds_list})

        elif path.startswith("/api/v1/datasets/"):
            ds_id = path.split("/")[-1]
            con = get_connection()
            cur = con.cursor()
            cur.execute("SELECT * FROM datasets WHERE id = ?;", (ds_id,))
            row = cur.fetchone()
            con.close()
            if row:
                return self.send_json(dict(row))
            return self.send_json({"error": "Dataset not found"}, 404)

        # 6. Policy Performance Dashboard
        elif path == "/api/v1/policies":
            con = get_connection()
            cur = con.cursor()
            cur.execute("SELECT * FROM policies ORDER BY score DESC;")
            policies = [dict(r) for r in cur.fetchall()]
            con.close()
            return self.send_json({"total": len(policies), "policies": policies})

        elif path.startswith("/api/v1/policies/"):
            pol_id = path.split("/")[-1]
            con = get_connection()
            cur = con.cursor()
            cur.execute("SELECT * FROM policies WHERE id = ? OR code = ?;", (pol_id, pol_id))
            row = cur.fetchone()
            con.close()
            if row:
                return self.send_json(dict(row))
            return self.send_json({"error": "Policy not found"}, 404)

        # 7. GIS Modules
        elif path == "/api/v1/gis/layers":
            return self.send_json(gis_service.get_layers_manifest())

        elif path == "/api/v1/gis/geojson/states":
            return self.send_json(gis_service.get_state_geojson())

        elif path == "/api/v1/gis/corridors":
            return self.send_json(gis_service.get_corridors_geojson())

        elif path == "/api/v1/gis/lulc-change":
            state = params.get("state", "Maharashtra")
            start = int(params.get("start", 2015))
            end = int(params.get("end", 2025))
            return self.send_json(gis_service.analyze_land_use_change(state, start, end))

        # 8. Dispute & Climate Analytics
        elif path == "/api/v1/analytics/disputes":
            state_records = []
            for sname, sinfo in STATE_INDICATORS.items():
                state_records.append({
                    "state": sname,
                    "code": sinfo["code"],
                    "total_disputes": sinfo["disputes_total"],
                    "pending": sinfo["disputes_pending"],
                    "resolved_ytd": sinfo["disputes_resolved_ytd"],
                    "avg_resolution_years": sinfo["avg_resolution_years"],
                    "causes": sinfo["dispute_causes"]
                })
            return self.send_json({"states": state_records, "disclaimer": DEMO_DISCLAIMER})

        elif path == "/api/v1/analytics/climate":
            climate_records = []
            for sname, sinfo in STATE_INDICATORS.items():
                climate_records.append({
                    "state": sname,
                    "code": sinfo["code"],
                    "climate_risk_index": sinfo["climate_risk_index"],
                    "drought_hazard": sinfo["drought_hazard"],
                    "flood_hazard": sinfo["flood_hazard"],
                    "heat_stress": sinfo["heat_stress"]
                })
            climate_records.sort(key=lambda x: x["climate_risk_index"], reverse=True)
            return self.send_json({"rankings": climate_records, "disclaimer": DEMO_DISCLAIMER})

        # 9. Recommendations & Trends
        elif path == "/api/v1/recommendations":
            role = params.get("role", "RESEARCHER")
            state = params.get("state", "Maharashtra")
            topic = params.get("topic", "Urban Sprawl")
            return self.send_json(recommendation_service.get_recommendations_for_user(role, state, topic))

        elif path == "/api/v1/trends":
            return self.send_json(recommendation_service.get_national_trends())

        # 10. Collaboration Workspace Projects
        elif path == "/api/v1/workspace/projects":
            con = get_connection()
            cur = con.cursor()
            cur.execute("SELECT * FROM projects ORDER BY created_at DESC;")
            projects = [dict(r) for r in cur.fetchall()]
            con.close()
            return self.send_json({"projects": projects})

        # 11. Innovation Challenges
        elif path == "/api/v1/innovation/challenges":
            con = get_connection()
            cur = con.cursor()
            cur.execute("SELECT * FROM innovation_challenges ORDER BY deadline ASC;")
            challenges = [dict(r) for r in cur.fetchall()]
            con.close()
            return self.send_json({"challenges": challenges})

        # 12. Knowledge Graph
        elif path == "/api/v1/knowledge-graph/data":
            return self.send_json(KNOWLEDGE_GRAPH)

        # 13. Admin Management
        elif path == "/api/v1/admin/users":
            return self.send_json(USERS_SEED)

        elif path == "/api/v1/admin/audit-logs":
            con = get_connection()
            cur = con.cursor()
            cur.execute("SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 50;")
            logs = [dict(r) for r in cur.fetchall()]
            con.close()
            return self.send_json({"audit_logs": logs})

        # Static Frontend Serving
        return self.serve_static_frontend(path)

    # ------------------ POST ROUTING ------------------
    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        body = self.read_json_body()

        # 1. AI Semantic Search
        if path == "/api/v1/search/query":
            query = body.get("query", "").strip()
            state_filter = body.get("state")
            if not query:
                return self.send_json({"error": "Query string is required"}, 400)
            
            result = ai_service.semantic_search(query, state_filter=state_filter)
            return self.send_json(result)

        # 2. AI Research Assistant Chat
        elif path == "/api/v1/assistant/chat":
            prompt = body.get("prompt", "").strip()
            task_type = body.get("task_type", "literature_synthesis")
            if not prompt:
                return self.send_json({"error": "Prompt string is required"}, 400)

            result = ai_service.research_assistant_query(prompt, task_type=task_type)
            return self.send_json(result)

        # 3. Policy Scenario Simulation
        elif path == "/api/v1/simulation/run":
            result = simulation_engine.run_simulation(body)
            return self.send_json(result)

        # 4. Report Generation
        elif path == "/api/v1/reports/generate":
            state = body.get("state", "Maharashtra")
            topic = body.get("topic", "Agricultural Land Conversion & Dispute Resolution")
            report = report_generator.generate_state_governance_report(state, topic)
            return self.send_json(report)

        # 5. Create Collaboration Project
        elif path == "/api/v1/workspace/projects":
            title = body.get("title", "Untitled Project")
            lead = body.get("lead_researcher", "Dr. Researcher")
            inst = body.get("lead_institution", "National University")
            desc = body.get("description", "")
            
            pid = f"proj-{datetime.now().strftime('%m%d%H%M')}"
            con = get_connection()
            cur = con.cursor()
            cur.execute("""
            INSERT INTO projects (id, title, lead_researcher, lead_institution, members_count, status, progress_pct, datasets_used_json, description, tasks_json, notes_json)
            VALUES (?, ?, ?, ?, 1, 'Active', 0, '[]', ?, '[]', '[]');
            """, (pid, title, lead, inst, desc))
            con.commit()
            con.close()
            return self.send_json({"success": True, "project_id": pid, "message": "Project created successfully"})

        # 6. Submit Innovation Proposal
        elif path == "/api/v1/innovation/proposals":
            challenge_id = body.get("challenge_id", "chal-01")
            name = body.get("applicant_name", "Anonymous Applicant")
            email = body.get("applicant_email", "applicant@institution.org")
            inst = body.get("institution", "Academic Institution")
            title = body.get("title", "Proposal Title")
            abstract = body.get("abstract", "")
            
            prop_id = f"prop-{datetime.now().strftime('%m%d%H%M')}"
            con = get_connection()
            cur = con.cursor()
            cur.execute("""
            INSERT INTO innovation_proposals (id, challenge_id, applicant_name, applicant_email, institution, title, abstract)
            VALUES (?, ?, ?, ?, ?, ?, ?);
            """, (prop_id, challenge_id, name, email, inst, title, abstract))
            cur.execute("""
            UPDATE innovation_challenges SET submissions_count = submissions_count + 1 WHERE id = ?;
            """, (challenge_id,))
            con.commit()
            con.close()
            return self.send_json({"success": True, "proposal_id": prop_id, "message": "Proposal submitted successfully"})

        return self.send_json({"error": "Endpoint not found"}, 404)

    # ------------------ STATIC ASSET SERVING ------------------
    def serve_static_frontend(self, path: str):
        if path == "/" or not os.path.exists(os.path.join(FRONTEND_DIR, path.lstrip("/"))):
            file_path = os.path.join(FRONTEND_DIR, "index.html")
        else:
            file_path = os.path.join(FRONTEND_DIR, path.lstrip("/"))

        if not os.path.isfile(file_path):
            file_path = os.path.join(FRONTEND_DIR, "index.html")

        content_type, _ = mimetypes.guess_type(file_path)
        if not content_type:
            content_type = "text/plain"

        try:
            with open(file_path, "rb") as f:
                content = f.read()
            self.send_response(200)
            self.send_header("Content-Type", f"{content_type}; charset=utf-8")
            self.send_header("Content-Length", str(len(content)))
            self.send_header("Cache-Control", "no-cache")
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            logger.error("Error serving static file %s: %s", file_path, e)
            self.send_response(500)
            self.end_headers()

def run_server(port: int = 8000, host: str = "127.0.0.1"):
    init_db()
    server_address = (host, port)
    httpd = ThreadedHTTPServer(server_address, LandGovernanceAPIHandler)
    logger.info("==================================================================")
    logger.info("National Digital Platform for Land Governance Server Running!")
    logger.info("URL: http://%s:%d", host, port)
    logger.info("Serving API at /api/v1/... and Single Page App at /")
    logger.info("==================================================================")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        logger.info("Shutting down server...")
        httpd.server_close()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    run_server(port=port)
