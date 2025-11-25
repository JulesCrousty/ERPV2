import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 100,
  duration: '1m',
  thresholds: {
    http_req_duration: ['p(95)<800'],
  },
};

export default function () {
  const res = http.get('http://localhost:3000/mm/purchase-orders');
  check(res, {
    'status is 200 or 401': (r) => r.status === 200 || r.status === 401,
  });
  sleep(1);
}
