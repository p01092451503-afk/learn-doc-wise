-- 1. 출석 체크 시스템
CREATE TYPE attendance_status AS ENUM ('present', 'late', 'absent', 'excused');

CREATE TABLE public.attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL,
  content_id UUID NULL,
  attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in_time TIMESTAMP WITH TIME ZONE NULL,
  status attendance_status NOT NULL DEFAULT 'absent',
  ip_address INET NULL,
  notes TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id, attendance_date)
);

-- RLS 정책
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own attendance"
ON public.attendance FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Students can check in"
ON public.attendance FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Teachers can view course attendance"
ON public.attendance FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = attendance.course_id
    AND courses.instructor_id = auth.uid()
  )
);

CREATE POLICY "Teachers can manage course attendance"
ON public.attendance FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = attendance.course_id
    AND courses.instructor_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all attendance"
ON public.attendance FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- 트리거
CREATE TRIGGER update_attendance_updated_at
BEFORE UPDATE ON public.attendance
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 2. 커뮤니티 게시판
CREATE TYPE post_type AS ENUM ('discussion', 'question', 'announcement', 'notice');
CREATE TYPE post_status AS ENUM ('active', 'closed', 'pinned', 'deleted');

CREATE TABLE public.community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL,
  author_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  post_type post_type NOT NULL DEFAULT 'discussion',
  status post_status NOT NULL DEFAULT 'active',
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  views_count INTEGER NOT NULL DEFAULT 0,
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  tags TEXT[] NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS 정책
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active posts"
ON public.community_posts FOR SELECT
USING (status != 'deleted');

CREATE POLICY "Enrolled students can create posts"
ON public.community_posts FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM enrollments
    WHERE enrollments.course_id = community_posts.course_id
    AND enrollments.user_id = auth.uid()
  )
);

CREATE POLICY "Authors can update own posts"
ON public.community_posts FOR UPDATE
USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own posts"
ON public.community_posts FOR DELETE
USING (auth.uid() = author_id);

CREATE POLICY "Teachers can manage course posts"
ON public.community_posts FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = community_posts.course_id
    AND courses.instructor_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all posts"
ON public.community_posts FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- 트리거
CREATE TRIGGER update_community_posts_updated_at
BEFORE UPDATE ON public.community_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 3. 커뮤니티 댓글
CREATE TABLE public.community_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  parent_comment_id UUID NULL REFERENCES public.community_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER NOT NULL DEFAULT 0,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS 정책
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view non-deleted comments"
ON public.community_comments FOR SELECT
USING (is_deleted = false);

CREATE POLICY "Enrolled students can comment"
ON public.community_comments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM community_posts
    JOIN enrollments ON enrollments.course_id = community_posts.course_id
    WHERE community_posts.id = community_comments.post_id
    AND enrollments.user_id = auth.uid()
  )
);

CREATE POLICY "Authors can update own comments"
ON public.community_comments FOR UPDATE
USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own comments"
ON public.community_comments FOR DELETE
USING (auth.uid() = author_id);

CREATE POLICY "Admins can manage all comments"
ON public.community_comments FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- 트리거
CREATE TRIGGER update_community_comments_updated_at
BEFORE UPDATE ON public.community_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 댓글 수 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts
    SET comments_count = comments_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts
    SET comments_count = GREATEST(0, comments_count - 1)
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER update_comments_count_on_insert
AFTER INSERT ON public.community_comments
FOR EACH ROW
EXECUTE FUNCTION update_post_comments_count();

CREATE TRIGGER update_comments_count_on_delete
AFTER DELETE ON public.community_comments
FOR EACH ROW
EXECUTE FUNCTION update_post_comments_count();

-- 4. 좋아요 테이블
CREATE TABLE public.community_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  post_id UUID NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  comment_id UUID NULL REFERENCES public.community_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id),
  UNIQUE(user_id, comment_id),
  CHECK ((post_id IS NOT NULL AND comment_id IS NULL) OR (post_id IS NULL AND comment_id IS NOT NULL))
);

-- RLS 정책
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes"
ON public.community_likes FOR SELECT
USING (true);

