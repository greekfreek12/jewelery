-- Jobs and Customer Leads tables for built-in scheduling
-- Enables review automation for contractors without external job management tools

-- ============================================
-- Jobs table
-- ============================================
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  customer_lead_id UUID, -- Reference added after customer_leads table created

  -- Job details
  service_type TEXT,
  notes TEXT,

  -- Scheduling
  scheduled_date DATE NOT NULL,
  time_type TEXT DEFAULT 'window' CHECK (time_type IN ('window', 'timeofday', 'exact')),
  window_start TIME, -- for 'window' or 'exact'
  window_end TIME,   -- for 'window'
  time_of_day TEXT CHECK (time_of_day IN ('morning', 'afternoon', 'allday')),
  estimated_duration TEXT CHECK (estimated_duration IN ('30min', '1hr', '2hr', '3hr', '4hr', 'half_day', 'full_day')),

  -- Address (optional override from contact)
  address_override TEXT,

  -- Status
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'en_route', 'in_progress', 'completed', 'cancelled')),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  en_route_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,

  -- Review tracking
  review_request_id UUID REFERENCES review_requests(id),
  review_requested_at TIMESTAMPTZ
);

-- ============================================
-- Customer Leads table
-- (distinct from leads_raw which is for sales leads)
-- ============================================
CREATE TABLE IF NOT EXISTS customer_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,

  -- Contact info
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,

  -- Lead details
  service_type TEXT,
  source TEXT CHECK (source IN ('chat', 'form', 'manual', 'referral', 'phone', 'other')),
  notes TEXT,

  -- Status
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'booked', 'lost')),

  -- Conversion tracking
  converted_to_contact_id UUID REFERENCES contacts(id),
  converted_to_job_id UUID REFERENCES jobs(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  contacted_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ
);

-- Add foreign key from jobs to customer_leads
ALTER TABLE jobs
ADD CONSTRAINT jobs_customer_lead_id_fkey
FOREIGN KEY (customer_lead_id) REFERENCES customer_leads(id) ON DELETE SET NULL;

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX idx_jobs_contractor_date ON jobs(contractor_id, scheduled_date);
CREATE INDEX idx_jobs_contractor_status ON jobs(contractor_id, status);
CREATE INDEX idx_jobs_contact ON jobs(contact_id);
CREATE INDEX idx_jobs_scheduled_date ON jobs(scheduled_date);

CREATE INDEX idx_customer_leads_contractor_status ON customer_leads(contractor_id, status);
CREATE INDEX idx_customer_leads_contractor_created ON customer_leads(contractor_id, created_at DESC);
CREATE INDEX idx_customer_leads_phone ON customer_leads(phone);

-- ============================================
-- Contractor settings additions
-- ============================================
ALTER TABLE contractors
ADD COLUMN IF NOT EXISTS job_management_type TEXT DEFAULT 'builtin'
CHECK (job_management_type IN ('jobber', 'housecallpro', 'servicetitan', 'quickbooks', 'other_zapier', 'builtin'));

ALTER TABLE contractors
ADD COLUMN IF NOT EXISTS job_settings JSONB DEFAULT '{
  "notifications": {
    "send_confirmation": true,
    "send_day_before_reminder": true,
    "send_en_route": true,
    "send_cancellation": false
  },
  "review_delay_hours": 2
}'::jsonb;

-- ============================================
-- Row Level Security
-- ============================================
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_leads ENABLE ROW LEVEL SECURITY;

-- Jobs RLS: contractors can only see their own jobs
CREATE POLICY "Contractors can view own jobs" ON jobs
  FOR SELECT USING (contractor_id = auth.uid());

CREATE POLICY "Contractors can insert own jobs" ON jobs
  FOR INSERT WITH CHECK (contractor_id = auth.uid());

CREATE POLICY "Contractors can update own jobs" ON jobs
  FOR UPDATE USING (contractor_id = auth.uid());

CREATE POLICY "Contractors can delete own jobs" ON jobs
  FOR DELETE USING (contractor_id = auth.uid());

-- Customer Leads RLS: contractors can only see their own leads
CREATE POLICY "Contractors can view own customer_leads" ON customer_leads
  FOR SELECT USING (contractor_id = auth.uid());

CREATE POLICY "Contractors can insert own customer_leads" ON customer_leads
  FOR INSERT WITH CHECK (contractor_id = auth.uid());

CREATE POLICY "Contractors can update own customer_leads" ON customer_leads
  FOR UPDATE USING (contractor_id = auth.uid());

CREATE POLICY "Contractors can delete own customer_leads" ON customer_leads
  FOR DELETE USING (contractor_id = auth.uid());

-- Admin policies (bypass RLS handled by service client, but adding for completeness)
CREATE POLICY "Admin full access to jobs" ON jobs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM contractors
      WHERE contractors.id = auth.uid()
      AND contractors.is_admin = true
    )
  );

CREATE POLICY "Admin full access to customer_leads" ON customer_leads
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM contractors
      WHERE contractors.id = auth.uid()
      AND contractors.is_admin = true
    )
  );

-- ============================================
-- Updated_at trigger function (if not exists)
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customer_leads_updated_at ON customer_leads;
CREATE TRIGGER update_customer_leads_updated_at
  BEFORE UPDATE ON customer_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Enable realtime for jobs (optional)
-- ============================================
-- ALTER PUBLICATION supabase_realtime ADD TABLE jobs;
