-- 플랫폼 버전 관리 테이블
CREATE TABLE IF NOT EXISTS public.platform_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  version VARCHAR(20) NOT NULL,
  release_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  release_type VARCHAR(20) NOT NULL DEFAULT 'minor',
  title TEXT NOT NULL,
  description TEXT,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  tech_changes JSONB DEFAULT '[]'::jsonb,
  breaking_changes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  is_published BOOLEAN NOT NULL DEFAULT true
);

-- 기술 스택 정보 테이블
CREATE TABLE IF NOT EXISTS public.tech_stack (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  name TEXT NOT NULL,
  version TEXT,
  description TEXT,
  purpose TEXT,
  documentation_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_core BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS 정책
ALTER TABLE public.platform_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tech_stack ENABLE ROW LEVEL SECURITY;

-- 운영자만 관리 가능
CREATE POLICY "Operators can manage versions"
  ON public.platform_versions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'operator'
    )
  );

CREATE POLICY "Operators can manage tech stack"
  ON public.tech_stack
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'operator'
    )
  );

-- 모든 인증된 사용자가 조회 가능
CREATE POLICY "Authenticated users can view versions"
  ON public.platform_versions
  FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_published = true);

CREATE POLICY "Authenticated users can view tech stack"
  ON public.tech_stack
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 초기 기술 스택 데이터 삽입
INSERT INTO public.tech_stack (category, name, version, description, purpose, documentation_url, display_order, is_core) VALUES
-- Frontend Framework
('Frontend', 'React', '18.3.1', 'A JavaScript library for building user interfaces', 'UI 컴포넌트 기반 프론트엔드 프레임워크', 'https://react.dev', 1, true),
('Frontend', 'TypeScript', '5.x', 'Typed superset of JavaScript', '타입 안정성과 개발자 경험 향상', 'https://www.typescriptlang.org', 2, true),
('Frontend', 'Vite', 'Latest', 'Next generation frontend tooling', '빠른 개발 서버와 빌드 도구', 'https://vitejs.dev', 3, true),

-- Styling
('Styling', 'Tailwind CSS', '3.x', 'A utility-first CSS framework', '유틸리티 기반 스타일링 시스템', 'https://tailwindcss.com', 10, true),
('Styling', 'shadcn/ui', 'Latest', 'Re-usable components built with Radix UI and Tailwind', '접근성 높은 UI 컴포넌트 라이브러리', 'https://ui.shadcn.com', 11, true),
('Styling', 'Radix UI', 'Latest', 'Unstyled, accessible components', '접근성 중심 헤드리스 UI 컴포넌트', 'https://www.radix-ui.com', 12, true),

-- State Management & Data Fetching
('State Management', 'TanStack Query', '5.83.0', 'Powerful asynchronous state management', '서버 상태 관리 및 데이터 페칭', 'https://tanstack.com/query', 20, true),
('State Management', 'React Hook Form', '7.61.1', 'Performant, flexible forms', '폼 상태 관리 및 유효성 검사', 'https://react-hook-form.com', 21, true),
('State Management', 'Zod', '3.25.76', 'TypeScript-first schema validation', '타입 안전 스키마 검증', 'https://zod.dev', 22, true),

-- Routing
('Routing', 'React Router', '6.30.1', 'Declarative routing for React', '클라이언트 사이드 라우팅', 'https://reactrouter.com', 30, true),

-- Backend & Database
('Backend', 'Lovable Cloud', 'Latest', 'Integrated backend powered by Supabase', '통합 백엔드 서비스 (인증, 데이터베이스, 스토리지)', 'https://docs.lovable.dev', 40, true),
('Database', 'PostgreSQL', '15.x', 'Advanced open source database', 'Supabase를 통한 관계형 데이터베이스', 'https://www.postgresql.org', 41, true),
('Database', 'Row Level Security', 'Native', 'PostgreSQL row-level security policies', '데이터 접근 제어 및 보안', 'https://www.postgresql.org/docs/current/ddl-rowsecurity.html', 42, true),

-- AI & ML
('AI/ML', 'Lovable AI', 'Latest', 'Integrated AI capabilities', 'AI 튜터, 피드백, 번역, 채팅봇 기능', 'https://docs.lovable.dev', 50, true),
('AI/ML', 'OpenAI GPT', '5.x', 'Advanced language models (gpt-5, gpt-5-mini, gpt-5-nano)', 'AI 기반 학습 지원 및 콘텐츠 생성', 'https://openai.com', 51, true),
('AI/ML', 'Google Gemini', '2.5', 'Multimodal AI models (Pro, Flash, Flash-Lite)', 'AI 기반 분석 및 멀티모달 처리', 'https://deepmind.google/technologies/gemini', 52, true),

