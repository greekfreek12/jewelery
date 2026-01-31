-- Add social links and working hours to sites table
ALTER TABLE sites ADD COLUMN IF NOT EXISTS facebook_url TEXT;
ALTER TABLE sites ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE sites ADD COLUMN IF NOT EXISTS working_hours TEXT;
ALTER TABLE sites ADD COLUMN IF NOT EXISTS is_24_7 BOOLEAN DEFAULT false;

-- Create indexes for filtering
CREATE INDEX IF NOT EXISTS idx_sites_is_24_7 ON sites(is_24_7);
