-- Update reaction types to support new reactions
-- First, let's see what reaction types are currently allowed in the database

-- Add the new reaction types to the database
-- We need to modify the existing constraint or enum if it exists

-- For now, let's assume the reaction_type is a text field that we can expand
-- Update any check constraints that might exist for reaction types

-- Add a comment to document the allowed reaction types
COMMENT ON COLUMN reactions.reaction_type IS 'Allowed values: like, love, funny, wow, angry, poop, join';
COMMENT ON COLUMN story_reactions.reaction_type IS 'Allowed values: like, love, funny, wow, angry, poop, join';

-- Update the likes table as well if it exists
COMMENT ON COLUMN likes.reaction_type IS 'Allowed values: like, love, funny, wow, angry, poop, join';

-- Create an index for better performance on reaction queries
CREATE INDEX IF NOT EXISTS idx_reactions_type ON reactions(reaction_type);
CREATE INDEX IF NOT EXISTS idx_story_reactions_type ON story_reactions(reaction_type);

-- For the special "join" reaction functionality, we might want to track project interests
-- This table could be used to show who "joined" a project/idea
CREATE TABLE IF NOT EXISTS project_joins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Prevent duplicate joins
  UNIQUE(post_id, user_id)
);

-- Enable RLS
ALTER TABLE project_joins ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_joins
CREATE POLICY "Anyone can view project joins" ON project_joins FOR SELECT USING (true);
CREATE POLICY "Users can join projects" ON project_joins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave projects" ON project_joins FOR DELETE USING (auth.uid() = user_id);