-- UI Libraries
('UI Components', 'Lucide React', '0.462.0', 'Beautiful & consistent icon library', '일관된 아이콘 시스템', 'https://lucide.dev', 60, true),
('UI Components', 'Recharts', '2.15.4', 'Composable charting library', '데이터 시각화 및 차트', 'https://recharts.org', 61, true),
('UI Components', 'Sonner', '1.7.4', 'Opinionated toast component', '알림 및 토스트 메시지', 'https://sonner.emilkowal.ski', 62, true),
('UI Components', 'Vaul', '0.9.9', 'Drawer component for React', '모바일 친화적 드로어 컴포넌트', 'https://vaul.emilkowal.ski', 63, true),

-- Video & Media
('Media', 'Vimeo Player', '2.30.1', 'Official Vimeo player SDK', '동영상 재생 및 관리', 'https://github.com/vimeo/player.js', 70, false),

-- Payment
('Payment', 'Toss Payments', '1.9.1', 'Korean payment gateway integration', '한국형 결제 시스템 통합', 'https://docs.tosspayments.com', 80, false),

-- Utilities
('Utilities', 'date-fns', '3.6.0', 'Modern JavaScript date utility library', '날짜 및 시간 처리', 'https://date-fns.org', 90, true),
('Utilities', 'XLSX', '0.18.5', 'Excel spreadsheet library', '엑셀 파일 처리 및 내보내기', 'https://sheetjs.com', 91, false),
('Utilities', 'DnD Kit', '6.3.1', 'Modern drag and drop toolkit', '드래그 앤 드롭 기능 구현', 'https://dndkit.com', 92, false),

-- Development Tools
('DevTools', 'ESLint', 'Latest', 'JavaScript linting utility', '코드 품질 및 일관성 유지', 'https://eslint.org', 100, true),
('DevTools', 'Class Variance Authority', '0.7.1', 'Component variant utility', '컴포넌트 변형 관리', 'https://cva.style', 101, true);

-- 초기 버전 데이터 삽입
INSERT INTO public.platform_versions (version, release_type, title, description, features, tech_changes) VALUES
('1.0.0', 'major', '초기 플랫폼 출시', 'LMS 플랫폼의 첫 번째 메이저 릴리스', 
  '[
    {"name": "사용자 인증 시스템", "description": "이메일 기반 회원가입 및 로그인"},
    {"name": "강의 관리 시스템", "description": "강의 생성, 수정, 삭제 및 콘텐츠 관리"},
    {"name": "수강 신청 시스템", "description": "학생 수강 신청 및 진도 관리"},
    {"name": "과제 제출 시스템", "description": "과제 생성, 제출, 채점 기능"},
    {"name": "출석 체크 시스템", "description": "IP 기반 출석 체크"},
    {"name": "커뮤니티 기능", "description": "강의별 게시판 및 댓글 시스템"},
    {"name": "결제 시스템", "description": "토스 페이먼츠 통합"},
    {"name": "게이미피케이션", "description": "포인트, 배지, 리더보드 시스템"},
    {"name": "학습 경로", "description": "맞춤형 학습 경로 생성 및 관리"},
    {"name": "AI 튜터", "description": "AI 기반 학습 지원 시스템"},
    {"name": "AI 피드백", "description": "과제 및 학습에 대한 AI 피드백"},
    {"name": "AI 번역", "description": "다국어 콘텐츠 번역 기능"},
    {"name": "AI 채팅봇", "description": "학습 도우미 챗봇"},
    {"name": "분석 대시보드", "description": "학습 분석 및 통계 시각화"},
    {"name": "다중 역할 시스템", "description": "학생, 교사, 관리자, 운영자 역할"},
    {"name": "멀티 테넌트 지원", "description": "SaaS 플랫폼 아키텍처"},
    {"name": "사용량 관리", "description": "테넌트별 사용량 추적 및 제한"},
    {"name": "실시간 모니터링", "description": "시스템 상태 및 로그 모니터링"}
  ]'::jsonb,
  '[
    {"name": "React 18.3.1", "description": "최신 React 기능 활용"},
    {"name": "TypeScript", "description": "타입 안정성 확보"},
    {"name": "Lovable Cloud", "description": "통합 백엔드 인프라"},
    {"name": "PostgreSQL with RLS", "description": "보안 강화된 데이터베이스"},
    {"name": "Lovable AI Integration", "description": "무료 AI 기능 제공"}
  ]'::jsonb
);