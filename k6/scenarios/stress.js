// Stress test: push well beyond normal load to see how the app degrades.
import { fullJourney } from '../lib/api.js';
import { buildSummary, SUMMARY_TREND_STATS } from '../lib/summary.js';

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
  summaryTrendStats: SUMMARY_TREND_STATS,
  // http_req_duration is relaxed relative to load.js: the backend's list
  // endpoint returns the full in-memory link set with no pagination, so its
  // latency (and these percentiles) grow with how many links this run has
  // already created - not with per-request capacity. That's a known,
  // by-design limitation of this demo backend, not a regression to chase.
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<2500', 'p(98)<4500', 'p(99)<5500'],
  },
};

export default function () {
  fullJourney();
}

export function handleSummary(data) {
  return buildSummary(data, 'stress');
}
