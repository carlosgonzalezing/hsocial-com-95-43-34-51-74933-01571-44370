-- Fix followers table RLS policies to prevent 406 errors
-- The current policies might be too restrictive or missing

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view followers" ON public.followers;
DROP POLICY IF EXISTS "Users can follow others" ON public.followers;
DROP POLICY IF EXISTS "Users can unfollow others" ON public.followers;

-- Create more permissive policies for followers table
CREATE POLICY "Users can view all followers" ON public.followers
FOR SELECT USING (true);

CREATE POLICY "Users can follow others" ON public.followers
FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow others" ON public.followers
FOR DELETE USING (auth.uid() = follower_id);

-- Ensure the table has proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_followers_follower_id ON public.followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_followers_following_id ON public.followers(following_id);
CREATE INDEX IF NOT EXISTS idx_followers_pair ON public.followers(follower_id, following_id);