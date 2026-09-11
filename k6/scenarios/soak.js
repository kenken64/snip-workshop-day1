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
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<800', 'p(99)<1500'],
  },
};

export default function () {
  fullJourney();
}

export function handleSummary(data) {
  return buildSummary(data, 'soak');
}
