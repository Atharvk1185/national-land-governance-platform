#!/usr/bin/env bash
# ==============================================================================
# National Digital Platform for Land Governance (NLGIRP) Startup Script
# ==============================================================================

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "======================================================================"
echo " Starting National Digital Platform for Land Governance"
echo " 'Evidence. Innovation. Better Land Governance.'"
echo " Directory: $DIR"
echo "======================================================================"

# Determine Python binary
if command -v python3 &>/dev/null; then
    PY_BIN="python3"
elif [ -f "/Library/Frameworks/Python.framework/Versions/3.14/bin/python3" ]; then
    PY_BIN="/Library/Frameworks/Python.framework/Versions/3.14/bin/python3"
else
    echo "Python 3 is required but not found in PATH."
    exit 1
fi

echo "Using Python: $PY_BIN"

# Execute test suite first
echo "Running automated system diagnostics..."
$PY_BIN scripts/test_suite.py

# Launch Platform
echo ""
echo "Launching NLGIRP Application Server on http://127.0.0.1:8000 ..."
$PY_BIN run_server.py
