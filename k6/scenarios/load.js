// Average-load test: simulate typical expected production traffic.
import { fullJourney } from '../lib/api.js';
import { buildSummary, SUMMARY_TREND_STATS } from '../lib/summary.js';

const TARGET_VUS = __ENV.LOAD_VUS ? Number(__ENV.LOAD_VUS) : 20;

export const options = {
  scenarios: {
    average_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: TARGET_VUS },
        { duration: '3m', target: TARGET_VUS },
        { duration: '30s', target: 0 },
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
  return buildSummary(data, 'load');
}
