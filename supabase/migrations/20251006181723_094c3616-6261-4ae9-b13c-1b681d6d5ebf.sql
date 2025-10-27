-- Add project_status column to posts table for Ideas → Projects flow
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS project_status text CHECK (project_status IN ('idea', 'in_progress', 'completed'));

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_project_status ON public.posts(project_status) WHERE project_status IS NOT NULL;

-- Create function to convert idea to project
CREATE OR REPLACE FUNCTION public.convert_idea_to_project(
  post_id_param uuid,
  new_status text DEFAULT 'in_progress'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
  post_owner_id uuid;
BEGIN
  -- Verify post exists and is an idea
  SELECT user_id INTO post_owner_id
  FROM public.posts
  WHERE id = post_id_param AND post_type = 'idea';
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Post no encontrado o no es una idea'
    );
  END IF;
  
  -- Verify user is the owner
  IF post_owner_id != auth.uid() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'No tienes permisos para modificar esta idea'
    );
  END IF;
  
  -- Update project status
  UPDATE public.posts
  SET 
    project_status = new_status,
    updated_at = now()
  WHERE id = post_id_param;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Idea convertida a proyecto exitosamente',
    'project_status', new_status
  );
END;
$$;