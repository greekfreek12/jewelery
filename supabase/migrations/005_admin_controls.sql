-- Admin control fields for contractors
-- Add suspension fields
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS suspended_reason TEXT;

-- Feature lock flags (admin controls access)
-- When locked, contractor cannot enable the feature themselves
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS feature_ai_responses_locked BOOLEAN DEFAULT true;
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS feature_campaigns_locked BOOLEAN DEFAULT true;

-- Add index for quickly finding suspended accounts
CREATE INDEX IF NOT EXISTS idx_contractors_suspended ON contractors(suspended_at) WHERE suspended_at IS NOT NULL;

-- Update RLS policy to allow admins to see all contractors
-- First drop the existing select policy
DROP POLICY IF EXISTS "Contractors can view own data" ON contractors;

-- Create new policy that allows viewing own data or all data if admin
-- Note: We check is_admin on the CURRENT user, not the row
CREATE POLICY "Contractors can view own data or admin can view all" ON contractors
  FOR SELECT USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM contractors c
      WHERE c.id = auth.uid() AND c.is_admin = TRUE
    )
  );

-- Also need a policy for admin updates
DROP POLICY IF EXISTS "Contractors can update own data" ON contractors;

CREATE POLICY "Contractors can update own data or admin can update all" ON contractors
  FOR UPDATE USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM contractors c
      WHERE c.id = auth.uid() AND c.is_admin = TRUE
    )
  );

-- Admin delete policy
CREATE POLICY "Admins can delete contractors" ON contractors
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM contractors c
      WHERE c.id = auth.uid() AND c.is_admin = TRUE
    )
    AND auth.uid() != id  -- Can't delete yourself
  );
