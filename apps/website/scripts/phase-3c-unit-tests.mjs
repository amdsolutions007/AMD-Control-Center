/**
 * Phase 3C local unit tests — validation and profile helpers
 * Run: node apps/website/scripts/phase-3c-unit-tests.mjs
 */

import assert from 'node:assert/strict';

function slugifyArtistName(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64) || 'artist';
}

function validateSubmissionPayload(payload) {
  if (!payload.song_title?.trim()) return 'Song title is required.';
  if (!payload.artist_name?.trim()) return 'Artist name is required.';
  const hasDsp = Object.values(payload.dsp_links ?? {}).some((v) => Boolean(v?.trim()));
  if (!hasDsp) return 'At least one streaming platform URL is required.';
  if (payload.bpm != null && (payload.bpm < 40 || payload.bpm > 220)) {
    return 'BPM must be between 40 and 220.';
  }
  return null;
}

function profileCompletionPercent(profile) {
  const fields = [
    profile.artist_name,
    profile.stage_name,
    profile.biography,
    profile.country,
    profile.city,
    profile.primary_genre,
    profile.profile_image_url,
  ];
  const filled = fields.filter((f) => Boolean(f?.trim())).length;
  return Math.round((filled / fields.length) * 100);
}

assert.equal(slugifyArtistName('VaB AfroFusion'), 'vab-afrofusion');
assert.equal(slugifyArtistName('  '), 'artist');
assert.equal(validateSubmissionPayload({ song_title: '', artist_name: 'A', dsp_links: {} }), 'Song title is required.');
assert.equal(
  validateSubmissionPayload({ song_title: 'Track', artist_name: 'A', dsp_links: { spotify: 'https://open.spotify.com/track/x' } }),
  null,
);
assert.equal(profileCompletionPercent({
  artist_name: 'A', stage_name: 'B', biography: 'C', country: 'NG', city: 'Lagos', primary_genre: 'Afrobeats', profile_image_url: 'x',
}), 100);

console.log(JSON.stringify({ phase: '3C', tests: 5, pass: true }, null, 2));
