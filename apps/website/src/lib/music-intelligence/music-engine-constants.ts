import { MI_DSP_PLATFORMS } from './constants';

export interface PlaylistRule {
  id: string;
  playlistName: string;
  genrePatterns: RegExp[];
  moodPatterns?: RegExp[];
  languagePatterns?: RegExp[];
  baseConfidence: number;
  explanation: string;
}

export const MI_PLAYLIST_RULES: PlaylistRule[] = [
  {
    id: 'chrome-afrofusion-radio',
    playlistName: 'Chrome AfroFusion Radio',
    genrePatterns: [/afro/i, /fusion/i, /afrobeats/i, /amapiano/i, /highlife/i],
    moodPatterns: [/upbeat/i, /dance/i, /party/i, /energetic/i],
    baseConfidence: 75,
    explanation: 'Genre and mood metadata align with AfroFusion radio programming.',
  },
  {
    id: 'global-discovery',
    playlistName: 'Global Discovery',
    genrePatterns: [/.+/],
    baseConfidence: 45,
    explanation: 'Track has genre metadata suitable for global discovery rotation.',
  },
  {
    id: 'mood-match',
    playlistName: 'Mood Match Programming',
    genrePatterns: [/.+/],
    moodPatterns: [/.+/],
    baseConfidence: 55,
    explanation: 'Both genre and mood fields populated for mood-based routing.',
  },
  {
    id: 'diaspora-sounds',
    playlistName: 'Diaspora Sounds',
    languagePatterns: [/english/i, /yoruba/i, /igbo/i, /hausa/i, /pidgin/i, /french/i, /swahili/i],
    genrePatterns: [/afro/i, /world/i, /r&b/i, /hip/i],
    baseConfidence: 60,
    explanation: 'Language and genre combination matches diaspora audience targeting.',
  },
];

export const METADATA_REQUIRED_FIELDS: Array<{
  key: string;
  label: string;
  check: (s: Record<string, unknown>) => boolean;
}> = [
  { key: 'song_title', label: 'Song title', check: (s) => Boolean(s.song_title) },
  { key: 'artist_name', label: 'Artist name', check: (s) => Boolean(s.artist_name) },
  { key: 'genre', label: 'Genre', check: (s) => Boolean(s.genre) },
  { key: 'mood', label: 'Mood', check: (s) => Boolean(s.mood) },
  { key: 'language', label: 'Language', check: (s) => Boolean(s.language) },
  { key: 'release_date', label: 'Release date', check: (s) => Boolean(s.release_date) },
  { key: 'album', label: 'Album / EP', check: (s) => Boolean(s.album) },
  { key: 'territory', label: 'Territory', check: (s) => Boolean(s.territory) },
  { key: 'artwork_url', label: 'Artwork', check: (s) => Boolean(s.artwork_url) },
  { key: 'biography', label: 'Biography', check: (s) => Boolean(s.biography) },
];

export const RIGHTS_OPTIONAL_FIELDS: Array<{
  key: string;
  label: string;
  check: (s: Record<string, unknown>) => boolean;
}> = [
  { key: 'press_kit_url', label: 'Press kit / rights documentation', check: (s) => Boolean(s.press_kit_url) },
  { key: 'biography', label: 'Artist biography (ownership context)', check: (s) => Boolean(s.biography) },
];

export function dspPlatformsFromSubmission(dspLinks: Record<string, string> | undefined): string[] {
  const valid = new Set(MI_DSP_PLATFORMS.map((p) => p.key));
  return Object.entries(dspLinks ?? {})
    .filter(([k, v]) => valid.has(k as (typeof MI_DSP_PLATFORMS)[number]['key']) && Boolean(v?.trim()))
    .map(([k]) => MI_DSP_PLATFORMS.find((p) => p.key === k)?.label ?? k);
}
