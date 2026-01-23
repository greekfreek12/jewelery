-- Atomic increment for unread message count
-- Prevents race conditions when multiple messages arrive simultaneously

CREATE OR REPLACE FUNCTION increment_unread_count(
  p_conversation_id UUID,
  p_increment INTEGER DEFAULT 1
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE conversations
  SET unread_count = unread_count + p_increment,
      updated_at = NOW()
  WHERE id = p_conversation_id
  RETURNING unread_count INTO new_count;

  RETURN COALESCE(new_count, 0);
END;
$$;

-- Grant execute permission to authenticated users and service role
GRANT EXECUTE ON FUNCTION increment_unread_count(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_unread_count(UUID, INTEGER) TO service_role;

COMMENT ON FUNCTION increment_unread_count IS
  'Atomically increment the unread count for a conversation. Returns the new count.';
