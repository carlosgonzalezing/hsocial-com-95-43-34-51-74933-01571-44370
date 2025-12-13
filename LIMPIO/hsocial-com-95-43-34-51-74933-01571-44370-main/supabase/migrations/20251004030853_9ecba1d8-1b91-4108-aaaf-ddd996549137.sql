-- Agregar foreign keys a la tabla reactions
ALTER TABLE public.reactions 
ADD CONSTRAINT reactions_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;

ALTER TABLE public.reactions 
ADD CONSTRAINT reactions_post_id_fkey 
FOREIGN KEY (post_id) 
REFERENCES public.posts(id) 
ON DELETE CASCADE;

ALTER TABLE public.reactions 
ADD CONSTRAINT reactions_comment_id_fkey 
FOREIGN KEY (comment_id) 
REFERENCES public.comments(id) 
ON DELETE CASCADE;