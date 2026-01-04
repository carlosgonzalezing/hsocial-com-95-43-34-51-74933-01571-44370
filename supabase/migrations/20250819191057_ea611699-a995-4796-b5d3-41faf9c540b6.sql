-- Fix infinite recursion in RLS policies

-- First, drop all conflicting policies on posts table
DROP POLICY IF EXISTS "Los usuarios autenticados pueden crear posts" ON public.posts;
DROP POLICY IF EXISTS "Los usuarios pueden eliminar sus propios posts" ON public.posts;
DROP POLICY IF EXISTS "Los usuarios pueden ver posts públicos y los suyos" ON public.posts;

-- Create clean, consistent policies for posts
CREATE POLICY "Users can create their own posts" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" ON public.posts 
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view public posts and their own" ON public.posts
  FOR SELECT USING (
    visibility = 'public'::post_visibility 
    OR user_id = auth.uid() 
    OR (group_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM group_members gm 
      WHERE gm.group_id = posts.group_id 
      AND gm.user_id = auth.uid()
    ))
  );

-- Drop conflicting group_members policies that cause recursion
DROP POLICY IF EXISTS "Creators manage all group members" ON public.group_members;
DROP POLICY IF EXISTS "Join public groups policy" ON public.group_members;
DROP POLICY IF EXISTS "Leave groups policy" ON public.group_members;
DROP POLICY IF EXISTS "Members can view group members" ON public.group_members;
DROP POLICY IF EXISTS "Users can join public groups" ON public.group_members;
DROP POLICY IF EXISTS "Users can leave groups" ON public.group_members;

-- Create simple, non-recursive policies for group_members
CREATE POLICY "Users can view group members" ON public.group_members
  FOR SELECT USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM groups g 
      WHERE g.id = group_members.group_id 
      AND (NOT g.is_private OR g.created_by = auth.uid())
    )
  );

CREATE POLICY "Users can join groups" ON public.group_members
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    AND EXISTS (
      SELECT 1 FROM groups g 
      WHERE g.id = group_members.group_id 
      AND NOT g.is_private
    )
  );

CREATE POLICY "Users can leave groups" ON public.group_members
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Group creators can manage members" ON public.group_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM groups g 
      WHERE g.id = group_members.group_id 
      AND g.created_by = auth.uid()
    )
  );