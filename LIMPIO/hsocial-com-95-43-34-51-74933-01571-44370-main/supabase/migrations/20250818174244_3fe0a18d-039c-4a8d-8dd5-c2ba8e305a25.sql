-- Extend posts table to support opportunity types
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS opportunity_type TEXT CHECK (opportunity_type IN ('job_offer', 'project_showcase', 'collaboration_idea'));

-- Create job_offers table
CREATE TABLE IF NOT EXISTS public.job_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_logo_url TEXT,
  position_title TEXT NOT NULL,
  job_type TEXT NOT NULL CHECK (job_type IN ('full_time', 'part_time', 'internship', 'freelance', 'contract')),
  location TEXT NOT NULL,
  remote_allowed BOOLEAN DEFAULT false,
  salary_range JSONB, -- {min: number, max: number, currency: string}
  requirements TEXT[],
  benefits TEXT[],
  application_deadline TIMESTAMP WITH TIME ZONE,
  experience_level TEXT CHECK (experience_level IN ('entry', 'junior', 'mid', 'senior', 'lead')),
  industry TEXT,
  company_size TEXT CHECK (company_size IN ('startup', 'small', 'medium', 'large', 'enterprise')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project_showcases table
CREATE TABLE IF NOT EXISTS public.project_showcases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  project_title TEXT NOT NULL,
  project_description TEXT NOT NULL,
  project_status TEXT NOT NULL CHECK (project_status IN ('completed', 'ongoing', 'planning', 'seeking_team')),
  technologies_used TEXT[],
  project_url TEXT,
  github_url TEXT,
  demo_url TEXT,
  images_urls TEXT[],
  team_size INTEGER,
  duration_months INTEGER,
  seeking_investment BOOLEAN DEFAULT false,
  seeking_collaborators BOOLEAN DEFAULT false,
  collaboration_roles TEXT[],
  funding_needed NUMERIC,
  revenue_generated NUMERIC,
  user_base INTEGER,
  achievements TEXT[],
  industry TEXT,
  business_model TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create job_applications table
CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_offer_id UUID NOT NULL REFERENCES public.job_offers(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cover_letter TEXT,
  resume_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'interview', 'accepted', 'rejected')),
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(job_offer_id, applicant_id)
);

-- Create project_interests table
CREATE TABLE IF NOT EXISTS public.project_interests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_showcase_id UUID NOT NULL REFERENCES public.project_showcases(id) ON DELETE CASCADE,
  interested_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interest_type TEXT NOT NULL CHECK (interest_type IN ('collaboration', 'investment', 'mentorship', 'general')),
  message TEXT,
  contact_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_showcase_id, interested_user_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.job_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_showcases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_interests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for job_offers
CREATE POLICY "Anyone can view published job offers" ON public.job_offers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.posts 
      WHERE posts.id = job_offers.post_id 
      AND posts.visibility = 'public'
    )
  );

CREATE POLICY "Post authors can manage their job offers" ON public.job_offers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.posts 
      WHERE posts.id = job_offers.post_id 
      AND posts.user_id = auth.uid()
    )
  );

-- RLS Policies for project_showcases
CREATE POLICY "Anyone can view published project showcases" ON public.project_showcases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.posts 
      WHERE posts.id = project_showcases.post_id 
      AND posts.visibility = 'public'
    )
  );

CREATE POLICY "Post authors can manage their project showcases" ON public.project_showcases
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.posts 
      WHERE posts.id = project_showcases.post_id 
      AND posts.user_id = auth.uid()
    )
  );

-- RLS Policies for job_applications
CREATE POLICY "Users can view their own applications" ON public.job_applications
  FOR SELECT USING (auth.uid() = applicant_id);

CREATE POLICY "Job posters can view applications to their jobs" ON public.job_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.job_offers jo
      JOIN public.posts p ON p.id = jo.post_id
      WHERE jo.id = job_applications.job_offer_id 
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create applications" ON public.job_applications
  FOR INSERT WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "Users can update their own applications" ON public.job_applications
  FOR UPDATE USING (auth.uid() = applicant_id);

CREATE POLICY "Job posters can update application status" ON public.job_applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.job_offers jo
      JOIN public.posts p ON p.id = jo.post_id
      WHERE jo.id = job_applications.job_offer_id 
      AND p.user_id = auth.uid()
    )
  );

-- RLS Policies for project_interests
CREATE POLICY "Users can view their own interests" ON public.project_interests
  FOR SELECT USING (auth.uid() = interested_user_id);

CREATE POLICY "Project owners can view interests in their projects" ON public.project_interests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.project_showcases ps
      JOIN public.posts p ON p.id = ps.post_id
      WHERE ps.id = project_interests.project_showcase_id 
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create project interests" ON public.project_interests
  FOR INSERT WITH CHECK (auth.uid() = interested_user_id);

CREATE POLICY "Users can update their own interests" ON public.project_interests
  FOR UPDATE USING (auth.uid() = interested_user_id);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_job_offers_updated_at
  BEFORE UPDATE ON public.job_offers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_showcases_updated_at
  BEFORE UPDATE ON public.project_showcases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();