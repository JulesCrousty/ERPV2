#!/usr/bin/env node
import process from 'node:process';

const baseUrl = process.env.LOKI_URL || 'http://localhost:3100';

async function main() {
  const health = await fetch(`${baseUrl}/ready`);
  if (!health.ok) {
    console.error('Loki not ready', health.status);
    process.exit(1);
  }

  const query = encodeURIComponent('{job="erp"} |= "[MODULE:FI]"');
  const logs = await fetch(`${baseUrl}/loki/api/v1/query?query=${query}`);
  if (!logs.ok) {
    console.error('Failed to query Loki');
    process.exit(1);
  }
  const data = await logs.json();
  const hasEntries = Array.isArray(data.data?.result) && data.data.result.length > 0;
  if (!hasEntries) {
    console.error('No FI module logs found');
    process.exit(1);
  }
  console.log('Loki up and receiving FI logs');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
