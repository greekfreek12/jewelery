-- Enable Realtime for messages and conversations tables
-- This allows the inbox to receive live updates

-- Enable realtime on messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Enable realtime on conversations table
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- Enable realtime on contacts table (for updates)
ALTER PUBLICATION supabase_realtime ADD TABLE contacts;
