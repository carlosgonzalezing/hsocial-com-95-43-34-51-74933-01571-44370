-- Tabla para la lista de espera Premium Pro
CREATE TABLE IF NOT EXISTS public.premium_waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  whatsapp text NOT NULL,
  email text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Índices útiles
CREATE INDEX idx_premium_waitlist_created_at ON public.premium_waitlist(created_at);

-- Política RLS: solo el servicio (webhook o backend) puede leer/insertar
ALTER TABLE public.premium_waitlist ENABLE ROW LEVEL SECURITY;
-- Permitir que cualquiera deje sus datos (INSERT) desde el frontend.
-- No se permite leer/editar/borrar desde el cliente.
CREATE POLICY "Anyone can insert waitlist" ON public.premium_waitlist
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Opcional: vista simple para consultar la lista de espera
CREATE OR REPLACE VIEW public.premium_waitlist_view AS
SELECT
  id,
  whatsapp,
  email,
  created_at
FROM public.premium_waitlist
ORDER BY created_at DESC;
