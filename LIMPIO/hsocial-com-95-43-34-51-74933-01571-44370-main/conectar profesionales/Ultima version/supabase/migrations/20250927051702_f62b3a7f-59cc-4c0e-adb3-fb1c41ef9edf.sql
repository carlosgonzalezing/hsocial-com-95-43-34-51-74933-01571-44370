-- Fix RLS policy for engagement_rewards_log to allow authenticated users to insert
DROP POLICY IF EXISTS "System can insert rewards" ON public.engagement_rewards_log;

CREATE POLICY "Authenticated users can insert rewards" 
ON public.engagement_rewards_log 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow system/functions to also insert rewards
CREATE POLICY "System functions can insert rewards" 
ON public.engagement_rewards_log 
FOR INSERT 
TO service_role
WITH CHECK (true);