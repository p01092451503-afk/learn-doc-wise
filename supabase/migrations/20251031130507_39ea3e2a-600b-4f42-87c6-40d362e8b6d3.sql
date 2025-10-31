-- 소셜 러닝 (Social Learning) 시스템

-- 1. 스터디 그룹 테이블
CREATE TABLE IF NOT EXISTS public.study_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  max_members INTEGER NOT NULL DEFAULT 10,
  is_public BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. 스터디 그룹 멤버 테이블
CREATE TABLE IF NOT EXISTS public.study_group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- 3. 스터디 그룹 게시글 테이블
CREATE TABLE IF NOT EXISTS public.study_group_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  post_type TEXT NOT NULL DEFAULT 'discussion' CHECK (post_type IN ('discussion', 'question', 'resource', 'announcement')),
  attachments JSONB DEFAULT '[]'::jsonb,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. 스터디 그룹 댓글 테이블
CREATE TABLE IF NOT EXISTS public.study_group_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.study_group_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES public.study_group_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. 멘토링 관계 테이블
CREATE TABLE IF NOT EXISTS public.mentoring_relationships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mentee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(mentor_id, mentee_id, course_id)
);

-- 6. 멘토링 세션 테이블
CREATE TABLE IF NOT EXISTS public.mentoring_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  relationship_id UUID NOT NULL REFERENCES public.mentoring_relationships(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  meeting_link TEXT,
  agenda TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  feedback_mentor TEXT,
  feedback_mentee TEXT,
  rating_mentor INTEGER CHECK (rating_mentor >= 1 AND rating_mentor <= 5),
  rating_mentee INTEGER CHECK (rating_mentee >= 1 AND rating_mentee <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. 동료 피드백 테이블
CREATE TABLE IF NOT EXISTS public.peer_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES public.assignment_submissions(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  strengths TEXT,
  improvements TEXT,
  comments TEXT,
  is_helpful BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS 정책 설정
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_group_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_group_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentoring_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentoring_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_feedback ENABLE ROW LEVEL SECURITY;

-- study_groups RLS
CREATE POLICY "Public groups are viewable by everyone"
  ON public.study_groups FOR SELECT
  USING (is_public = true AND is_active = true);

CREATE POLICY "Members can view their groups"
  ON public.study_groups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.study_group_members
      WHERE study_group_members.group_id = study_groups.id
        AND study_group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create study groups"
  ON public.study_groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group admins can update groups"
  ON public.study_groups FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.study_group_members
      WHERE study_group_members.group_id = study_groups.id
        AND study_group_members.user_id = auth.uid()
        AND study_group_members.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all groups"
  ON public.study_groups FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- study_group_members RLS
CREATE POLICY "Members can view group membership"
  ON public.study_group_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.study_group_members sgm
      WHERE sgm.group_id = study_group_members.group_id
        AND sgm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join public groups"
  ON public.study_group_members FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.study_groups
      WHERE study_groups.id = study_group_members.group_id
        AND study_groups.is_public = true
        AND study_groups.is_active = true
    )
  );

CREATE POLICY "Group admins can manage members"
  ON public.study_group_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.study_group_members sgm
      WHERE sgm.group_id = study_group_members.group_id
        AND sgm.user_id = auth.uid()
        AND sgm.role = 'admin'
    )
  );

-- study_group_posts RLS
CREATE POLICY "Members can view group posts"
  ON public.study_group_posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.study_group_members
      WHERE study_group_members.group_id = study_group_posts.group_id
        AND study_group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can create posts"
  ON public.study_group_posts FOR INSERT
  WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (
      SELECT 1 FROM public.study_group_members
      WHERE study_group_members.group_id = study_group_posts.group_id
        AND study_group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Authors can update their posts"
  ON public.study_group_posts FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their posts"
  ON public.study_group_posts FOR DELETE
  USING (auth.uid() = author_id);

-- study_group_comments RLS
CREATE POLICY "Members can view comments"
  ON public.study_group_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.study_group_posts
      JOIN public.study_group_members ON study_group_members.group_id = study_group_posts.group_id
      WHERE study_group_posts.id = study_group_comments.post_id
        AND study_group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can create comments"
  ON public.study_group_comments FOR INSERT
  WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (
      SELECT 1 FROM public.study_group_posts
      JOIN public.study_group_members ON study_group_members.group_id = study_group_posts.group_id
      WHERE study_group_posts.id = study_group_comments.post_id
        AND study_group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Authors can update their comments"
  ON public.study_group_comments FOR UPDATE
  USING (auth.uid() = author_id);

-- mentoring_relationships RLS
CREATE POLICY "Users can view their mentoring relationships"
  ON public.mentoring_relationships FOR SELECT
  USING (auth.uid() = mentor_id OR auth.uid() = mentee_id);

CREATE POLICY "Users can create mentoring relationships"
  ON public.mentoring_relationships FOR INSERT
  WITH CHECK (auth.uid() = mentor_id OR auth.uid() = mentee_id);

CREATE POLICY "Participants can update relationships"
  ON public.mentoring_relationships FOR UPDATE
  USING (auth.uid() = mentor_id OR auth.uid() = mentee_id);

CREATE POLICY "Admins can manage all relationships"
  ON public.mentoring_relationships FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- mentoring_sessions RLS
CREATE POLICY "Participants can view their sessions"
  ON public.mentoring_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.mentoring_relationships
      WHERE mentoring_relationships.id = mentoring_sessions.relationship_id
        AND (mentoring_relationships.mentor_id = auth.uid() OR mentoring_relationships.mentee_id = auth.uid())
    )
  );

CREATE POLICY "Participants can manage sessions"
  ON public.mentoring_sessions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.mentoring_relationships
      WHERE mentoring_relationships.id = mentoring_sessions.relationship_id
        AND (mentoring_relationships.mentor_id = auth.uid() OR mentoring_relationships.mentee_id = auth.uid())
    )
  );

-- peer_feedback RLS
CREATE POLICY "Users can view feedback they gave or received"
  ON public.peer_feedback FOR SELECT
  USING (auth.uid() = reviewer_id OR auth.uid() = reviewee_id);

CREATE POLICY "Users can create peer feedback"
  ON public.peer_feedback FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Reviewers can update their feedback"
  ON public.peer_feedback FOR UPDATE
  USING (auth.uid() = reviewer_id);

CREATE POLICY "Admins can view all feedback"
  ON public.peer_feedback FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 댓글 수 업데이트 트리거
CREATE OR REPLACE FUNCTION public.update_study_post_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.study_group_posts
    SET comments_count = comments_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.study_group_posts
    SET comments_count = GREATEST(0, comments_count - 1)
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER update_study_post_comments_count_trigger
  AFTER INSERT OR DELETE ON public.study_group_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_study_post_comments_count();

-- updated_at 트리거
CREATE TRIGGER update_study_groups_updated_at
  BEFORE UPDATE ON public.study_groups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_study_group_posts_updated_at
  BEFORE UPDATE ON public.study_group_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mentoring_relationships_updated_at
  BEFORE UPDATE ON public.mentoring_relationships
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mentoring_sessions_updated_at
  BEFORE UPDATE ON public.mentoring_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();