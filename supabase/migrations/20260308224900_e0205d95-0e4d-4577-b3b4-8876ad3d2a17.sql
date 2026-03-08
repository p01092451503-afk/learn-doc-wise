
-- Fix trigger_award_points_on_assignment to use student_id
CREATE OR REPLACE FUNCTION public.trigger_award_points_on_assignment()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_tenant_id UUID;
BEGIN
  IF NEW.status = 'graded' AND (OLD.status IS NULL OR OLD.status != 'graded') THEN
    SELECT tenant_id INTO v_tenant_id
    FROM public.user_roles
    WHERE user_id = NEW.student_id
    LIMIT 1;
    
    PERFORM public.award_points(NEW.student_id, v_tenant_id, GREATEST(5, FLOOR(COALESCE(NEW.score, 0) / 10)), 'assignment_completed', '과제 완료');
    PERFORM public.update_streak(NEW.student_id, v_tenant_id);
  END IF;
  
  RETURN NEW;
END;
$function$;