CREATE POLICY "Users can like posts/comments"
ON public.community_likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike own likes"
ON public.community_likes FOR DELETE
USING (auth.uid() = user_id);

-- 좋아요 수 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.post_id IS NOT NULL THEN
      UPDATE community_posts
      SET likes_count = likes_count + 1
      WHERE id = NEW.post_id;
    ELSIF NEW.comment_id IS NOT NULL THEN
      UPDATE community_comments
      SET likes_count = likes_count + 1
      WHERE id = NEW.comment_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.post_id IS NOT NULL THEN
      UPDATE community_posts
      SET likes_count = GREATEST(0, likes_count - 1)
      WHERE id = OLD.post_id;
    ELSIF OLD.comment_id IS NOT NULL THEN
      UPDATE community_comments
      SET likes_count = GREATEST(0, likes_count - 1)
      WHERE id = OLD.comment_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER update_likes_count_on_insert
AFTER INSERT ON public.community_likes
FOR EACH ROW
EXECUTE FUNCTION update_likes_count();

CREATE TRIGGER update_likes_count_on_delete
AFTER DELETE ON public.community_likes
FOR EACH ROW
EXECUTE FUNCTION update_likes_count();

-- 5. 스토리지 사용량 추적
CREATE TABLE public.storage_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NULL,
  user_id UUID NULL,
  total_bytes BIGINT NOT NULL DEFAULT 0,
  video_bytes BIGINT NOT NULL DEFAULT 0,
  document_bytes BIGINT NOT NULL DEFAULT 0,
  image_bytes BIGINT NOT NULL DEFAULT 0,
  file_count INTEGER NOT NULL DEFAULT 0,
  last_calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id),
  UNIQUE(user_id)
);

-- RLS 정책
ALTER TABLE public.storage_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
ON public.storage_usage FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all usage"
ON public.storage_usage FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Operators can view tenant usage"
ON public.storage_usage FOR SELECT
USING (is_operator(auth.uid()));

CREATE POLICY "System can manage storage usage"
ON public.storage_usage FOR ALL
USING (true);

-- 트리거
CREATE TRIGGER update_storage_usage_updated_at
BEFORE UPDATE ON public.storage_usage
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 스토리지 제한 체크 함수
CREATE OR REPLACE FUNCTION check_storage_limit(
  p_tenant_id UUID,
  p_file_size BIGINT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_usage BIGINT;
  v_max_storage_gb INTEGER;
  v_max_bytes BIGINT;
BEGIN
  -- 현재 사용량 조회
  SELECT total_bytes INTO v_current_usage
  FROM storage_usage
  WHERE tenant_id = p_tenant_id;
  
  IF v_current_usage IS NULL THEN
    v_current_usage := 0;
  END IF;
  
  -- 테넌트의 최대 용량 조회
  SELECT max_storage_gb INTO v_max_storage_gb
  FROM tenants
  WHERE id = p_tenant_id;
  
  IF v_max_storage_gb IS NULL THEN
    v_max_storage_gb := 10; -- 기본값 10GB
  END IF;
  
  v_max_bytes := v_max_storage_gb::BIGINT * 1073741824; -- GB to Bytes
  
  -- 용량 체크
  RETURN (v_current_usage + p_file_size) <= v_max_bytes;
END;
$$;

-- 인덱스 생성
CREATE INDEX idx_attendance_user_course ON public.attendance(user_id, course_id);
CREATE INDEX idx_attendance_date ON public.attendance(attendance_date);
CREATE INDEX idx_community_posts_course ON public.community_posts(course_id);
CREATE INDEX idx_community_posts_author ON public.community_posts(author_id);
CREATE INDEX idx_community_posts_created ON public.community_posts(created_at DESC);
CREATE INDEX idx_community_comments_post ON public.community_comments(post_id);
CREATE INDEX idx_community_comments_author ON public.community_comments(author_id);
CREATE INDEX idx_community_likes_user ON public.community_likes(user_id);
CREATE INDEX idx_storage_usage_tenant ON public.storage_usage(tenant_id);
CREATE INDEX idx_storage_usage_user ON public.storage_usage(user_id);