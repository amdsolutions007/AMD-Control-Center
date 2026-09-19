/**
 * Phase 02 focused source-level attribution certification.
 *
 * This test intentionally avoids network/database access. It verifies that
 * the browser payload and API insert mapping preserve the required fields.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const websiteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const component = readFileSync(resolve(websiteRoot, 'src/components/smartlink/SmartLinkActionButtons.tsx'), 'utf8');
const route = readFileSync(resolve(websiteRoot, 'src/app/api/v1/telemetry/click/route.ts'), 'utf8');

// A. No UTM parameters still produces a telemetry payload with safe empties.
assert.match(component, /utm_source: params\.get\('utm_source'\) \|\| ''/);
assert.match(component, /utm_medium: params\.get\('utm_medium'\) \|\| ''/);
assert.match(component, /utm_campaign: params\.get\('utm_campaign'\) \|\| ''/);

// B–E. Full attribution, session, referrer, DSP and destination travel together.
for (const field of [
  'session_id', 'referrer_url', 'utm_source', 'utm_medium', 'utm_campaign',
  'destination_dsp', 'destination_url',
]) {
  assert.match(component, new RegExp(`${field}:`), `${field} is not sent by the browser`);
  assert.match(route, new RegExp(`${field}:`), `${field} is not persisted by the API`);
}

// C. Session identity is stable for the component lifecycle and sessionStorage.
assert.match(component, /sessionStorage\.getItem\(storageKey\)/);
assert.match(component, /sessionStorage\.setItem\(storageKey, generated\)/);
assert.match(component, /const sessionIdRef = useRef\(''\)/);

// D/F. Referrer and optional values fail safe through bounded string cleaning.
assert.match(route, /body\.referrer_url \|\| req\.headers\.get\('referer'\)/);
assert.match(route, /typeof value === 'string' \? value\.trim\(\)\.slice\(0, max\) : ''/);
assert.match(route, /body\.user_country \|\| headerCountry/);

// G. Existing growth-event bindings remain intact; generate_lead stays absent.
for (const eventName of [
  'smartlink_view', 'smartlink_gateway_open', 'dsp_outbound_click',
  'artist_signup_start', 'enterprise_signup_start',
]) {
  assert.match(component, new RegExp(eventName));
}
assert.doesNotMatch(component, /generate_lead/);

console.log(JSON.stringify({
  phase: '02',
  cases: ['no_utm', 'full_utm', 'session', 'referrer', 'dsp_destination', 'malformed_optional', 'growth_regression'],
  pass: true,
}, null, 2));
