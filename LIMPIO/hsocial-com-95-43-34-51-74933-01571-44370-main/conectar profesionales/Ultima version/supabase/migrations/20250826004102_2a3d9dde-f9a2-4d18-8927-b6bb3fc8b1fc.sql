-- Educational Hub Database Migration

-- Mentorships table
CREATE TABLE IF NOT EXISTS public.mentorships (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  specialties text[] NOT NULL DEFAULT '{}',
  description text,
  availability jsonb DEFAULT '{}', -- {days: [], hours: {start: '', end: ''}}
  hourly_rate numeric DEFAULT 0,
  is_free boolean DEFAULT true,
  max_students_per_session integer DEFAULT 1,
  session_duration integer DEFAULT 60, -- in minutes
  is_active boolean DEFAULT true,
  total_sessions integer DEFAULT 0,
  rating numeric DEFAULT 0,
  total_reviews integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Mentorship sessions table
CREATE TABLE IF NOT EXISTS public.mentorship_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  mentorship_id uuid NOT NULL REFERENCES public.mentorships(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scheduled_at timestamp with time zone NOT NULL,
  duration integer DEFAULT 60,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  meeting_link text,
  notes text,
  student_rating integer CHECK (student_rating >= 1 AND student_rating <= 5),
  student_review text,
  mentor_notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Professional internships table
CREATE TABLE IF NOT EXISTS public.internships (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  company_logo_url text,
  position_title text NOT NULL,
  description text NOT NULL,
  requirements text[] DEFAULT '{}',
  duration_months integer,
  is_paid boolean DEFAULT false,
  stipend_amount numeric DEFAULT 0,
  location text,
  is_remote boolean DEFAULT false,
  required_semester text, -- e.g., '6th', '8th', 'any'
  required_careers text[] DEFAULT '{}',
  skills_to_develop text[] DEFAULT '{}',
  application_deadline timestamp with time zone,
  start_date timestamp with time zone,
  contact_email text,
  contact_phone text,
  max_applications integer DEFAULT 50,
  current_applications integer DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed', 'expired')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Internship applications table
CREATE TABLE IF NOT EXISTS public.internship_applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  internship_id uuid NOT NULL REFERENCES public.internships(id) ON DELETE CASCADE,
  applicant_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cover_letter text,
  resume_url text,
  portfolio_url text,
  relevant_experience text,
  motivation text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'interview', 'accepted', 'rejected')),
  notes text, -- for employer notes
  applied_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(internship_id, applicant_id)
);

-- Academic events table
CREATE TABLE IF NOT EXISTS public.academic_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('conference', 'seminar', 'workshop', 'hackathon', 'webinar', 'networking', 'career_fair')),
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone NOT NULL,
  location text,
  is_virtual boolean DEFAULT false,
  meeting_link text,
  max_attendees integer,
  current_attendees integer DEFAULT 0,
  registration_required boolean DEFAULT true,
  registration_deadline timestamp with time zone,
  is_free boolean DEFAULT true,
  ticket_price numeric DEFAULT 0,
  organizer_name text,
  organizer_contact text,
  agenda jsonb DEFAULT '[]', -- [{time: '', title: '', speaker: '', description: ''}]
  speakers jsonb DEFAULT '[]', -- [{name: '', bio: '', photo: '', linkedin: ''}]
  sponsors text[] DEFAULT '{}',
  certificates_available boolean DEFAULT false,
  target_audience text[] DEFAULT '{}', -- careers, semesters, etc.
  tags text[] DEFAULT '{}',
  status text DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed', 'cancelled')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Event registrations table
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid NOT NULL REFERENCES public.academic_events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  registration_data jsonb DEFAULT '{}', -- additional info collected during registration
  attendance_status text DEFAULT 'registered' CHECK (attendance_status IN ('registered', 'attended', 'no_show', 'cancelled')),
  check_in_time timestamp with time zone,
  certificate_issued boolean DEFAULT false,
  feedback_rating integer CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
  feedback_comment text,
  registered_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Enhanced user reputation table
CREATE TABLE IF NOT EXISTS public.user_reputation (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reputation_type text NOT NULL, -- 'mentor', 'student', 'organizer', 'participant'
  category text NOT NULL, -- 'academic', 'professional', 'social', 'leadership'
  points integer DEFAULT 0,
  level_name text DEFAULT 'Novato',
  badges text[] DEFAULT '{}',
  achievements jsonb DEFAULT '{}', -- {achievement_name: {earned_at: '', description: ''}}
  endorsements_received integer DEFAULT 0,
  endorsements_given integer DEFAULT 0,
  completed_mentorships integer DEFAULT 0,
  events_organized integer DEFAULT 0,
  events_attended integer DEFAULT 0,
  last_activity_date date DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, reputation_type, category)
);

-- Skill endorsements table
CREATE TABLE IF NOT EXISTS public.skill_endorsements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  endorsed_user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  endorser_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_name text NOT NULL,
  endorsement_context text, -- 'mentorship', 'project', 'event', 'general'
  strength_level integer DEFAULT 1 CHECK (strength_level >= 1 AND strength_level <= 5),
  comment text,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(endorsed_user_id, endorser_id, skill_name)
);

-- User notifications preferences
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mentorship_requests boolean DEFAULT true,
  mentorship_reminders boolean DEFAULT true,
  event_recommendations boolean DEFAULT true,
  internship_matches boolean DEFAULT true,
  weekly_digest boolean DEFAULT true,
  career_opportunities boolean DEFAULT true,
  skill_endorsements boolean DEFAULT true,
  achievement_notifications boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.mentorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reputation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Mentorships
