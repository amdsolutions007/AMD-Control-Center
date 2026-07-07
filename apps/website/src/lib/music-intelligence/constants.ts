/** Default AMD Music Intelligence hub — Chrome Music Hub (Phase 1 seed) */
export const MI_DEFAULT_HUB_ID = '214a5177-aa98-4a4f-a283-ff2886f9c7fa';

export const MI_DSP_PLATFORMS = [
  { key: 'spotify', label: 'Spotify' },
  { key: 'apple_music', label: 'Apple Music' },
  { key: 'audiomack', label: 'Audiomack' },
  { key: 'boomplay', label: 'Boomplay' },
  { key: 'youtube_music', label: 'YouTube Music' },
  { key: 'deezer', label: 'Deezer' },
  { key: 'amazon_music', label: 'Amazon Music' },
] as const;

export type MIDspPlatformKey = (typeof MI_DSP_PLATFORMS)[number]['key'];

export const MI_SUBMISSION_STATUSES = [
  'draft',
  'pending_review',
  'approved',
  'rejected',
] as const;

export type MISubmissionStatus = (typeof MI_SUBMISSION_STATUSES)[number];
