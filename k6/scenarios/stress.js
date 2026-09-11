// Stress test: push well beyond normal load to see how the app degrades.
import { fullJourney } from '../lib/api.js';
import { buildSummary } from '../lib/summary.js';

export const options = {
  scenarios: {
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 20 },
        { duration: '2m', target: 20 },
        { duration: '1m', target: 40 },
        { duration: '2m', target: 40 },
        { duration: '1m', target: 60 },
        { duration: '2m', target: 60 },
        { duration: '2m', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<1500'],
  },
};

export default function () {
  fullJourney();
}

export function handleSummary(data) {
  return buildSummary(data, 'stress');
}
