-- Clean up existing RLS policies more carefully

-- Drop existing policies that might conflict (use CASCADE if needed)
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts CASCADE;
DROP POLICY IF EXISTS "Group members can create posts in their groups" ON public.posts CASCADE;
DROP POLICY IF EXISTS "Group posts are viewable by group members" ON public.posts CASCADE;

-- Drop all group_members policies that cause infinite recursion
DROP POLICY IF EXISTS "Creators manage all group members" ON public.group_members CASCADE;
DROP POLICY IF EXISTS "Join public groups policy" ON public.group_members CASCADE;
DROP POLICY IF EXISTS "Leave groups policy" ON public.group_members CASCADE;
DROP POLICY IF EXISTS "Members can view group members" ON public.group_members CASCADE;
DROP POLICY IF EXISTS "Users can join public groups" ON public.group_members CASCADE;
DROP POLICY IF EXISTS "Users can leave groups" ON public.group_members CASCADE;

-- Now create the new clean policies
CREATE POLICY "Users can create posts" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own posts" ON public.posts 
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "View public and own posts" ON public.posts
  FOR SELECT USING (
    visibility = 'public'::post_visibility 
    OR user_id = auth.uid()
  );

-- Simple group_members policies without recursion
CREATE POLICY "View group members" ON public.group_members
  FOR SELECT USING (true);

CREATE POLICY "Join groups" ON public.group_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Leave groups" ON public.group_members
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Manage group members" ON public.group_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM groups g 
      WHERE g.id = group_members.group_id 
      AND g.created_by = auth.uid()
    )
  );