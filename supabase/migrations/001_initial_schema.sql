-- Contractor Growth Platform - Initial Schema
-- Run this migration in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'past_due', 'canceled', 'incomplete');
CREATE TYPE conversation_status AS ENUM ('open', 'closed', 'snoozed');
CREATE TYPE message_direction AS ENUM ('inbound', 'outbound');
CREATE TYPE message_channel AS ENUM ('sms', 'call', 'voicemail');
CREATE TYPE message_status AS ENUM ('queued', 'sent', 'delivered', 'failed', 'received');
CREATE TYPE review_request_status AS ENUM ('sent', 'reminded_1', 'reminded_2', 'replied', 'clicked', 'reviewed', 'negative', 'stopped');
CREATE TYPE review_campaign_status AS ENUM ('draft', 'sending', 'completed', 'paused');
CREATE TYPE contact_source AS ENUM ('sms', 'call', 'form', 'import', 'manual');

-- Default templates for new contractors
CREATE OR REPLACE FUNCTION default_templates() RETURNS jsonb AS $$
BEGIN
  RETURN '{
    "missed_call": {
      "enabled": true,
      "message": "Sorry we missed your call! We''ll get back to you shortly. - {{business_name}}"
    },
    "review_request": {
      "message": "Hey {{contact_name}}, thanks for choosing {{business_name}}! How''d we do? Reply 1-5"
    },
    "review_positive": {
      "message": "Awesome, thank you! Would you mind leaving us a quick Google review? {{review_link}}"
    },
    "review_negative": {
      "message": "We''re sorry to hear that. Someone will reach out to make it right."
    },
    "review_reminder_1": {
      "delay_days": 3,
      "message": "Hey {{contact_name}}, just checking in! We''d love to hear how your experience was with {{business_name}}. Reply 1-5 when you get a chance."
    },
    "review_reminder_2": {
      "delay_days": 7,
      "message": "Hi {{contact_name}}, last reminder - would you take 30 seconds to rate your experience with {{business_name}}? Reply 1-5. Thanks!"
    },
    "review_blast": {
      "message": "Hey {{contact_name}}, hope all is well! We''re collecting feedback from customers - would you mind rating your experience with {{business_name}}? Reply 1-5"
    }
  }'::jsonb;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Contractors table (your customers)
CREATE TABLE contractors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Auth (linked to Supabase auth.users)
  email TEXT UNIQUE NOT NULL,

  -- Business info
  business_name TEXT NOT NULL,
  logo_url TEXT,
  timezone TEXT DEFAULT 'America/New_York' NOT NULL,

  -- TextGrid phone
  phone_number TEXT,
  phone_sid TEXT,
  forwarding_number TEXT,

  -- Review settings
  google_review_link TEXT,

  -- Business hours
  business_hours_start TIME,
  business_hours_end TIME,

  -- Stripe billing
  stripe_customer_id TEXT,
  subscription_status subscription_status DEFAULT 'trialing' NOT NULL,
  subscription_id TEXT,

  -- Feature toggles
  feature_missed_call_text BOOLEAN DEFAULT TRUE NOT NULL,
  feature_review_automation BOOLEAN DEFAULT TRUE NOT NULL,
  feature_review_drip BOOLEAN DEFAULT TRUE NOT NULL,
  feature_ai_responses BOOLEAN DEFAULT FALSE NOT NULL,
  feature_campaigns BOOLEAN DEFAULT FALSE NOT NULL,

  -- Templates (customizable messages)
  templates JSONB DEFAULT default_templates() NOT NULL,

  -- Notification preferences
  notification_push BOOLEAN DEFAULT TRUE NOT NULL,
  notification_email BOOLEAN DEFAULT TRUE NOT NULL,

  -- Admin flag (for your admin users)
  is_admin BOOLEAN DEFAULT FALSE NOT NULL
);

-- Contacts table (contractor's customers)
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,

  source contact_source DEFAULT 'manual' NOT NULL,
  tags TEXT[] DEFAULT '{}' NOT NULL,
  notes TEXT,

  last_contacted_at TIMESTAMPTZ,
  opted_out BOOLEAN DEFAULT FALSE NOT NULL,
  has_left_review BOOLEAN DEFAULT FALSE NOT NULL,

  -- Unique phone per contractor
  UNIQUE(contractor_id, phone)
);

