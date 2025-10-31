-- 보안 경고 수정: leaderboard 뷰를 일반 뷰로 재생성

DROP VIEW IF EXISTS public.leaderboard;

CREATE VIEW public.leaderboard 
WITH (security_invoker=true)
AS
SELECT 
  ug.user_id,
  p.full_name,
  p.avatar_url,
  ug.total_points,
  ug.level,
  ug.tenant_id,
  ROW_NUMBER() OVER (PARTITION BY ug.tenant_id ORDER BY ug.total_points DESC) as rank
FROM public.user_gamification ug
JOIN public.profiles p ON ug.user_id = p.user_id
ORDER BY ug.tenant_id, ug.total_points DESC;