-- Sites table for generated contractor websites (hybrid approach)
CREATE TABLE IF NOT EXISTS sites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Link to lead
  lead_id UUID,

  -- Site identifiers
  slug TEXT UNIQUE NOT NULL,
  custom_domain TEXT UNIQUE,

  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),

  -- Queryable business info (for admin/search)
  business_name TEXT NOT NULL,
  phone TEXT,
  city TEXT,
  state TEXT,
  place_id TEXT,
  rating DECIMAL(2,1),
  review_count INTEGER,

  -- The flexible config (sections, styling, all content)
  config JSONB NOT NULL DEFAULT '{
    "global": {
      "primary_color": "#1a1a1a",
      "accent_color": "#d97706",
      "font_heading": "Bebas Neue",
      "font_body": "Source Sans 3"
    },
    "sections": []
  }'::jsonb,

  -- SEO
  meta_title TEXT,
  meta_description TEXT
);

-- Indexes
CREATE INDEX idx_sites_slug ON sites(slug);
CREATE INDEX idx_sites_status ON sites(status);
CREATE INDEX idx_sites_lead_id ON sites(lead_id);
CREATE INDEX idx_sites_city ON sites(city);
CREATE INDEX idx_sites_state ON sites(state);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_sites_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sites_updated_at
  BEFORE UPDATE ON sites
  FOR EACH ROW
  EXECUTE FUNCTION update_sites_updated_at();
