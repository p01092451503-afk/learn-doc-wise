-- 메뉴 순서 설정을 저장하는 테이블 생성
CREATE TABLE IF NOT EXISTS public.menu_order (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_role TEXT NOT NULL,
  menu_items JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_role)
);

-- RLS 정책 활성화
ALTER TABLE public.menu_order ENABLE ROW LEVEL SECURITY;

-- 관리자만 메뉴 순서를 조회할 수 있음
CREATE POLICY "Admins can view menu order"
  ON public.menu_order
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 관리자만 메뉴 순서를 삽입할 수 있음
CREATE POLICY "Admins can insert menu order"
  ON public.menu_order
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 관리자만 메뉴 순서를 업데이트할 수 있음
CREATE POLICY "Admins can update menu order"
  ON public.menu_order
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 관리자만 메뉴 순서를 삭제할 수 있음
CREATE POLICY "Admins can delete menu order"
  ON public.menu_order
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_menu_order_updated_at
  BEFORE UPDATE ON public.menu_order
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();