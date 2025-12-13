-- Crear edge function para automatizar confirmación de pagos y activación de suscripciones
CREATE OR REPLACE FUNCTION public.confirm_payment_and_activate_subscription(
  payment_id_param UUID,
  admin_user_id_param UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  payment_record RECORD;
  subscription_record RECORD;
  result JSON;
BEGIN
  -- Verificar que el pago existe y está en estado 'reported'
  SELECT * INTO payment_record
  FROM public.nequi_payments
  WHERE id = payment_id_param AND payment_status = 'reported';
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Pago no encontrado o no está en estado reportado'
    );
  END IF;
  
  -- Actualizar el estado del pago a 'confirmed'
  UPDATE public.nequi_payments
  SET 
    payment_status = 'confirmed',
    updated_at = now()
  WHERE id = payment_id_param;
  
  -- Crear o actualizar la suscripción
  INSERT INTO public.subscriptions (
    user_id,
    plan_type,
    status,
    payment_method,
    amount,
    currency,
    start_date,
    end_date,
    payment_reference
  ) VALUES (
    payment_record.user_id,
    'premium',
    'active',
    'nequi',
    payment_record.amount,
    'COP',
    now(),
    now() + INTERVAL '30 days', -- 30 días de suscripción
    payment_record.reference_code
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    status = 'active',
    end_date = CASE 
      WHEN subscriptions.end_date > now() THEN subscriptions.end_date + INTERVAL '30 days'
      ELSE now() + INTERVAL '30 days'
    END,
    updated_at = now(),
    payment_reference = payment_record.reference_code;
    
  -- Vincular el pago con la suscripción
  UPDATE public.nequi_payments
  SET subscription_id = (
    SELECT id FROM public.subscriptions WHERE user_id = payment_record.user_id
  )
  WHERE id = payment_id_param;
  
  -- Inicializar premium hearts para el usuario
  INSERT INTO public.premium_hearts (user_id, hearts_limit)
  VALUES (payment_record.user_id, 20)
  ON CONFLICT (user_id) 
  DO UPDATE SET
    hearts_limit = 20,
    updated_at = now();
  
  RETURN json_build_object(
    'success', true,
    'message', 'Pago confirmado y suscripción activada exitosamente',
    'payment_id', payment_id_param,
    'user_id', payment_record.user_id
  );
END;
$$;

-- Crear función para rechazar pagos
CREATE OR REPLACE FUNCTION public.reject_payment(
  payment_id_param UUID,
  rejection_reason TEXT DEFAULT 'Pago no verificado'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  payment_record RECORD;
BEGIN
  -- Verificar que el pago existe
  SELECT * INTO payment_record
  FROM public.nequi_payments
  WHERE id = payment_id_param;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Pago no encontrado'
    );
  END IF;
  
  -- Actualizar el estado del pago a 'rejected'
  UPDATE public.nequi_payments
  SET 
    payment_status = 'rejected',
    updated_at = now()
  WHERE id = payment_id_param;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Pago rechazado',
    'payment_id', payment_id_param
  );
END;
$$;