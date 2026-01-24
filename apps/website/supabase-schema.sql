-- AMD Solutions 007 Database Schema
-- Execute this in Supabase SQL Editor

-- =====================================================
-- TABLE: clients (Client Portal Inquiries)
-- =====================================================
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Contact Information
  email TEXT NOT NULL,
  contact_name TEXT,
  company_name TEXT,
  phone TEXT,
  
  -- Project Details
  project_type TEXT, -- 'ai-automation', 'web-app', 'mobile-app', 'enterprise-software', 'consulting'
  budget TEXT, -- '5k-10k', '10k-25k', '25k-50k', '50k+'
  timeline TEXT, -- 'urgent', '1-month', '3-months', '6-months'
  message TEXT,
  
  -- CRM Status
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'proposal_sent', 'won', 'lost')),
  assigned_to TEXT, -- Agent/engineer name
  
  -- Analytics
  user_ip TEXT,
  user_agent TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at DESC);

-- RLS (Row Level Security)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (public form submissions)
CREATE POLICY "Anyone can submit inquiries" ON clients
  FOR INSERT WITH CHECK (true);

-- Only authenticated admins can read
CREATE POLICY "Only admins can view clients" ON clients
  FOR SELECT USING (auth.role() = 'authenticated');

-- =====================================================
-- TABLE: chat_logs (ChatWidget History)
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Session Tracking
  session_id TEXT NOT NULL,
  
  -- Messages
  user_message TEXT NOT NULL,
  bot_response TEXT NOT NULL,
  
  -- Context
  user_ip TEXT,
  user_agent TEXT,
  page_url TEXT
);

-- Index for session retrieval
CREATE INDEX IF NOT EXISTS idx_chat_logs_session_id ON chat_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_logs_created_at ON chat_logs(created_at DESC);

-- RLS
ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log chats" ON chat_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admins can view chat logs" ON chat_logs
  FOR SELECT USING (auth.role() = 'authenticated');

-- =====================================================
-- TABLE: automation_runs (Social Engine Activity)
-- =====================================================
CREATE TABLE IF NOT EXISTS automation_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Platform
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'telegram', 'youtube', 'snapchat', 'linkedin', 'whatsapp')),
  
  -- Content
  post_type TEXT, -- 'cv-analysis', 'source-code', 'ai-product', etc.
  post_content TEXT NOT NULL,
  media_url TEXT,
  
  -- Status
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'posted', 'failed')),
  error_message TEXT,
  
  -- Engagement (to be updated later)
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_automation_runs_platform ON automation_runs(platform);
CREATE INDEX IF NOT EXISTS idx_automation_runs_status ON automation_runs(status);
CREATE INDEX IF NOT EXISTS idx_automation_runs_created_at ON automation_runs(created_at DESC);

-- RLS
ALTER TABLE automation_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage automation runs" ON automation_runs
  USING (auth.role() = 'service_role');

-- =====================================================
-- TABLE: portal_access (Client Portal Authentication)
-- =====================================================
CREATE TABLE IF NOT EXISTS portal_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Access Credentials
  access_id TEXT UNIQUE NOT NULL, -- e.g., 'AMD-007-VIP', 'CLIENT-12345'
  pin_code TEXT, -- Optional password/PIN
  
  -- Client Details
  client_name TEXT,
  client_email TEXT,
  client_company TEXT,
  
  -- Permissions
  dashboard_access BOOLEAN DEFAULT true,
  analytics_access BOOLEAN DEFAULT false,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ
);

-- Index
CREATE INDEX IF NOT EXISTS idx_portal_access_access_id ON portal_access(access_id);

-- RLS
ALTER TABLE portal_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can check access_id" ON portal_access
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage portal access" ON portal_access
  FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- DEFAULT DATA
-- =====================================================

-- Insert default VIP access (if not exists)
INSERT INTO portal_access (access_id, client_name, client_email, dashboard_access, analytics_access, is_active)
VALUES ('AMD-007-VIP', 'AMD Solutions CEO', 'ceo@amdsolutions007.com', true, true, true)
ON CONFLICT (access_id) DO NOTHING;

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS (for analytics)
-- =====================================================

-- Daily automation stats
CREATE OR REPLACE VIEW daily_automation_stats AS
SELECT
  DATE(created_at) AS date,
  platform,
  COUNT(*) AS total_posts,
  SUM(CASE WHEN status = 'posted' THEN 1 ELSE 0 END) AS successful_posts,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) AS failed_posts
FROM automation_runs
GROUP BY DATE(created_at), platform
ORDER BY date DESC, platform;

-- Client conversion funnel
CREATE OR REPLACE VIEW client_funnel AS
SELECT
  status,
  COUNT(*) AS count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) AS percentage
FROM clients
GROUP BY status
ORDER BY
  CASE status
    WHEN 'new' THEN 1
    WHEN 'contacted' THEN 2
    WHEN 'proposal_sent' THEN 3
    WHEN 'won' THEN 4
    WHEN 'lost' THEN 5
  END;