-- Conversations table (one per contact)
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  status conversation_status DEFAULT 'open' NOT NULL,
  unread_count INTEGER DEFAULT 0 NOT NULL,
  last_message_at TIMESTAMPTZ,
  last_message_preview TEXT,

  -- One conversation per contact
  UNIQUE(contact_id)
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  direction message_direction NOT NULL,
  channel message_channel DEFAULT 'sms' NOT NULL,
  body TEXT NOT NULL,
  media_urls TEXT[] DEFAULT '{}' NOT NULL,

  status message_status DEFAULT 'queued' NOT NULL,
  textgrid_sid TEXT,

  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ
);

-- Review campaigns (for blasts) - must be created before review_requests
CREATE TABLE review_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  name TEXT NOT NULL,
  status review_campaign_status DEFAULT 'draft' NOT NULL,

  -- Filter criteria for selecting contacts
  contact_filter JSONB DEFAULT '{}' NOT NULL,

  -- Stats
  total_contacts INTEGER DEFAULT 0 NOT NULL,
  sent_count INTEGER DEFAULT 0 NOT NULL,
  reply_count INTEGER DEFAULT 0 NOT NULL,
  review_count INTEGER DEFAULT 0 NOT NULL,

  -- Rate limiting
  rate_limit_per_hour INTEGER DEFAULT 20 NOT NULL,

  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Review requests (individual)
CREATE TABLE review_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES review_campaigns(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  status review_request_status DEFAULT 'sent' NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),

  -- Drip sequence tracking
  drip_step INTEGER DEFAULT 0 NOT NULL,
  next_drip_at TIMESTAMPTZ,

  -- Timestamps
  sent_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  replied_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ
);

-- Analytics events (for tracking everything)
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  event_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}' NOT NULL
);

-- Add the foreign key for review_requests.campaign_id after review_campaigns exists
-- (Already handled above since we define review_campaigns before the FK reference)

-- Indexes for performance
CREATE INDEX idx_contractors_email ON contractors(email);
CREATE INDEX idx_contractors_stripe_customer ON contractors(stripe_customer_id);
CREATE INDEX idx_contractors_subscription ON contractors(subscription_status);

CREATE INDEX idx_contacts_contractor ON contacts(contractor_id);
CREATE INDEX idx_contacts_phone ON contacts(phone);
CREATE INDEX idx_contacts_tags ON contacts USING GIN(tags);

