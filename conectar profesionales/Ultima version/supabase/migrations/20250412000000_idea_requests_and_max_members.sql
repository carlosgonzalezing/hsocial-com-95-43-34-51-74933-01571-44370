-- Migration: Add max_members to posts table and create idea_requests table
-- Description: This migration adds support for join requests for Idea posts

-- 1. Add max_members column to posts table
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS max_members INTEGER;

COMMENT ON COLUMN posts.max_members IS 'Maximum number of members allowed for Idea posts. NULL means unlimited.';

-- 2. Create idea_requests table
CREATE TABLE IF NOT EXISTS idea_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'PENDIENTE' CHECK (status IN ('PENDIENTE', 'ACEPTADO', 'RECHAZADO')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(idea_id, requester_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_idea_requests_idea_id ON idea_requests(idea_id);
CREATE INDEX IF NOT EXISTS idx_idea_requests_requester_id ON idea_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_idea_requests_status ON idea_requests(status);

-- Add RLS (Row Level Security) policies
ALTER TABLE idea_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own requests
CREATE POLICY "Users can view their own idea requests"
ON idea_requests FOR SELECT
USING (auth.uid() = requester_id);

-- Policy: Users can view requests for their own ideas
CREATE POLICY "Idea creators can view all requests for their ideas"
ON idea_requests FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM posts
    WHERE posts.id = idea_requests.idea_id
    AND posts.user_id = auth.uid()
  )
);

-- Policy: Authenticated users can create requests
CREATE POLICY "Authenticated users can create idea requests"
ON idea_requests FOR INSERT
WITH CHECK (auth.uid() = requester_id);

-- Policy: Idea creators can update request status
CREATE POLICY "Idea creators can update request status"
ON idea_requests FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM posts
    WHERE posts.id = idea_requests.idea_id
    AND posts.user_id = auth.uid()
  )
);

-- Policy: Users can delete their own pending requests
CREATE POLICY "Users can delete their own pending requests"
ON idea_requests FOR DELETE
USING (auth.uid() = requester_id AND status = 'PENDIENTE');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_idea_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_idea_requests_updated_at
BEFORE UPDATE ON idea_requests
FOR EACH ROW
EXECUTE FUNCTION update_idea_requests_updated_at();

-- Add comment to table
COMMENT ON TABLE idea_requests IS 'Stores join requests for Idea type posts';
