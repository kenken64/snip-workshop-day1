// Soak (endurance) test: moderate load sustained for a long time to surface
// leaks or slow degradation. The canonical k6 soak test runs for hours; the
// default here is CI-friendly and can be scaled up with SOAK_MINUTES.
import { fullJourney } from '../lib/api.js';
import { buildSummary, SUMMARY_TREND_STATS } from '../lib/summary.js';

const SOAK_MINUTES = __ENV.SOAK_MINUTES ? Number(__ENV.SOAK_MINUTES) : 15;

export const options = {
  scenarios: {
    soak: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 15 },
        { duration: `${SOAK_MINUTES}m`, target: 15 },
        { duration: '1m', target: 0 },
      ],
    },
  },
  summaryTrendStats: SUMMARY_TREND_STATS,
  // http_req_duration is relaxed relative to load.js: the backend's list
  // endpoint returns the full in-memory link set with no pagination, so its
  // latency (and these percentiles) grow with how many links this run has
  // already created - not with per-request capacity. That's a known,
  // by-design limitation of this demo backend, not a regression to chase.
  // Longer SOAK_MINUTES runs create more links and push these higher still.
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<2000', 'p(98)<3000', 'p(99)<3500'],
  },
};

export default function () {
  fullJourney();
}

export function handleSummary(data) {
  return buildSummary(data, 'soak');
}
