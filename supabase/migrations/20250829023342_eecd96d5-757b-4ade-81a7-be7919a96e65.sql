-- Add institution and academic role fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN institution_name text,
ADD COLUMN academic_role text CHECK (academic_role IN ('estudiante', 'profesor', 'egresado', 'otro'));