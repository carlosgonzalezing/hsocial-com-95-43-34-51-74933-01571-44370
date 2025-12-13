-- Create project_views table for tracking project views
CREATE TABLE IF NOT EXISTS public.project_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, viewer_id)
);

-- Enable RLS
ALTER TABLE public.project_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert a view
CREATE POLICY "Anyone can record project views"
  ON public.project_views
  FOR INSERT
  WITH CHECK (true);

-- Anyone can view project views
CREATE POLICY "Anyone can view project views"
  ON public.project_views
  FOR SELECT
  USING (true);

-- Create index for better performance
CREATE INDEX idx_project_views_post_id ON public.project_views(post_id);
CREATE INDEX idx_project_views_viewer_id ON public.project_views(viewer_id);

-- Function to get project views count
CREATE OR REPLACE FUNCTION get_project_views_count(p_post_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(DISTINCT viewer_id)::INTEGER
  FROM public.project_views
  WHERE post_id = p_post_id;
$$;

-- Function to get project viewers list
CREATE OR REPLACE FUNCTION get_project_viewers(p_post_id UUID, p_limit INTEGER DEFAULT 10)
RETURNS TABLE(
  viewer_id UUID,
  username TEXT,
  avatar_url TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    pv.viewer_id,
    pr.username,
    pr.avatar_url,
    pv.viewed_at
  FROM public.project_views pv
  LEFT JOIN public.profiles pr ON pv.viewer_id = pr.id
  WHERE pv.post_id = p_post_id
  ORDER BY pv.viewed_at DESC
  LIMIT p_limit;
$$;