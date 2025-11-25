#!/bin/bash
set -e

echo "=== Backend Unit Tests ==="
npm run test:unit || exit 1

echo "=== Backend Integration Tests ==="
npm run test:integration || exit 1

echo "=== Backend E2E Tests ==="
npm run test:e2e || exit 1

echo "=== Frontend UI Tests ==="
npm run test:ui || exit 1

echo "=== Load Tests ==="
k6 run qa/load/k6/mm-load-test.js || exit 1

echo "=== Monitoring Tests ==="
node qa/monitoring/check-loki.js || exit 1
node qa/monitoring/check-grafana.js || exit 1

echo "=== ALL TESTS PASSED ==="
