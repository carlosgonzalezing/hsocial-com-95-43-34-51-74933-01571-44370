-- Permitir que cualquier usuario (autenticado o no) pueda ver datos públicos de perfiles
-- Esto es necesario para ver participantes de ideas, reacciones, comentarios, etc.

CREATE POLICY "Anyone can view public profile data"
ON public.profiles
FOR SELECT
TO public
USING (true);

-- Nota: Esta política solo permite SELECT (lectura), no escritura
-- Los datos sensibles siguen protegidos por otras políticas