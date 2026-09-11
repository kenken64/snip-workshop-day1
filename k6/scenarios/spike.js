// Spike test: sudden, short burst of traffic to check recovery behavior.
import { fullJourney } from '../lib/api.js';
import { buildSummary } from '../lib/summary.js';

export const options = {
  scenarios: {
    spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 2 },
        { duration: '30s', target: 2 },
        { duration: '10s', target: 80 },
        { duration: '1m', target: 80 },
        { duration: '10s', target: 2 },
        { duration: '30s', target: 2 },
        { duration: '10s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.1'],
  },
};

export default function () {
  fullJourney();
}

export function handleSummary(data) {
  return buildSummary(data, 'spike');
}
