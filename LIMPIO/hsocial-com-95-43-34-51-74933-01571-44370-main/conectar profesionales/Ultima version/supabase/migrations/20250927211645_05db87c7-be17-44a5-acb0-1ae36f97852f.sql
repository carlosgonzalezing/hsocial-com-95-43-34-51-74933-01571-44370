-- Make end_date optional in academic_events table
ALTER TABLE public.academic_events ALTER COLUMN end_date DROP NOT NULL;

-- Update the create_academic_event_atomic function to handle optional end_date
CREATE OR REPLACE FUNCTION public.create_academic_event_atomic(
  post_content text, 
  post_visibility post_visibility, 
  event_title text, 
  event_description text, 
  event_type text, 
  start_date timestamp with time zone, 
  end_date timestamp with time zone, 
  location text, 
  is_virtual boolean, 
  meeting_link text, 
  max_attendees integer, 
  user_id_param uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_post_id UUID;
  new_event_id UUID;
  result JSONB;
  computed_end_date timestamp with time zone;
BEGIN
  -- If end_date is null, set it to 2 hours after start_date
  IF end_date IS NULL THEN
    computed_end_date := start_date + INTERVAL '2 hours';
  ELSE
    computed_end_date := end_date;
  END IF;

  -- Create the post first
  INSERT INTO public.posts (content, visibility, user_id, post_type)
  VALUES (post_content, post_visibility, user_id_param, 'academic_event')
  RETURNING id INTO new_post_id;
  
  -- Create the academic event
  INSERT INTO public.academic_events (
    post_id, title, description, event_type, start_date, end_date,
    location, is_virtual, meeting_link, max_attendees
  ) VALUES (
    new_post_id, event_title, event_description, event_type, start_date, computed_end_date,
    location, is_virtual, meeting_link, max_attendees
  ) RETURNING id INTO new_event_id;
  
  -- Return success result
  SELECT jsonb_build_object(
    'success', true,
    'post_id', new_post_id,
    'event_id', new_event_id,
    'message', 'Evento creado exitosamente'
  ) INTO result;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$function$;