CREATE INDEX idx_conversations_contractor ON conversations(contractor_id);
CREATE INDEX idx_conversations_contact ON conversations(contact_id);
CREATE INDEX idx_conversations_last_message ON conversations(contractor_id, last_message_at DESC);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_contractor ON messages(contractor_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
CREATE INDEX idx_messages_textgrid ON messages(textgrid_sid);

CREATE INDEX idx_review_requests_contractor ON review_requests(contractor_id);
CREATE INDEX idx_review_requests_contact ON review_requests(contact_id);
CREATE INDEX idx_review_requests_campaign ON review_requests(campaign_id);
CREATE INDEX idx_review_requests_next_drip ON review_requests(next_drip_at) WHERE next_drip_at IS NOT NULL;

CREATE INDEX idx_review_campaigns_contractor ON review_campaigns(contractor_id);
CREATE INDEX idx_review_campaigns_status ON review_campaigns(status);

CREATE INDEX idx_analytics_contractor ON analytics_events(contractor_id);
CREATE INDEX idx_analytics_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_created ON analytics_events(created_at DESC);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_contractors_updated_at
  BEFORE UPDATE ON contractors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_review_requests_updated_at
  BEFORE UPDATE ON review_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_review_campaigns_updated_at
  BEFORE UPDATE ON review_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Contractors: users can only see their own data (linked by auth.uid() = id for now)
-- We'll link the contractor ID to the auth user's ID
CREATE POLICY "Contractors can view own data" ON contractors
  FOR SELECT USING (auth.uid() = id OR is_admin = TRUE);

CREATE POLICY "Contractors can update own data" ON contractors
  FOR UPDATE USING (auth.uid() = id);

-- Contacts: contractors can only see their own contacts
CREATE POLICY "Contractors can view own contacts" ON contacts
  FOR SELECT USING (contractor_id = auth.uid());

CREATE POLICY "Contractors can insert own contacts" ON contacts
  FOR INSERT WITH CHECK (contractor_id = auth.uid());

CREATE POLICY "Contractors can update own contacts" ON contacts
  FOR UPDATE USING (contractor_id = auth.uid());

CREATE POLICY "Contractors can delete own contacts" ON contacts
  FOR DELETE USING (contractor_id = auth.uid());

-- Conversations: contractors can only see their own
CREATE POLICY "Contractors can view own conversations" ON conversations
  FOR SELECT USING (contractor_id = auth.uid());

CREATE POLICY "Contractors can insert own conversations" ON conversations
  FOR INSERT WITH CHECK (contractor_id = auth.uid());

CREATE POLICY "Contractors can update own conversations" ON conversations
  FOR UPDATE USING (contractor_id = auth.uid());

-- Messages: contractors can only see their own
CREATE POLICY "Contractors can view own messages" ON messages
  FOR SELECT USING (contractor_id = auth.uid());

CREATE POLICY "Contractors can insert own messages" ON messages
  FOR INSERT WITH CHECK (contractor_id = auth.uid());

CREATE POLICY "Contractors can update own messages" ON messages
  FOR UPDATE USING (contractor_id = auth.uid());

-- Review requests: contractors can only see their own
CREATE POLICY "Contractors can view own review requests" ON review_requests
  FOR SELECT USING (contractor_id = auth.uid());

CREATE POLICY "Contractors can insert own review requests" ON review_requests
  FOR INSERT WITH CHECK (contractor_id = auth.uid());

CREATE POLICY "Contractors can update own review requests" ON review_requests
  FOR UPDATE USING (contractor_id = auth.uid());

-- Review campaigns: contractors can only see their own
CREATE POLICY "Contractors can view own campaigns" ON review_campaigns
  FOR SELECT USING (contractor_id = auth.uid());

CREATE POLICY "Contractors can insert own campaigns" ON review_campaigns
  FOR INSERT WITH CHECK (contractor_id = auth.uid());

CREATE POLICY "Contractors can update own campaigns" ON review_campaigns
  FOR UPDATE USING (contractor_id = auth.uid());

CREATE POLICY "Contractors can delete own campaigns" ON review_campaigns
  FOR DELETE USING (contractor_id = auth.uid());

-- Analytics: contractors can only see their own
CREATE POLICY "Contractors can view own analytics" ON analytics_events
  FOR SELECT USING (contractor_id = auth.uid());

CREATE POLICY "Contractors can insert own analytics" ON analytics_events
  FOR INSERT WITH CHECK (contractor_id = auth.uid());

-- Function to create a contractor profile after signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.contractors (id, email, business_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'business_name', 'My Business')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create contractor on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to get or create a conversation for a contact
CREATE OR REPLACE FUNCTION get_or_create_conversation(
  p_contractor_id UUID,
  p_contact_id UUID
) RETURNS UUID AS $$
DECLARE
  v_conversation_id UUID;
BEGIN
  -- Try to get existing conversation
  SELECT id INTO v_conversation_id
  FROM conversations
  WHERE contact_id = p_contact_id;

  -- If not found, create one
  IF v_conversation_id IS NULL THEN
    INSERT INTO conversations (contractor_id, contact_id)
    VALUES (p_contractor_id, p_contact_id)
    RETURNING id INTO v_conversation_id;
  END IF;

  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update conversation after new message
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET
    last_message_at = NEW.created_at,
    last_message_preview = LEFT(NEW.body, 100),
    unread_count = CASE
      WHEN NEW.direction = 'inbound' THEN unread_count + 1
      ELSE unread_count
    END,
    status = CASE
      WHEN NEW.direction = 'inbound' THEN 'open'
      ELSE status
    END
  WHERE id = NEW.conversation_id;

  -- Update contact's last_contacted_at
  UPDATE contacts
  SET last_contacted_at = NEW.created_at
  WHERE id = NEW.contact_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_message_created
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_on_message();

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
