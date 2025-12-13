
-- This file contains SQL migrations that can be run to ensure database structure is correct

-- Add is_pinned column to posts table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'posts'
    AND column_name = 'is_pinned'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN is_pinned BOOLEAN DEFAULT false;
  END IF;
END
$$;
