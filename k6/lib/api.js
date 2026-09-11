import http from 'k6/http';
import { check } from 'k6';

if (!__ENV.BASE_URL) {
  throw new Error(
    'BASE_URL environment variable is required, e.g.: k6 run -e BASE_URL=https://your-app.up.railway.app k6/scenarios/smoke.js'
  );
}
export const BASE_URL = __ENV.BASE_URL.replace(/\/+$/, '');

// Real long URLs to shorten during the test. The backend stores links in an
// in-memory Map (cleared on every restart/redeploy), so we always POST these
// fresh rather than depending on any previously generated short code.
export const SEED_URLS = [
  'https://railway.com/project/702e0a73-9ffa-4fef-83fc-93f5729ce6f5/service/1c403496-753b-41ce-9d7a-48e49d0481a9/settings?environmentId=7e0fad9c-cdbd-4c82-8630-396e1cbb72a9',
  'https://outlook.cloud.microsoft/mail/inbox/id/AAQkAGNkYjk2OWU1LWExZmYtNDY0MS05YjA4LTk1MTBlOGQwZWU0NAAQAEnSfCSOKZhPix3TxPd5dLo%3D',
];

export function randomSeedUrl() {
  return SEED_URLS[Math.floor(Math.random() * SEED_URLS.length)];
}

export function createLink(url) {
  const res = http.post(`${BASE_URL}/api/links`, JSON.stringify({ url }), {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'CreateLink' },
  });
  check(res, {
    'create: status 201': (r) => r.status === 201,
    'create: has code': (r) => !!r.json('code'),
  });
  return res.status === 201 ? res.json('code') : null;
}

export function followRedirect(code) {
  const res = http.get(`${BASE_URL}/${code}`, {
    redirects: 0,
    tags: { name: 'FollowRedirect' },
  });
  check(res, { 'redirect: status 302': (r) => r.status === 302 });
  return res;
}

export function listLinks() {
  const res = http.get(`${BASE_URL}/api/links`, { tags: { name: 'ListLinks' } });
  check(res, { 'list: status 200': (r) => r.status === 200 });
  return res;
}

// One full user journey: shorten a URL, follow the redirect it produces,
// then list all links (mirrors the three endpoints in the API contract).
export function fullJourney() {
  const code = createLink(randomSeedUrl());
  if (code) followRedirect(code);
  listLinks();
}
