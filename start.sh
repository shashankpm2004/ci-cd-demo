#!/usr/bin/env bash
# Quick local launcher for app.js

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export PATH="$DIR/.node/bin:$PATH"

echo "=============================================="
echo " Starting Node.js CI/CD Application Locally   "
echo " Node Version: $(node -v)                     "
echo " Running at:   http://localhost:3000/         "
echo " Health check: http://localhost:3000/health   "
echo " Press Ctrl+C to stop the server              "
echo "=============================================="

node "$DIR/app.js"

