-- 1. Create SECURITY DEFINER function to check channel membership
CREATE OR REPLACE FUNCTION public.is_channel_member(user_id_param uuid, channel_id_param uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.miembros_canal
    WHERE id_usuario = user_id_param
      AND id_canal = channel_id_param
  )
$$;

-- 2. Drop problematic RLS policies on miembros_canal
DROP POLICY IF EXISTS "Users can view members of channels they belong to" ON public.miembros_canal;

-- 3. Create new RLS policy for miembros_canal using the function
CREATE POLICY "Users can view channel members"
ON public.miembros_canal
FOR SELECT
USING (public.is_channel_member(auth.uid(), id_canal));

-- 4. Drop problematic RLS policies on mensajes
DROP POLICY IF EXISTS "Usuarios solo pueden ver mensajes en sus canales" ON public.mensajes;
DROP POLICY IF EXISTS "Usuarios solo pueden enviar mensajes a sus canales" ON public.mensajes;

-- 5. Create new RLS policies for mensajes using the function
CREATE POLICY "Users can view messages in their channels"
ON public.mensajes
FOR SELECT
USING (public.is_channel_member(auth.uid(), id_canal));

CREATE POLICY "Users can send messages to their channels"
ON public.mensajes
FOR INSERT
WITH CHECK (public.is_channel_member(auth.uid(), id_canal));