-- Enable realtime for impersonation_sessions table
ALTER TABLE public.impersonation_sessions REPLICA IDENTITY FULL;

-- Add table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.impersonation_sessions;