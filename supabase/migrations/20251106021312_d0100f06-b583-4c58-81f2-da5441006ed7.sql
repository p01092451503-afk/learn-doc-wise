-- 라이브 세션 테이블
CREATE TABLE IF NOT EXISTS public.live_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  instructor_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended')),
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  meeting_url TEXT,
  max_participants INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 라이브 세션 참여자 테이블
CREATE TABLE IF NOT EXISTS public.live_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.live_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  is_online BOOLEAN DEFAULT true,
  UNIQUE(session_id, user_id)
);

-- 라이브 채팅 메시지 테이블
CREATE TABLE IF NOT EXISTS public.live_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.live_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 라이브 세션
CREATE POLICY "Anyone can view live sessions"
  ON public.live_sessions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teachers and admins can create sessions"
  ON public.live_sessions FOR INSERT
  TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'teacher'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Instructors and admins can update their sessions"
  ON public.live_sessions FOR UPDATE
  TO authenticated
  USING (
    instructor_id = auth.uid() OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Admins can delete sessions"
  ON public.live_sessions FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS 정책: 참여자
CREATE POLICY "Users can view participants in their sessions"
  ON public.live_participants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.live_sessions ls
      WHERE ls.id = session_id
    )
  );

CREATE POLICY "Users can join sessions"
  ON public.live_participants FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own participation"
  ON public.live_participants FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS 정책: 채팅
CREATE POLICY "Users can view chat in their sessions"
  ON public.live_chat_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.live_participants lp
      WHERE lp.session_id = live_chat_messages.session_id
        AND lp.user_id = auth.uid()
    )
  );

CREATE POLICY "Participants can send messages"
  ON public.live_chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.live_participants lp
      WHERE lp.session_id = live_chat_messages.session_id
        AND lp.user_id = auth.uid()
        AND lp.is_online = true
    )
  );

-- Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_chat_messages;

-- 업데이트 트리거
CREATE TRIGGER update_live_sessions_updated_at
  BEFORE UPDATE ON public.live_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 인덱스 생성
CREATE INDEX idx_live_sessions_status ON public.live_sessions(status);
CREATE INDEX idx_live_sessions_scheduled ON public.live_sessions(scheduled_at);
CREATE INDEX idx_live_participants_session ON public.live_participants(session_id);
CREATE INDEX idx_live_participants_online ON public.live_participants(session_id, is_online);
CREATE INDEX idx_live_chat_session ON public.live_chat_messages(session_id, created_at);