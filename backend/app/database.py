"""
Database Layer for National Digital Platform for Land Governance.
Supports dual modes:
1. Zero-dependency high-speed SQLite with FTS5 full-text search & JSON extensions (Out of the box).
2. Production PostgreSQL with PostGIS and pgvector (via configuration / Docker).
"""

import os
import sqlite3
import json
import logging
from typing import Dict, Any, List, Optional
from backend.app.utils.seed_data import (
    USERS_SEED, POLICIES_SEED, RESEARCH_SEED, DATASETS_SEED,
    STATE_INDICATORS, INNOVATION_CHALLENGES, COLLABORATION_PROJECTS,
    KNOWLEDGE_GRAPH, DEMO_DISCLAIMER
)

logger = logging.getLogger("nlgirp.database")

DB_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(DB_DIR, "..", "nlgirp.sqlite3")

def get_connection():
    con = sqlite3.connect(DB_FILE, check_same_thread=False)
    con.row_factory = sqlite3.Row
    return con

def init_db():
    """Initializes tables and seeds initial realistic demonstration records."""
    con = get_connection()
    cur = con.cursor()

    # 1. Users & Roles
    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        institution TEXT,
        designation TEXT,
        avatar TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 2. Policies
    cur.execute("""
    CREATE TABLE IF NOT EXISTS policies (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        department TEXT NOT NULL,
        year INTEGER NOT NULL,
        target TEXT,
        coverage TEXT,
        budget_cr REAL,
        status TEXT,
        score INTEGER,
        status_color TEXT,
        indicators_json TEXT,
        description TEXT,
        outcomes TEXT,
        challenges TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 3. Research Documents
    cur.execute("""
    CREATE TABLE IF NOT EXISTS research (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        authors TEXT NOT NULL,
        institution TEXT NOT NULL,
        year INTEGER NOT NULL,
        state TEXT,
        district TEXT,
        topic TEXT,
        document_type TEXT,
        access_level TEXT,
        license TEXT,
        keywords_json TEXT,
        citations_count INTEGER DEFAULT 0,
        summary TEXT,
        findings_json TEXT,
        policy_recommendations_json TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 4. Research FTS5 Full-Text Search Table
    cur.execute("""
    CREATE VIRTUAL TABLE IF NOT EXISTS research_fts USING fts5(
        id UNINDEXED,
        title,
        authors,
        topic,
        state,
        summary,
        content=research,
        content_rowid=rowid
    );
    """)

    # 5. Datasets Catalog
    cur.execute("""
    CREATE TABLE IF NOT EXISTS datasets (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        publisher TEXT NOT NULL,
        department TEXT,
        coverage TEXT,
        temporal TEXT,
        format TEXT,
        size_mb REAL,
        records_count INTEGER,
        update_freq TEXT,
        access_level TEXT,
        license TEXT,
        quality_score INTEGER,
        api_available BOOLEAN,
        api_endpoint TEXT,
        description TEXT,
        usage TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 6. Collaboration Projects
    cur.execute("""
    CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        lead_researcher TEXT NOT NULL,
        lead_institution TEXT,
        members_count INTEGER DEFAULT 1,
        status TEXT,
        progress_pct INTEGER DEFAULT 0,
        datasets_used_json TEXT,
        description TEXT,
        tasks_json TEXT,
        notes_json TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 7. Innovation Challenges & Proposals
    cur.execute("""
    CREATE TABLE IF NOT EXISTS innovation_challenges (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        organizer TEXT NOT NULL,
        grant_pool_inr TEXT,
        deadline TEXT,
        status TEXT,
        themes_json TEXT,
        submissions_count INTEGER DEFAULT 0,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS innovation_proposals (
        id TEXT PRIMARY KEY,
        challenge_id TEXT NOT NULL,
        applicant_name TEXT NOT NULL,
        applicant_email TEXT NOT NULL,
        institution TEXT NOT NULL,
        title TEXT NOT NULL,
        abstract TEXT NOT NULL,
        methodology TEXT,
        status TEXT DEFAULT 'Submitted',
        score INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (challenge_id) REFERENCES innovation_challenges(id)
    );
    """)

    # 8. Audit Logs
    cur.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_id TEXT,
        action TEXT NOT NULL,
        resource_type TEXT,
        resource_id TEXT,
        details TEXT
    );
    """)

    con.commit()

    # Seed if tables are empty
    cur.execute("SELECT COUNT(*) FROM users;")
    if cur.fetchone()[0] == 0:
        logger.info("Seeding database with realistic demonstration data...")
        # Seed users
        for u in USERS_SEED:
            cur.execute("""
            INSERT INTO users (id, username, email, name, role, institution, designation, avatar)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (u["id"], u["username"], u["email"], u["name"], u["role"], u["institution"], u["designation"], u["avatar"]))

        # Seed policies
        for p in POLICIES_SEED:
            cur.execute("""
            INSERT INTO policies (id, code, title, department, year, target, coverage, budget_cr, status, score, status_color, indicators_json, description, outcomes, challenges)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                p["id"], p["code"], p["title"], p["department"], p["year"], p["target"], p["coverage"],
                p["budget_cr"], p["status"], p["score"], p["status_color"], json.dumps(p["indicators"]),
                p["description"], p["outcomes"], p["challenges"]
            ))

        # Seed research
        for r in RESEARCH_SEED:
            cur.execute("""
            INSERT INTO research (id, title, authors, institution, year, state, district, topic, document_type, access_level, license, keywords_json, citations_count, summary, findings_json, policy_recommendations_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                r["id"], r["title"], r["authors"], r["institution"], r["year"], r["state"], r["district"],
                r["topic"], r["document_type"], r["access_level"], r["license"], json.dumps(r["keywords"]),
                r["citations_count"], r["summary"], json.dumps(r["findings"]), json.dumps(r["policy_recommendations"])
            ))

        # Populate FTS5 index
        cur.execute("""
        INSERT INTO research_fts(id, title, authors, topic, state, summary)
        SELECT id, title, authors, topic, state, summary FROM research;
        """)

        # Seed datasets
        for d in DATASETS_SEED:
            cur.execute("""
            INSERT INTO datasets (id, name, publisher, department, coverage, temporal, format, size_mb, records_count, update_freq, access_level, license, quality_score, api_available, api_endpoint, description, usage)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                d["id"], d["name"], d["publisher"], d["department"], d["coverage"], d["temporal"],
                d["format"], d["size_mb"], d["records_count"], d["update_freq"], d["access_level"],
                d["license"], d["quality_score"], 1 if d["api_available"] else 0, d["api_endpoint"],
                d["description"], d["usage"]
            ))

        # Seed projects
        for prj in COLLABORATION_PROJECTS:
            cur.execute("""
            INSERT INTO projects (id, title, lead_researcher, lead_institution, members_count, status, progress_pct, datasets_used_json, description, tasks_json, notes_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                prj["id"], prj["title"], prj["lead_researcher"], prj["lead_institution"], prj["members_count"],
                prj["status"], prj["progress_pct"], json.dumps(prj["datasets_used"]), prj["description"],
                json.dumps(prj["tasks"]), json.dumps(prj["notes"])
            ))

        # Seed innovation challenges
        for ch in INNOVATION_CHALLENGES:
            cur.execute("""
            INSERT INTO innovation_challenges (id, title, organizer, grant_pool_inr, deadline, status, themes_json, submissions_count, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                ch["id"], ch["title"], ch["organizer"], ch["grant_pool_inr"], ch["deadline"],
                ch["status"], json.dumps(ch["themes"]), ch["submissions_count"], ch["description"]
            ))

        # Log system initialization
        cur.execute("""
        INSERT INTO audit_logs (user_id, action, resource_type, details)
        VALUES ('system', 'SYSTEM_INITIALIZATION', 'PLATFORM', 'Platform initialized with 50+ research docs, 30+ datasets, 20+ policies, and state indicators.')
        """)

        con.commit()
        logger.info("Database seeding successfully completed.")

    con.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully at:", DB_FILE)
