-- Corrección RLS optimizada - Version corregida
-- Basada en el esquema real de las tablas

-- 1. NOTIFICATIONS - Usar las columnas correctas (sender_id, receiver_id)
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert their own notifications" ON public.notifications;

-- Recrear políticas para notifications con las columnas correctas
CREATE POLICY "Users can view received notifications" 
ON public.notifications FOR SELECT 
TO authenticated 
USING ((SELECT auth.uid()) = receiver_id);

CREATE POLICY "Users can update received notifications" 
ON public.notifications FOR UPDATE 
TO authenticated 
USING ((SELECT auth.uid()) = receiver_id);

CREATE POLICY "System can insert notifications" 
ON public.notifications FOR INSERT 
TO authenticated 
WITH CHECK (true); -- Las notificaciones son insertadas por el sistema

-- 2. INCOGNITO POSTS - Optimizar
DROP POLICY IF EXISTS "Authenticated users can create incognito posts" ON public.incognito_posts;
CREATE POLICY "Authenticated users can create incognito posts" 
ON public.incognito_posts FOR INSERT 
TO authenticated 
WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

-- 3. GROUP MESSAGES - Optimizar con sender_id correcto
DROP POLICY IF EXISTS "Authenticated users can send group messages" ON public.group_messages;
DROP POLICY IF EXISTS "Group members can send messages" ON public.group_messages;
DROP POLICY IF EXISTS "Group messages are viewable by group members" ON public.group_messages;
DROP POLICY IF EXISTS "Users can delete their own group messages" ON public.group_messages;
DROP POLICY IF EXISTS "Users can update their own group messages" ON public.group_messages;

CREATE POLICY "Group members send messages optimized" 
ON public.group_messages FOR INSERT 
TO authenticated 
WITH CHECK (
  (SELECT auth.uid()) = sender_id 
  AND EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_members.group_id = group_messages.group_id 
    AND group_members.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Group messages view optimized" 
ON public.group_messages FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_members.group_id = group_messages.group_id 
    AND group_members.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Users manage own messages optimized" 
ON public.group_messages FOR UPDATE 
TO authenticated 
USING ((SELECT auth.uid()) = sender_id);

CREATE POLICY "Users delete own messages optimized" 
ON public.group_messages FOR DELETE 
TO authenticated 
USING ((SELECT auth.uid()) = sender_id);

-- 4. COMMENTS - Optimizar con user_id
DROP POLICY IF EXISTS "Los usuarios autenticados pueden crear comentarios" ON public.comments;
DROP POLICY IF EXISTS "Los usuarios pueden eliminar sus propios comentarios" ON public.comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;

CREATE POLICY "Users create comments optimized" 
ON public.comments FOR INSERT 
TO authenticated 
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users delete comments optimized" 
ON public.comments FOR DELETE 
TO authenticated 
USING ((SELECT auth.uid()) = user_id);

-- 5. POSTS - Optimizar
DROP POLICY IF EXISTS "Users can insert their own posts" ON public.posts;
CREATE POLICY "Users insert posts optimized" 
ON public.posts FOR INSERT 
TO authenticated 
WITH CHECK ((SELECT auth.uid()) = user_id);

-- 6. PROFILES - Optimizar (usar id como clave)
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users update profile optimized" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users insert profile optimized" 
ON public.profiles FOR INSERT 
TO authenticated 
WITH CHECK ((SELECT auth.uid()) = id);

-- 7. COMMENT REPORTS - Optimizar
DROP POLICY IF EXISTS "Users can create reports" ON public.comment_reports;
DROP POLICY IF EXISTS "Users can view their own reports" ON public.comment_reports;

CREATE POLICY "Users create reports optimized" 
ON public.comment_reports FOR INSERT 
TO authenticated 
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users view reports optimized" 
ON public.comment_reports FOR SELECT 
TO authenticated 
USING ((SELECT auth.uid()) = user_id);

-- 8. LIKES - Optimizar
DROP POLICY IF EXISTS "Users can create their own likes" ON public.likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON public.likes;
DROP POLICY IF EXISTS "Users can update their own likes" ON public.likes;

CREATE POLICY "Users create likes optimized" 
ON public.likes FOR INSERT 
TO authenticated 
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users delete likes optimized" 
ON public.likes FOR DELETE 
TO authenticated 
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users update likes optimized" 
ON public.likes FOR UPDATE 
TO authenticated 
USING ((SELECT auth.uid()) = user_id);

-- 9. Índices para optimizar performance
CREATE INDEX IF NOT EXISTS idx_notifications_receiver_id ON public.notifications(receiver_id);
CREATE INDEX IF NOT EXISTS idx_notifications_sender_id ON public.notifications(sender_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_sender_id ON public.group_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_reports_user_id ON public.comment_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_composite ON public.group_members(user_id, group_id);