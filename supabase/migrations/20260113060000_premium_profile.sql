-- Tabla para CV de usuarios
CREATE TABLE IF NOT EXISTS profile_cv (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(profile_id)
);

-- Tabla para enlaces de portafolio
CREATE TABLE IF NOT EXISTS profile_portfolio_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL DEFAULT 'portfolio', -- 'portfolio', 'github', 'linkedin', 'website', 'other'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para badges profesionales
CREATE TABLE IF NOT EXISTS profile_badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    badge_type VARCHAR(50) NOT NULL, -- 'verified', 'premium', 'top_contributor', 'expert', etc.
    badge_name VARCHAR(100) NOT NULL,
    badge_description TEXT,
    badge_icon VARCHAR(50),
    badge_color VARCHAR(20) DEFAULT 'primary',
    earned_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para estadísticas públicas del perfil
CREATE TABLE IF NOT EXISTS profile_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    total_views INTEGER DEFAULT 0,
    project_views INTEGER DEFAULT 0,
    profile_views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    company_views INTEGER DEFAULT 0,
    total_projects INTEGER DEFAULT 0,
    completed_projects INTEGER DEFAULT 0,
    total_reactions INTEGER DEFAULT 0,
    total_comments INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(profile_id)
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_profile_cv_profile_id ON profile_cv(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_portfolio_links_profile_id ON profile_portfolio_links(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_badges_profile_id ON profile_badges(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_badges_active ON profile_badges(is_active);
CREATE INDEX IF NOT EXISTS idx_profile_stats_profile_id ON profile_stats(profile_id);

-- RLS Policies
ALTER TABLE profile_cv ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_portfolio_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_stats ENABLE ROW LEVEL SECURITY;

-- Policies para CV
DROP POLICY IF EXISTS "Users can view their own CV" ON profile_cv;
DROP POLICY IF EXISTS "Users can view public CVs" ON profile_cv;
DROP POLICY IF EXISTS "Users can insert their own CV" ON profile_cv;
DROP POLICY IF EXISTS "Users can update their own CV" ON profile_cv;
DROP POLICY IF EXISTS "Users can delete their own CV" ON profile_cv;

CREATE POLICY "Users can view their own CV" ON profile_cv FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Users can view public CVs" ON profile_cv FOR SELECT USING (is_public = true);
CREATE POLICY "Users can insert their own CV" ON profile_cv FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Users can update their own CV" ON profile_cv FOR UPDATE USING (auth.uid() = profile_id);
CREATE POLICY "Users can delete their own CV" ON profile_cv FOR DELETE USING (auth.uid() = profile_id);

-- Policies para enlaces de portafolio
DROP POLICY IF EXISTS "Anyone can view portfolio links" ON profile_portfolio_links;
DROP POLICY IF EXISTS "Users can insert their own portfolio links" ON profile_portfolio_links;
DROP POLICY IF EXISTS "Users can update their own portfolio links" ON profile_portfolio_links;
DROP POLICY IF EXISTS "Users can delete their own portfolio links" ON profile_portfolio_links;

CREATE POLICY "Anyone can view portfolio links" ON profile_portfolio_links FOR SELECT USING (true);
CREATE POLICY "Users can insert their own portfolio links" ON profile_portfolio_links FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Users can update their own portfolio links" ON profile_portfolio_links FOR UPDATE USING (auth.uid() = profile_id);
CREATE POLICY "Users can delete their own portfolio links" ON profile_portfolio_links FOR DELETE USING (auth.uid() = profile_id);

-- Policies para badges
DROP POLICY IF EXISTS "Anyone can view active badges" ON profile_badges;
DROP POLICY IF EXISTS "Users can view their own badges" ON profile_badges;

CREATE POLICY "Anyone can view active badges" ON profile_badges FOR SELECT USING (is_active = true);
CREATE POLICY "Users can view their own badges" ON profile_badges FOR SELECT USING (auth.uid() = profile_id);

-- Policies para estadísticas
DROP POLICY IF EXISTS "Anyone can view profile stats" ON profile_stats;

CREATE POLICY "Anyone can view profile stats" ON profile_stats FOR SELECT USING (true);

-- Storage bucket para CVs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('cvs', 'cvs', true, 5242880, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO NOTHING;

-- RLS para storage bucket
DROP POLICY IF EXISTS "Users can upload their own CV" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own CV" ON storage.objects;
DROP POLICY IF EXISTS "Users can view public CVs" ON storage.objects;

CREATE POLICY "Users can upload their own CV" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'cvs' AND 
    auth.uid() = (split_part(name, '/', 1))::uuid
);

CREATE POLICY "Users can view their own CV" ON storage.objects FOR SELECT USING (
    bucket_id = 'cvs' AND 
    auth.uid() = (split_part(name, '/', 1))::uuid
);

CREATE POLICY "Users can view public CVs" ON storage.objects FOR SELECT USING (
    bucket_id = 'cvs' AND 
    EXISTS (
        SELECT 1 FROM profile_cv 
        WHERE profile_cv.file_url = name 
        AND profile_cv.is_public = true
    )
);

-- Badge automático para usuarios Premium
CREATE OR REPLACE FUNCTION grant_premium_badge()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Otorgar badge Premium si el usuario es Premium
    IF EXISTS (
        SELECT 1 FROM premium_subscriptions 
        WHERE user_id = NEW.id 
        AND status = 'active'
        AND end_date > NOW()
    ) THEN
        INSERT INTO profile_badges (
            profile_id, 
            badge_type, 
            badge_name, 
            badge_description, 
            badge_icon, 
            badge_color,
            earned_date
        )
        VALUES (
            NEW.id,
            'premium',
            'Premium',
            'Usuario Premium con acceso a beneficios exclusivos',
            'crown',
            'gold',
            NOW()
        )
        ON CONFLICT (profile_id, badge_type) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Trigger para badge Premium
DROP TRIGGER IF EXISTS on_profile_create_badge ON profiles;
DROP FUNCTION IF EXISTS grant_premium_badge();

CREATE OR REPLACE FUNCTION grant_premium_badge()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Otorgar badge Premium si el usuario es Premium
    IF EXISTS (
        SELECT 1 FROM premium_subscriptions 
        WHERE user_id = NEW.id 
        AND status = 'active'
        AND end_date > NOW()
    ) THEN
        INSERT INTO profile_badges (
            profile_id, 
            badge_type, 
            badge_name, 
            badge_description, 
            badge_icon, 
            badge_color,
            earned_date
        )
        VALUES (
            NEW.id,
            'premium',
            'Premium',
            'Usuario Premium con acceso a beneficios exclusivos',
            'crown',
            'gold',
            NOW()
        )
        ON CONFLICT (profile_id, badge_type) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_create_badge
    AFTER INSERT OR UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION grant_premium_badge();
