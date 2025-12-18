-- Fix security warnings by setting search_path for functions

-- Update mentorship rating function
CREATE OR REPLACE FUNCTION public.update_mentorship_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.student_rating IS NOT NULL AND OLD.student_rating IS NULL THEN
    UPDATE public.mentorships 
    SET 
      total_reviews = total_reviews + 1,
      rating = (
        SELECT AVG(student_rating)::numeric(3,2) 
        FROM public.mentorship_sessions 
        WHERE mentorship_id = NEW.mentorship_id AND student_rating IS NOT NULL
      )
    WHERE id = NEW.mentorship_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Update event attendees function
CREATE OR REPLACE FUNCTION public.update_event_attendees()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.academic_events 
    SET current_attendees = current_attendees + 1
    WHERE id = NEW.event_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.academic_events 
    SET current_attendees = current_attendees - 1
    WHERE id = OLD.event_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;