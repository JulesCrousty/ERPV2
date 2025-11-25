#!/bin/bash
set -e

node qa/monitoring/check-loki.js
node qa/monitoring/check-grafana.js
