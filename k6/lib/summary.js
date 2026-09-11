import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';

// k6 only reports p90/p95 by default; add p99 so both the console summary
// and the HTML report show it. Spread this into every scenario's `options`.
export const SUMMARY_TREND_STATS = ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(98)', 'p(99)'];

// Prints the usual text summary to stdout and additionally writes a
// self-contained HTML report named after the scenario (e.g. smoke-report.html)
// so the workflow can upload it as a build artifact.
export function buildSummary(data, name) {
  return {
    stdout: textSummary(data, { indent: ' ', enableColors: false }),
    [`${name}-report.html`]: htmlReport(data),
  };
}