CREATE POLICY "Anyone can view active mentorships" ON public.mentorships
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can create their own mentorships" ON public.mentorships
  FOR INSERT WITH CHECK (auth.uid() = mentor_id);

CREATE POLICY "Mentors can update their own mentorships" ON public.mentorships
  FOR UPDATE USING (auth.uid() = mentor_id);

CREATE POLICY "Mentors can delete their own mentorships" ON public.mentorships
  FOR DELETE USING (auth.uid() = mentor_id);

-- RLS Policies for Mentorship Sessions
CREATE POLICY "Users can view their own sessions" ON public.mentorship_sessions
  FOR SELECT USING (
    auth.uid() = student_id OR 
    auth.uid() = (SELECT mentor_id FROM public.mentorships WHERE id = mentorship_id)
  );

CREATE POLICY "Students can book sessions" ON public.mentorship_sessions
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Participants can update their sessions" ON public.mentorship_sessions
  FOR UPDATE USING (
    auth.uid() = student_id OR 
    auth.uid() = (SELECT mentor_id FROM public.mentorships WHERE id = mentorship_id)
  );

-- RLS Policies for Internships
CREATE POLICY "Anyone can view active internships" ON public.internships
  FOR SELECT USING (status = 'active');

CREATE POLICY "Post authors can manage internships" ON public.internships
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.posts WHERE id = post_id AND user_id = auth.uid())
  );

-- RLS Policies for Internship Applications
CREATE POLICY "Users can create applications" ON public.internship_applications
  FOR INSERT WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "Users can view their own applications" ON public.internship_applications
  FOR SELECT USING (auth.uid() = applicant_id);

CREATE POLICY "Internship posters can view applications" ON public.internship_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.internships i 
      JOIN public.posts p ON p.id = i.post_id 
      WHERE i.id = internship_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Participants can update applications" ON public.internship_applications
  FOR UPDATE USING (
    auth.uid() = applicant_id OR
    EXISTS (
      SELECT 1 FROM public.internships i 
      JOIN public.posts p ON p.id = i.post_id 
      WHERE i.id = internship_id AND p.user_id = auth.uid()
    )
  );

-- RLS Policies for Academic Events
CREATE POLICY "Anyone can view published events" ON public.academic_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.posts WHERE id = post_id AND visibility = 'public')
  );

CREATE POLICY "Post authors can manage events" ON public.academic_events
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.posts WHERE id = post_id AND user_id = auth.uid())
  );

-- RLS Policies for Event Registrations
CREATE POLICY "Users can register for events" ON public.event_registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their registrations" ON public.event_registrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Event organizers can view registrations" ON public.event_registrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.academic_events ae 
      JOIN public.posts p ON p.id = ae.post_id 
      WHERE ae.id = event_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Participants can update registrations" ON public.event_registrations
  FOR UPDATE USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.academic_events ae 
      JOIN public.posts p ON p.id = ae.post_id 
      WHERE ae.id = event_id AND p.user_id = auth.uid()
    )
  );

-- RLS Policies for User Reputation
CREATE POLICY "Anyone can view reputation" ON public.user_reputation
  FOR SELECT USING (true);

CREATE POLICY "System can manage reputation" ON public.user_reputation
  FOR ALL USING (true);

-- RLS Policies for Skill Endorsements
CREATE POLICY "Anyone can view endorsements" ON public.skill_endorsements
  FOR SELECT USING (true);

CREATE POLICY "Users can endorse others" ON public.skill_endorsements
  FOR INSERT WITH CHECK (auth.uid() = endorser_id AND endorser_id != endorsed_user_id);

CREATE POLICY "Users can update their given endorsements" ON public.skill_endorsements
  FOR UPDATE USING (auth.uid() = endorser_id);

-- RLS Policies for Notification Preferences
CREATE POLICY "Users can manage their notification preferences" ON public.notification_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_mentorships_mentor_id ON public.mentorships(mentor_id);
CREATE INDEX idx_mentorships_specialties ON public.mentorships USING GIN(specialties);
CREATE INDEX idx_mentorship_sessions_mentor_student ON public.mentorship_sessions(mentorship_id, student_id);
CREATE INDEX idx_mentorship_sessions_scheduled_at ON public.mentorship_sessions(scheduled_at);

CREATE INDEX idx_internships_post_id ON public.internships(post_id);
CREATE INDEX idx_internships_careers ON public.internships USING GIN(required_careers);
CREATE INDEX idx_internship_applications_internship_applicant ON public.internship_applications(internship_id, applicant_id);

CREATE INDEX idx_academic_events_post_id ON public.academic_events(post_id);
CREATE INDEX idx_academic_events_type_date ON public.academic_events(event_type, start_date);
CREATE INDEX idx_academic_events_target_audience ON public.academic_events USING GIN(target_audience);
CREATE INDEX idx_event_registrations_event_user ON public.event_registrations(event_id, user_id);

CREATE INDEX idx_user_reputation_user_type ON public.user_reputation(user_id, reputation_type);
CREATE INDEX idx_skill_endorsements_endorsed_user ON public.skill_endorsements(endorsed_user_id);

-- Functions for reputation management
CREATE OR REPLACE FUNCTION public.update_mentorship_rating()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_event_attendees()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_mentorship_rating_trigger
  AFTER UPDATE ON public.mentorship_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_mentorship_rating();

CREATE TRIGGER update_event_attendees_trigger
  AFTER INSERT OR DELETE ON public.event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_event_attendees();