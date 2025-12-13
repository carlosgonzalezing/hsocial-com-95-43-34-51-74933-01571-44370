-- Fix the handle_new_comment function to use 'message' instead of 'content'
CREATE OR REPLACE FUNCTION public.handle_new_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    post_author_id UUID;
BEGIN
    -- Get the post author ID
    SELECT p.user_id INTO post_author_id
    FROM public.posts p
    WHERE p.id = NEW.post_id;

    -- If the commenter is not the post author, create notification
    IF post_author_id IS NOT NULL AND post_author_id != NEW.user_id THEN
        INSERT INTO public.notifications (receiver_id, sender_id, type, post_id, comment_id, message)
        VALUES (
            post_author_id, 
            NEW.user_id,
            'comment_on_post',
            NEW.post_id,
            NEW.id,
            'Ha comentado en tu publicación: ' || LEFT(NEW.content, 50)
        );
    END IF;

    RETURN NEW;
END;
$function$;