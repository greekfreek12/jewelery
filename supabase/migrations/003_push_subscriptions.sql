-- Push notification subscriptions for PWA
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(contractor_id, endpoint)
);

-- Index for looking up subscriptions by contractor
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_contractor ON push_subscriptions(contractor_id);

-- Enable RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: contractors can only manage their own subscriptions
CREATE POLICY "Contractors manage own push subscriptions"
ON push_subscriptions FOR ALL
USING (contractor_id = auth.uid())
WITH CHECK (contractor_id = auth.uid());
