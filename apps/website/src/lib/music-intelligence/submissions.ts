import type { MIDspPlatformKey, MISubmissionStatus } from './constants';

export interface MIMusicSubmissionPayload {
  song_title: string;
  artist_name: string;
  album?: string;
  genre?: string;
  mood?: string;
  bpm?: number | null;
  release_date?: string;
  territory?: string;
  language?: string;
  dsp_links: Partial<Record<MIDspPlatformKey, string>>;
  artwork_url?: string;
  press_kit_url?: string;
  biography?: string;
}

export interface MIMusicSubmissionRow extends MIMusicSubmissionPayload {
  id: string;
  hub_id: string;
  artist_id: string | null;
  submitted_by: string;
  status: MISubmissionStatus;
  audio_upload_ready: boolean;
  created_at: string;
  updated_at: string;
}

export function validateSubmissionPayload(payload: MIMusicSubmissionPayload): string | null {
  if (!payload.song_title?.trim()) return 'Song title is required.';
  if (!payload.artist_name?.trim()) return 'Artist name is required.';
  const hasDsp = Object.values(payload.dsp_links ?? {}).some((v) => Boolean(v?.trim()));
  if (!hasDsp) return 'At least one streaming platform URL is required.';
  if (payload.bpm != null && (payload.bpm < 40 || payload.bpm > 220)) {
    return 'BPM must be between 40 and 220.';
  }
  return null;
}
