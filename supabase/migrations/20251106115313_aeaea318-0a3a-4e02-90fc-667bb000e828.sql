-- Create impersonation sessions table
CREATE TABLE IF NOT EXISTS public.impersonation_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  operator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '2 hours'),
  is_active BOOLEAN NOT NULL DEFAULT true,
  session_token TEXT NOT NULL UNIQUE,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.impersonation_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Operators can view all impersonation sessions"
ON public.impersonation_sessions
FOR SELECT
USING (is_operator(auth.uid()));

CREATE POLICY "Operators can create impersonation sessions"
ON public.impersonation_sessions
FOR INSERT
WITH CHECK (is_operator(auth.uid()) AND operator_id = auth.uid());

CREATE POLICY "Operators can end their own sessions"
ON public.impersonation_sessions
FOR UPDATE
USING (is_operator(auth.uid()) AND operator_id = auth.uid());

-- Create index for faster lookups
CREATE INDEX idx_impersonation_sessions_operator ON public.impersonation_sessions(operator_id, created_at DESC);
CREATE INDEX idx_impersonation_sessions_active ON public.impersonation_sessions(is_active, expires_at);
CREATE INDEX idx_impersonation_sessions_token ON public.impersonation_sessions(session_token) WHERE is_active = true;

-- Function to automatically end expired sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_impersonation_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.impersonation_sessions
  SET is_active = false,
      ended_at = now()
  WHERE is_active = true
    AND expires_at < now();
END;
$$;

-- Function to log impersonation activity to audit logs
CREATE OR REPLACE FUNCTION public.log_impersonation_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs_v2 (
      actor_user_id,
      action,
      entity_type,
      entity_id,
      tenant_id,
      metadata
    ) VALUES (
      NEW.operator_id,
      'impersonation_started',
      'impersonation_session',
      NEW.id,
      NEW.target_tenant_id,
      jsonb_build_object(
        'target_user_id', NEW.target_user_id,
        'reason', NEW.reason,
        'expires_at', NEW.expires_at
      )
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.is_active = true AND NEW.is_active = false THEN
    INSERT INTO public.audit_logs_v2 (
      actor_user_id,
      action,
      entity_type,
      entity_id,
      tenant_id,
      metadata
    ) VALUES (
      NEW.operator_id,
      'impersonation_ended',
      'impersonation_session',
      NEW.id,
      NEW.target_tenant_id,
      jsonb_build_object(
        'duration_minutes', EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at)) / 60,
        'target_user_id', NEW.target_user_id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for audit logging
CREATE TRIGGER trigger_log_impersonation_audit
AFTER INSERT OR UPDATE ON public.impersonation_sessions
FOR EACH ROW
EXECUTE FUNCTION public.log_impersonation_audit();