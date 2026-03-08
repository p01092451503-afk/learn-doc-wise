
-- Fix check_and_award_badges to use student_id for assignment_submissions
CREATE OR REPLACE FUNCTION public.check_and_award_badges(p_user_id uuid, p_tenant_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  badge_record RECORD;
  user_value INTEGER;
BEGIN
  FOR badge_record IN 
    SELECT * FROM public.badges 
    WHERE (tenant_id = p_tenant_id OR tenant_id IS NULL)
    AND id NOT IN (SELECT badge_id FROM public.user_badges WHERE user_id = p_user_id)
  LOOP
    user_value := 0;
    
    CASE badge_record.requirement_type
      WHEN 'points' THEN
        SELECT total_points INTO user_value
        FROM public.user_gamification
        WHERE user_id = p_user_id AND tenant_id = p_tenant_id;
      WHEN 'streak' THEN
        SELECT streak_days INTO user_value
        FROM public.user_gamification
        WHERE user_id = p_user_id AND tenant_id = p_tenant_id;
      WHEN 'courses_completed' THEN
        SELECT COUNT(*) INTO user_value
        FROM public.enrollments
        WHERE user_id = p_user_id AND completed_at IS NOT NULL;
      WHEN 'lessons_completed' THEN
        SELECT COUNT(*) INTO user_value
        FROM public.content_progress
        WHERE user_id = p_user_id AND completed = true;
      WHEN 'assignments_completed' THEN
        SELECT COUNT(*) INTO user_value
        FROM public.assignment_submissions
        WHERE student_id = p_user_id AND status = 'graded';
    END CASE;
    
    IF user_value >= badge_record.requirement_value THEN
      INSERT INTO public.user_badges (user_id, badge_id)
      VALUES (p_user_id, badge_record.id)
      ON CONFLICT (user_id, badge_id) DO NOTHING;
    END IF;
  END LOOP;
END;
$function$;
