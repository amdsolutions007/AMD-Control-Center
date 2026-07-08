-- Phase 3D — Partner Command Center & Enterprise Workspace
-- Extends Phase 1 + Phase 3C schema. Do NOT recreate existing tables.
-- Apply via Supabase SQL Editor on Client-Portal-007 (pjoijeligrgttimkqftk)

-- ── mi_partner_profiles: organization identity for enterprise partners ──
CREATE TABLE IF NOT EXISTS mi_partner_profiles (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_id              UUID        NOT NULL REFERENCES mi_client_hubs(id),
  owner_user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name        TEXT        NOT NULL,
  partner_category    TEXT        NOT NULL DEFAULT 'enterprise-partner',
  logo_url            TEXT,
  country             TEXT,
  website             TEXT,
  contact_email       TEXT,
  contact_phone       TEXT,
  social_links        JSONB       NOT NULL DEFAULT '{}',
  verification_status TEXT        NOT NULL DEFAULT 'pending'
                      CHECK (verification_status IN ('pending','in_review','verified','rejected')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (owner_user_id)
);

CREATE INDEX IF NOT EXISTS idx_mi_partner_profiles_hub   ON mi_partner_profiles(hub_id);
CREATE INDEX IF NOT EXISTS idx_mi_partner_profiles_owner ON mi_partner_profiles(owner_user_id);

ALTER TABLE mi_partner_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Partner owners view own profile" ON mi_partner_profiles;
CREATE POLICY "Partner owners view own profile"
  ON mi_partner_profiles FOR SELECT
  USING (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "Partner owners manage own profile" ON mi_partner_profiles;
CREATE POLICY "Partner owners manage own profile"
  ON mi_partner_profiles FOR ALL
  USING (owner_user_id = auth.uid());

-- ── mi_partner_members: staff access to partner organizations ──
CREATE TABLE IF NOT EXISTS mi_partner_members (
  partner_id  UUID        NOT NULL REFERENCES mi_partner_profiles(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT        NOT NULL DEFAULT 'viewer'
              CHECK (role IN ('owner','admin','manager','viewer')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (partner_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_mi_partner_members_user    ON mi_partner_members(user_id);
CREATE INDEX IF NOT EXISTS idx_mi_partner_members_partner ON mi_partner_members(partner_id);

ALTER TABLE mi_partner_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Partner members view own membership" ON mi_partner_members;
CREATE POLICY "Partner members view own membership"
  ON mi_partner_members FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Partner owners manage members" ON mi_partner_members;
CREATE POLICY "Partner owners manage members"
  ON mi_partner_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM mi_partner_profiles p
      WHERE p.id = mi_partner_members.partner_id AND p.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Partner members view org profile" ON mi_partner_profiles;
CREATE POLICY "Partner members view org profile"
  ON mi_partner_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM mi_partner_members m
      WHERE m.partner_id = mi_partner_profiles.id AND m.user_id = auth.uid()
    )
  );

-- ── mi_partner_invites: artist and staff invitations ──
CREATE TABLE IF NOT EXISTS mi_partner_invites (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id   UUID        NOT NULL REFERENCES mi_partner_profiles(id) ON DELETE CASCADE,
  email        TEXT        NOT NULL,
  invite_type  TEXT        NOT NULL DEFAULT 'artist'
               CHECK (invite_type IN ('staff','artist')),
  role         TEXT        NOT NULL DEFAULT 'artist',
  status       TEXT        NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending','accepted','revoked','expired')),
  invited_by   UUID        REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_mi_partner_invites_partner ON mi_partner_invites(partner_id);
CREATE INDEX IF NOT EXISTS idx_mi_partner_invites_email   ON mi_partner_invites(email);

ALTER TABLE mi_partner_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Partner owners manage invites" ON mi_partner_invites;
CREATE POLICY "Partner owners manage invites"
  ON mi_partner_invites FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM mi_partner_profiles p
      WHERE p.id = mi_partner_invites.partner_id AND p.owner_user_id = auth.uid()
    )
  );

-- ── Extend mi_music_submissions status for partner revision workflow ──
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'mi_music_submissions'
  ) THEN
    ALTER TABLE mi_music_submissions DROP CONSTRAINT IF EXISTS mi_music_submissions_status_check;
    ALTER TABLE mi_music_submissions ADD CONSTRAINT mi_music_submissions_status_check
      CHECK (status IN ('draft','pending_review','approved','rejected','revision_requested'));
  END IF;
END $$;

-- ── Triggers ──
DROP TRIGGER IF EXISTS trg_mi_partner_profiles_updated_at ON mi_partner_profiles;
CREATE TRIGGER trg_mi_partner_profiles_updated_at
  BEFORE UPDATE ON mi_partner_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
