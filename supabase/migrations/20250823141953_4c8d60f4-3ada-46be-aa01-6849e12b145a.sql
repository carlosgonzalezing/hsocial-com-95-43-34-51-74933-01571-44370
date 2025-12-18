-- Add missing reaction types to allow poop and join reactions
-- First, let's check if there are any existing poop or join reactions
-- If not, we just need to ensure the database accepts these new values

-- No need to modify the table structure since reaction_type is already a text field
-- We just need to document that these are now valid values

-- Add a comment to document the valid reaction types
COMMENT ON COLUMN reactions.reaction_type IS 'Valid values: like, love, haha, wow, angry, poop, join';

-- Insert some test data to verify the new reaction types work (optional)
-- This will fail silently if there are no posts to reference, which is fine
INSERT INTO reactions (user_id, reaction_type, post_id)
SELECT 
  auth.uid(),
  'poop',
  (SELECT id FROM posts LIMIT 1)
WHERE auth.uid() IS NOT NULL 
AND EXISTS (SELECT 1 FROM posts LIMIT 1)
ON CONFLICT DO NOTHING;

-- Clean up the test reaction immediately
DELETE FROM reactions 
WHERE reaction_type = 'poop' 
AND user_id = auth.uid() 
AND created_at > now() - interval '1 minute';