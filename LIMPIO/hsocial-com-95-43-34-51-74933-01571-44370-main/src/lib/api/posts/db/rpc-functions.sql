
-- Function to toggle post pin status
CREATE OR REPLACE FUNCTION toggle_post_pin(post_id UUID, pin_status BOOLEAN)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  success BOOLEAN;
BEGIN
  UPDATE public.posts
  SET is_pinned = pin_status
  WHERE id = post_id
  AND user_id = auth.uid();
  
  GET DIAGNOSTICS success = ROW_COUNT;
  
  RETURN success > 0;
END;
$$;

-- Function to check if a post is pinned
CREATE OR REPLACE FUNCTION get_post_pin_status(post_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_pin BOOLEAN;
BEGIN
  SELECT is_pinned INTO is_pin
  FROM public.posts
  WHERE id = post_id;
  
  RETURN COALESCE(is_pin, false);
END;
$$;

-- Function to check if a column exists in a table
CREATE OR REPLACE FUNCTION check_column_exists(table_name TEXT, column_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  column_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = check_column_exists.table_name
    AND column_name = check_column_exists.column_name
  ) INTO column_exists;
  
  RETURN column_exists;
END;
$$;
