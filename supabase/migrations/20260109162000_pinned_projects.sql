--- Tabla para proyectos fijados por usuarios Premium
CREATE TABLE IF NOT EXISTS public.pinned_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  position integer NOT NULL CHECK (position >= 0 AND position <= 2), -- 0,1,2 (máx 3 fijados)
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, position),
  UNIQUE(user_id, project_id)
);

--- Índices útiles
CREATE INDEX idx_pinned_projects_user_id ON public.pinned_projects(user_id);
CREATE INDEX idx_pinned_projects_project_id ON public.pinned_projects(project_id);
CREATE INDEX idx_pinned_projects_position ON public.pinned_projects(user_id, position);

--- RLS: solo el dueño puede leer/insertar/actualizar/eliminar
ALTER TABLE public.pinned_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own pinned projects" ON public.pinned_projects
  FOR ALL USING (auth.uid() = user_id);

--- Vista para obtener proyectos fijados de un usuario con datos del proyecto
CREATE OR REPLACE VIEW public.user_pinned_projects AS
SELECT
  pp.user_id,
  pp.position,
  p.id,
  COALESCE(p.idea->>'title', ps.project_title, 'Sin título') as title,
  COALESCE(p.content, p.idea->>'description', ps.project_description, '') as description,
  p.project_status as status,
  p.visibility,
  p.created_at,
  -- Campos adicionales desde project_showcases si existen
  ps.project_title,
  ps.project_description,
  ps.technologies_used as technologies,
  ps.project_status as showcase_status,
  ps.images_urls as featured_image,
  ps.project_url as link,
  ps.seeking_collaborators as collaborators,
  ps.duration_months as completion_date
FROM public.pinned_projects pp
LEFT JOIN public.posts p ON pp.project_id = p.id
LEFT JOIN public.project_showcases ps ON pp.project_id = ps.post_id
ORDER BY pp.user_id, pp.position;

--- RPC para fijar un proyecto (con límite Premium)
CREATE OR REPLACE FUNCTION public.pin_project(
  user_id_param uuid,
  project_id_param uuid,
  position_param integer DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  is_premium boolean;
  pinned_count integer;
  is_project boolean;
BEGIN
  -- Verificar si el usuario es Premium
  SELECT public.is_user_premium() INTO is_premium;
  IF NOT is_premium THEN
    RETURN jsonb_build_object('success', false, 'error', 'Solo usuarios Premium pueden fijar proyectos');
  END IF;

  -- Verificar que el post existe y es un proyecto
  SELECT EXISTS(SELECT 1 FROM public.posts WHERE id = project_id_param AND project_status IS NOT NULL) INTO is_project;
  IF NOT is_project THEN
    RETURN jsonb_build_object('success', false, 'error', 'El proyecto no existe o no es válido');
  END IF;

  -- Contar proyectos ya fijados
  SELECT COUNT(*) INTO pinned_count
  FROM public.pinned_projects
  WHERE user_id = user_id_param;

  IF pinned_count >= 3 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Máximo 3 proyectos fijados');
  END IF;

  -- Insertar o actualizar posición
  INSERT INTO public.pinned_projects (user_id, project_id, position)
  VALUES (user_id_param, project_id_param, position_param)
  ON CONFLICT (user_id, project_id) DO UPDATE SET
    position = position_param,
    created_at = now();

  RETURN jsonb_build_object('success', true);
END;
$$;

--- RPC para quitar un proyecto fijado
CREATE OR REPLACE FUNCTION public.unpin_project(
  user_id_param uuid,
  project_id_param uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.pinned_projects
  WHERE user_id = user_id_param AND project_id = project_id_param;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Proyecto no estaba fijado');
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$; 