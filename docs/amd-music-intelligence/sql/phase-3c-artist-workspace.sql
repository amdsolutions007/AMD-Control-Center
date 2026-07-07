-- Phase 3C — Artist Command Center & Submission Workspace
-- Extends Phase 1 schema. Do NOT recreate existing tables.
-- Apply via Supabase SQL Editor on Client-Portal-007 (pjoijeligrgttimkqftk)

-- ── mi_artist_members: links auth.users to mi_artists catalog rows ──
CREATE TABLE IF NOT EXISTS mi_artist_members (
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  artist_id   UUID        NOT NULL REFERENCES mi_artists(id) ON DELETE CASCADE,
  hub_id      UUID        NOT NULL REFERENCES mi_client_hubs(id),
  role        TEXT        NOT NULL DEFAULT 'artist' CHECK (role IN ('artist','manager')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, artist_id)
);

CREATE INDEX IF NOT EXISTS idx_mi_artist_members_user   ON mi_artist_members(user_id);
CREATE INDEX IF NOT EXISTS idx_mi_artist_members_artist ON mi_artist_members(artist_id);

ALTER TABLE mi_artist_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Artist members view own membership" ON mi_artist_members;
CREATE POLICY "Artist members view own membership"
  ON mi_artist_members FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Artist members insert own membership" ON mi_artist_members;
CREATE POLICY "Artist members insert own membership"
  ON mi_artist_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ── mi_music_submissions: playlist consideration / release submission workflow ──
CREATE TABLE IF NOT EXISTS mi_music_submissions (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_id          UUID        NOT NULL REFERENCES mi_client_hubs(id),
  artist_id       UUID        REFERENCES mi_artists(id),
  submitted_by    UUID        NOT NULL REFERENCES auth.users(id),
  status          TEXT        NOT NULL DEFAULT 'pending_review'
                  CHECK (status IN ('draft','pending_review','approved','rejected')),
  song_title      TEXT        NOT NULL,
  artist_name     TEXT        NOT NULL,
  album           TEXT,
  genre           TEXT,
  mood            TEXT,
  bpm             INTEGER     CHECK (bpm IS NULL OR bpm BETWEEN 40 AND 220),
  release_date    DATE,
  territory       TEXT        DEFAULT 'Global',
  language        TEXT,
  dsp_links       JSONB       NOT NULL DEFAULT '{}',
  artwork_url     TEXT,
  press_kit_url   TEXT,
  biography       TEXT,
  audio_upload_ready BOOLEAN  NOT NULL DEFAULT false,
  rejection_reason TEXT,
  reviewed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mi_music_submissions_user   ON mi_music_submissions(submitted_by);
CREATE INDEX IF NOT EXISTS idx_mi_music_submissions_artist ON mi_music_submissions(artist_id);
CREATE INDEX IF NOT EXISTS idx_mi_music_submissions_status ON mi_music_submissions(status);
CREATE INDEX IF NOT EXISTS idx_mi_music_submissions_hub    ON mi_music_submissions(hub_id);

ALTER TABLE mi_music_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Artists view own submissions" ON mi_music_submissions;
CREATE POLICY "Artists view own submissions"
  ON mi_music_submissions FOR SELECT
  USING (submitted_by = auth.uid());

DROP POLICY IF EXISTS "Artists insert own submissions" ON mi_music_submissions;
CREATE POLICY "Artists insert own submissions"
  ON mi_music_submissions FOR INSERT
  WITH CHECK (submitted_by = auth.uid());

DROP POLICY IF EXISTS "Artists update own draft submissions" ON mi_music_submissions;
CREATE POLICY "Artists update own draft submissions"
  ON mi_music_submissions FOR UPDATE
  USING (submitted_by = auth.uid() AND status IN ('draft','pending_review'));

DROP POLICY IF EXISTS "Hub managers manage hub submissions" ON mi_music_submissions;
CREATE POLICY "Hub managers manage hub submissions"
  ON mi_music_submissions FOR ALL
  USING (public.mi_is_hub_manager(hub_id));

-- ── Artist self-service on mi_artists (via membership) ──
DROP POLICY IF EXISTS "Artist members view linked artist" ON mi_artists;
CREATE POLICY "Artist members view linked artist"
  ON mi_artists FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM mi_artist_members m
      WHERE m.artist_id = mi_artists.id AND m.user_id = auth.uid()
    )
    OR is_active = true
  );

DROP POLICY IF EXISTS "Artist members update linked artist" ON mi_artists;
CREATE POLICY "Artist members update linked artist"
  ON mi_artists FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM mi_artist_members m
      WHERE m.artist_id = mi_artists.id AND m.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Authenticated users create artist profile" ON mi_artists;
CREATE POLICY "Authenticated users create artist profile"
  ON mi_artists FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ── Auto-create mi_user_profiles on auth signup (if not exists) ──
CREATE OR REPLACE FUNCTION public.mi_handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.mi_user_profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_mi_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_mi_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.mi_handle_new_user();

DROP TRIGGER IF EXISTS trg_mi_music_submissions_updated_at ON mi_music_submissions;
CREATE TRIGGER trg_mi_music_submissions_updated_at
  BEFORE UPDATE ON mi_music_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
