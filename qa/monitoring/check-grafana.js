#!/usr/bin/env node
import process from 'node:process';

const grafanaUrl = process.env.GRAFANA_URL || 'http://localhost:3001';
const apiKey = process.env.GRAFANA_API_KEY || 'admin:admin';

async function fetchJson(path) {
  const res = await fetch(`${grafanaUrl}${path}`, {
    headers: { Authorization: `Basic ${Buffer.from(apiKey).toString('base64')}` },
  });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return res.json();
}

async function main() {
  const health = await fetchJson('/api/health');
  if (health.database !== 'ok') {
    throw new Error('Grafana database not healthy');
  }

  const datasources = await fetchJson('/api/datasources');
  const hasLoki = datasources.some((ds) => ds.type === 'loki');
  if (!hasLoki) {
    throw new Error('Loki datasource not configured');
  }

  const dashboards = await fetchJson('/api/search');
  if (!dashboards.length) {
    throw new Error('No dashboards found');
  }

  console.log('Grafana healthy with dashboards and Loki datasource');
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
