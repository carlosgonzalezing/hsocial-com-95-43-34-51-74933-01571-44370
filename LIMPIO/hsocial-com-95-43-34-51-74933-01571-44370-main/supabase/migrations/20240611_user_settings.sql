
-- Create the user_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_privacy TEXT DEFAULT 'public',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can read their own settings" ON public.user_settings;
CREATE POLICY "Users can read their own settings"
  ON public.user_settings FOR SELECT
  USING (auth.uid() = user_id);
  
DROP POLICY IF EXISTS "Users can update their own settings" ON public.user_settings;
CREATE POLICY "Users can update their own settings"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = user_id);
  
DROP POLICY IF EXISTS "Users can insert their own settings" ON public.user_settings;
CREATE POLICY "Users can insert their own settings"
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to get user story privacy
CREATE OR REPLACE FUNCTION public.get_user_story_privacy(user_id_input UUID)
RETURNS TEXT AS $$
DECLARE
  privacy_setting TEXT;
BEGIN
  -- Try to find a privacy setting
  SELECT story_privacy INTO privacy_setting
  FROM user_settings
  WHERE user_id = user_id_input;
  
  -- Return default value if not found
  IF privacy_setting IS NULL THEN
    RETURN 'public';
  END IF;
  
  RETURN privacy_setting;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to save user story privacy
CREATE OR REPLACE FUNCTION public.save_user_story_privacy(user_id_input UUID, privacy_setting TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Insert or update privacy setting
  INSERT INTO user_settings (user_id, story_privacy)
  VALUES (user_id_input, privacy_setting)
  ON CONFLICT (user_id)
  DO UPDATE SET
    story_privacy = privacy_setting,
    updated_at = now();
    
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
