// Smoke test: minimal load, just prove the deployed app works at all.
import { fullJourney } from '../lib/api.js';
import { buildSummary } from '../lib/summary.js';

export const options = {
  vus: 1,
  duration: '1m',
  thresholds: {
    http_req_failed: ['rate==0'],
    http_req_duration: ['p(95)<500'],
  },
};

export default function () {
  fullJourney();
}

export function handleSummary(data) {
  return buildSummary(data, 'smoke');
}
