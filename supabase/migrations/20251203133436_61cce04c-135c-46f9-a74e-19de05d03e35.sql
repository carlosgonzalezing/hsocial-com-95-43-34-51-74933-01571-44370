-- Update reactions constraint to allow 'love', 'awesome', 'incredible'
ALTER TABLE reactions DROP CONSTRAINT IF EXISTS reactions_reaction_type_check;

-- Migrate any existing 'join' reactions to 'incredible'
UPDATE reactions SET reaction_type = 'incredible' WHERE reaction_type = 'join';

-- Add new constraint with correct values
ALTER TABLE reactions ADD CONSTRAINT reactions_reaction_type_check 
CHECK (reaction_type IN ('love', 'awesome', 'incredible'));

-- Add RLS policies for canales table to allow creating channels
CREATE POLICY "Users can create channels"
ON canales FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Channel members can update channels"
ON canales FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM miembros_canal 
  WHERE id_canal = canales.id AND id_usuario = auth.uid()
));

CREATE POLICY "Channel creators can delete channels"
ON canales FOR DELETE
USING (EXISTS (
  SELECT 1 FROM miembros_canal 
  WHERE id_canal = canales.id AND id_usuario = auth.uid()
));