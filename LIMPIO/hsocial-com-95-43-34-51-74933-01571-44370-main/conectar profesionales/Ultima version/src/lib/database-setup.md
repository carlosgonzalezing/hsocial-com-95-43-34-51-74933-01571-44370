# Database Migration Plan for H Social Deployment

## Required Tables for Production Deployment

### 1. Access Control Tables

```sql
-- Invitation codes table
CREATE TABLE invitation_codes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    code text UNIQUE NOT NULL,
    institution_name text NOT NULL,
    max_uses integer DEFAULT 100,
    current_uses integer DEFAULT 0,
    expires_at timestamp with time zone,
    is_active boolean DEFAULT true,
    created_by uuid REFERENCES profiles(id),
    created_at timestamp with time zone DEFAULT now()
);

-- Institution domains whitelist
CREATE TABLE institution_domains (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    domain text UNIQUE NOT NULL,
    institution_name text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

-- User institution tracking
CREATE TABLE user_institutions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    institution_name text,
    access_method text, -- 'invitation_code' | 'domain_whitelist'
    invitation_code_used text,
    joined_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id)
);
```

### 2. Analytics & Monitoring Tables

```sql
-- Platform events for analytics
CREATE TABLE platform_events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type text NOT NULL,
    event_data jsonb DEFAULT '{}',
    user_id uuid REFERENCES profiles(id),
    created_at timestamp with time zone DEFAULT now()
);

-- Content reports for moderation
CREATE TABLE content_reports (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id uuid REFERENCES profiles(id) NOT NULL,
    content_type text NOT NULL, -- 'post' | 'comment' | 'user' | 'story'
    content_id text NOT NULL,
    reported_user_id uuid REFERENCES profiles(id),
    reason text NOT NULL,
    description text,
    status text DEFAULT 'pending', -- 'pending' | 'reviewed' | 'resolved' | 'dismissed'
    reviewed_by uuid REFERENCES profiles(id),
    reviewed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(reporter_id, content_type, content_id)
);
```

### 3. Required RLS Policies

```sql
-- Invitation codes (admin only)
ALTER TABLE invitation_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invitation_codes_admin_only" ON invitation_codes
    FOR ALL USING (false); -- Only admin access via service role

-- Institution domains (read-only for authenticated users)
ALTER TABLE institution_domains ENABLE ROW LEVEL SECURITY;
CREATE POLICY "institution_domains_read" ON institution_domains
    FOR SELECT USING (auth.role() = 'authenticated');

-- User institutions (users can see their own)
ALTER TABLE user_institutions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_institutions_own" ON user_institutions
    FOR ALL USING (auth.uid() = user_id);

-- Platform events (users can insert their own)
ALTER TABLE platform_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "platform_events_insert_own" ON platform_events
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "platform_events_admin_read" ON platform_events
    FOR SELECT USING (false); -- Admin only via service role

-- Content reports (users can create and see their own)
ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "content_reports_create_own" ON content_reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "content_reports_read_own" ON content_reports
    FOR SELECT USING (auth.uid() = reporter_id OR auth.uid() = reported_user_id);
```

### 4. Required Functions

```sql
-- Function to use invitation code
CREATE OR REPLACE FUNCTION use_invitation_code(code_param text)
RETURNS void AS $$
BEGIN
    UPDATE invitation_codes 
    SET current_uses = current_uses + 1
    WHERE code = code_param 
    AND is_active = true 
    AND current_uses < max_uses;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid or exhausted invitation code';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 5. Indexes for Performance

```sql
-- Access control indexes
CREATE INDEX idx_invitation_codes_code ON invitation_codes(code) WHERE is_active = true;
CREATE INDEX idx_institution_domains_domain ON institution_domains(domain) WHERE is_active = true;
CREATE INDEX idx_user_institutions_user_id ON user_institutions(user_id);

-- Analytics indexes
CREATE INDEX idx_platform_events_type_created ON platform_events(event_type, created_at);
CREATE INDEX idx_platform_events_user_created ON platform_events(user_id, created_at);

-- Moderation indexes
CREATE INDEX idx_content_reports_status ON content_reports(status, created_at);
CREATE INDEX idx_content_reports_reported_user ON content_reports(reported_user_id, created_at);
```

### 6. Initial Data Seeds

```sql
-- Add SENA domains
INSERT INTO institution_domains (domain, institution_name) VALUES
    ('sena.edu.co', 'SENA'),
    ('estudiante.sena.edu.co', 'SENA'),
    ('aprendiz.sena.edu.co', 'SENA'),
    ('misena.edu.co', 'SENA');

-- Add initial invitation codes
INSERT INTO invitation_codes (code, institution_name, max_uses) VALUES
    ('SENA2024', 'SENA', 100),
    ('HSOCIAL', 'H Social Beta', 50),
    ('PILOTO01', 'SENA Piloto', 200);
```

## Migration Steps

1. **Run the SQL migrations above in Supabase**
2. **Update the access control implementation** to use real tables instead of config
3. **Enable restricted mode** in production
4. **Set up monitoring** for the new analytics tables
5. **Configure admin access** for invitation code management

## Deployment Checklist

- [ ] Create all required tables
- [ ] Set up RLS policies
- [ ] Create required functions
- [ ] Add performance indexes
- [ ] Seed initial data
- [ ] Update application code to use real tables
- [ ] Test access control flows
- [ ] Set up admin dashboard for invitation codes
- [ ] Configure monitoring and alerts
- [ ] Enable restricted mode for production