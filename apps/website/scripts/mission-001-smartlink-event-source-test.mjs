/**
 * Mission 001 source-level control test for smart-link GA4 instrumentation.
 *
 * This does not claim GA4 receipt. It verifies that every authorized event is
 * attached to the intended real interaction and that generate_lead remains
 * absent until a qualifying completed lead action is defined.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const componentPath = resolve(here, '../src/components/smartlink/SmartLinkActionButtons.tsx');
const source = readFileSync(componentPath, 'utf8');

const expectedBindings = [
  ['smartlink_view', /useEffect\(\(\) => \{[\s\S]*trackSmartLinkEvent\('smartlink_view'/],
  ['smartlink_gateway_open', /const openGateway = \(\) => \{[\s\S]*trackSmartLinkEvent\('smartlink_gateway_open'/],
  ['dsp_outbound_click', /DSP_DESTINATIONS\.has\(key\)[\s\S]*trackSmartLinkEvent\('dsp_outbound_click'/],
  ['audio_preview_start', /a\.play\(\)\.then\(\(\) => \{[\s\S]*trackSmartLinkEvent\('audio_preview_start'/],
  ['artist_signup_start', /title === 'Artist'[\s\S]*\? 'artist_signup_start'/],
  ['enterprise_signup_start', /: 'enterprise_signup_start'/],
];

for (const [eventName, binding] of expectedBindings) {
  assert.match(source, binding, `${eventName} is not bound to its authorized interaction`);
}

assert.doesNotMatch(
  source,
  /trackSmartLinkEvent\('generate_lead'/,
  'generate_lead must not fire without a completed lead action',
);

assert.match(source, /outbound_domain: outboundDomain\(url\)/, 'Outbound URLs must be reduced to a non-sensitive domain');
assert.match(source, /const smartLinkViewTracked = useRef\(false\)/, 'View event requires a duplicate guard');
assert.match(source, /const audioPreviewTracked = useRef\(false\)/, 'Preview-start event requires a duplicate guard');

console.log(JSON.stringify({
  mission: 'AMD GROWTH OPS 007 — Mission 001',
  validation: 'source-level control test',
  implementedBindings: expectedBindings.map(([eventName]) => eventName),
  proposedOnly: ['generate_lead'],
  pass: true,
}, null, 2));
