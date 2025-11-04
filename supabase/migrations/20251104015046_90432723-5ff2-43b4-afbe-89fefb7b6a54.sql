-- 강의별 실시간 채팅 메시지 테이블 생성
CREATE TABLE public.course_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  user_role TEXT NOT NULL CHECK (user_role IN ('student', 'teacher', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_course_chat_messages_course_id ON public.course_chat_messages(course_id);
CREATE INDEX idx_course_chat_messages_created_at ON public.course_chat_messages(created_at DESC);

-- RLS 활성화
ALTER TABLE public.course_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 해당 코스에 등록된 학생과 강사만 메시지 조회 가능
CREATE POLICY "Users can view messages in their enrolled courses"
ON public.course_chat_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.enrollments
    WHERE enrollments.course_id = course_chat_messages.course_id
    AND enrollments.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('teacher', 'admin')
  )
);

-- RLS 정책: 해당 코스에 등록된 사용자만 메시지 작성 가능
CREATE POLICY "Users can create messages in their enrolled courses"
ON public.course_chat_messages
FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  AND (
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE enrollments.course_id = course_chat_messages.course_id
      AND enrollments.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('teacher', 'admin')
    )
  )
);

-- Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE public.course_chat_messages;