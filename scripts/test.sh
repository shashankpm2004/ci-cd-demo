#!/usr/bin/env bash
set -e

echo "=========================================="
echo " Starting Application Test (Fail-Fast CI)"
echo "=========================================="

PORT=3000
HOST="127.0.0.1"
URL="http://${HOST}:${PORT}/"

# Start the Node.js application in background
node app.js &
APP_PID=$!
echo "[INFO] Started app with PID: $APP_PID on port $PORT"

# Ensure background process is terminated when script exits
cleanup() {
  echo "[INFO] Stopping test server (PID $APP_PID)..."
  kill $APP_PID 2>/dev/null || true
  wait $APP_PID 2>/dev/null || true
}
trap cleanup EXIT

# Wait for application to be ready (retry loop)
echo "[INFO] Waiting for server to become responsive..."
MAX_RETRIES=15
COUNT=0
READY=false

while [ $COUNT -lt $MAX_RETRIES ]; do
  if curl -s -f "$URL" > /dev/null 2>&1; then
    READY=true
    break
  fi
  sleep 1
  COUNT=$((COUNT + 1))
done

if [ "$READY" = false ]; then
  echo "[ERROR] Application failed to start or become responsive within $MAX_RETRIES seconds."
  exit 1
fi

echo "[INFO] Server is reachable! Validating endpoint responses..."

# 1. Test root endpoint
RESPONSE=$(curl -s "$URL")
echo "[TEST 1] Root endpoint output: $RESPONSE"

if [[ "$RESPONSE" == *"Hello, Node.js!"* ]]; then
  echo "[PASS] Root endpoint returned expected greeting: 'Hello, Node.js!'"
else
  echo "[FAIL] Unexpected response from root endpoint: '$RESPONSE'"
  exit 1
fi

# 2. Test health check endpoint
HEALTH_URL="http://${HOST}:${PORT}/health"
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL")
echo "[TEST 2] Health endpoint HTTP status code: $HEALTH_STATUS"

if [ "$HEALTH_STATUS" -eq 200 ]; then
  echo "[PASS] Health check returned HTTP 200 OK."
else
  echo "[FAIL] Health check returned HTTP $HEALTH_STATUS instead of 200."
  exit 1
fi

echo "=========================================="
echo " ALL TESTS PASSED SUCCESSFULLY! (Exit 0)  "
echo "=========================================="
exit 0

