#!/bin/bash
set -e

if [ ! -d backend/src/modules/analytics ]; then
  echo "Analytics module missing" >&2
  exit 1
fi

if ! grep -q "AnalyticsDatasourcesService" backend/src/modules/analytics/services/analytics-datasources.service.ts; then
  echo "Analytics datasource service missing" >&2
  exit 1
fi

echo "Analytics engine present"
