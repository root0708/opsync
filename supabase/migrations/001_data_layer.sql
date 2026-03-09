-- OPSYNC Data Layer: lists, leads, dnc_registry
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)

-- Lists: each CSV upload becomes a list
CREATE TABLE IF NOT EXISTS lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('uploading', 'processing', 'list_ready', 'error')),
  total_count INT DEFAULT 0,
  ready_count INT DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Leads: individual records from a list
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  row_index INT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  owner_name TEXT,
  phone TEXT,
  email TEXT,
  raw_data JSONB,
  status TEXT NOT NULL DEFAULT 'raw' CHECK (status IN ('raw', 'dnc_checked', 'duplicate', 'list_ready', 'dnc')),
  dnc_status TEXT,
  is_duplicate BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(list_id, row_index)
);

-- DNC registry: numbers to exclude (internal list; external API can be added later)
CREATE TABLE IF NOT EXISTS dnc_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, phone)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lists_user_id ON lists(user_id);
CREATE INDEX IF NOT EXISTS idx_lists_status ON lists(status);
CREATE INDEX IF NOT EXISTS idx_leads_list_id ON leads(list_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_dnc_registry_user_phone ON dnc_registry(user_id, phone);

-- RLS
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE dnc_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own lists" ON lists
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage leads in own lists" ON leads
  FOR ALL USING (
    EXISTS (SELECT 1 FROM lists WHERE lists.id = leads.list_id AND lists.user_id = auth.uid())
  );

CREATE POLICY "Users can manage own dnc registry" ON dnc_registry
  FOR ALL USING (auth.uid() = user_id);
