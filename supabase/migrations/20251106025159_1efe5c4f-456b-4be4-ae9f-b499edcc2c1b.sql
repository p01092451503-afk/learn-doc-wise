-- Add columns to courses table for VOD/LIVE distinction
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS course_type text NOT NULL DEFAULT 'vod' CHECK (course_type IN ('vod', 'live')),
ADD COLUMN IF NOT EXISTS live_meeting_url text,
ADD COLUMN IF NOT EXISTS live_meeting_provider text CHECK (live_meeting_provider IN ('zoom', 'google_meet', 'teams', 'other')),
ADD COLUMN IF NOT EXISTS live_scheduled_at timestamp with time zone;

-- Add comment for clarity
COMMENT ON COLUMN public.courses.course_type IS 'Type of course: vod (video on demand) or live (live session)';
COMMENT ON COLUMN public.courses.live_meeting_url IS 'Meeting URL for live courses (Zoom, Google Meet, etc.)';
COMMENT ON COLUMN public.courses.live_meeting_provider IS 'Provider of the live meeting platform';
COMMENT ON COLUMN public.courses.live_scheduled_at IS 'Scheduled start time for live courses';