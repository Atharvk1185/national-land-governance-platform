#!/usr/bin/env python3
"""
National Digital Platform for Research, Policy Innovation, and Evidence-Based Land Governance.
Single-command platform launcher.
Initializes the database and starts the REST API + Single Page Application server.
"""

import os
import sys

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.dirname(__file__))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.app.main import run_server

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "127.0.0.1")
    print("=" * 70)
    print(" National Digital Platform for Land Governance (NLGIRP)")
    print(" 'Evidence. Innovation. Better Land Governance.'")
    print(f" Starting Server on: http://{host}:{port}")
    print("=" * 70)
    run_server(port=port, host=host)
