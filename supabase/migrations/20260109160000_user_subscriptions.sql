-- Tabla para suscripciones Premium Pro (estado mensual)
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'premium_pro',
  status text NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'incomplete', 'trialing')),
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  provider text NOT NULL DEFAULT 'mercadopago',
  provider_subscription_id text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id)
);

-- Índices útiles
CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_end ON public.user_subscriptions(current_period_end);

-- Política RLS: solo el dueño puede leer su suscripción
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscription" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Política RLS: solo el sistema (webhook) puede insertar/actualizar
CREATE POLICY "Service can manage subscriptions" ON public.user_subscriptions
  FOR ALL USING (
    -- Permitir si es el propio usuario (lectura) O si viene del webhook (cabecera)
    auth.uid() = user_id OR
    current_setting('request.headers')::text LIKE '%x-webhook-secret%'
  );

-- Vista simple para saber si un usuario es Premium Pro
CREATE OR REPLACE VIEW public.user_premium_status AS
SELECT
  user_id,
  status = 'active' AND current_period_end > now() AS is_premium,
  current_period_end,
  plan
FROM public.user_subscriptions;

-- Función para obtener si el usuario actual es Premium Pro
CREATE OR REPLACE FUNCTION public.is_user_premium()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT is_premium FROM public.user_premium_status WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Función para activar Premium Pro (usada por webhook o admin)
CREATE OR REPLACE FUNCTION public.activate_premium_pro(
  user_id_param uuid,
  provider_subscription_id_param text DEFAULT NULL,
  period_start_param timestamptz DEFAULT now(),
  period_end_param timestamptz DEFAULT now() + interval '1 month'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  existing_status text;
BEGIN
  SELECT status INTO existing_status
  FROM public.user_subscriptions
  WHERE user_id = user_id_param;

  IF existing_status = 'active' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Usuario ya tiene Premium Pro activo');
  END IF;

  INSERT INTO public.user_subscriptions (
    user_id,
    plan,
    status,
    current_period_start,
    current_period_end,
    provider_subscription_id
  ) VALUES (
    user_id_param,
    'premium_pro',
    'active',
    period_start_param,
    period_end_param,
    provider_subscription_id_param
  )
  ON CONFLICT (user_id) DO UPDATE SET
    status = 'active',
    current_period_start = period_start_param,
    current_period_end = period_end_param,
    provider_subscription_id = COALESCE(provider_subscription_id_param, user_subscriptions.provider_subscription_id),
    updated_at = now();

  RETURN jsonb_build_object('success', true);
END;
$$;

-- Función para cancelar Premium Pro
CREATE OR REPLACE FUNCTION public.cancel_premium_pro(user_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.user_subscriptions
  SET status = 'canceled', updated_at = now()
  WHERE user_id = user_id_param AND status = 'active';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'No hay suscripción activa');
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;
