// Breakpoint test: keep ramping the request rate up until the app breaks, to
// find its capacity limit. No failure threshold on purpose - breaking is the
// expected outcome; read the summary to see where errors/latency start to climb.
import { fullJourney } from '../lib/api.js';
import { buildSummary } from '../lib/summary.js';

const TARGET_RPS = __ENV.BREAKPOINT_TARGET_RPS ? Number(__ENV.BREAKPOINT_TARGET_RPS) : 300;

export const options = {
  scenarios: {
    breakpoint: {
      executor: 'ramping-arrival-rate',
      startRate: 5,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: 300,
      stages: [{ duration: '5m', target: TARGET_RPS }],
    },
  },
};

export default function () {
  fullJourney();
}

export function handleSummary(data) {
  return buildSummary(data, 'breakpoint');
}
