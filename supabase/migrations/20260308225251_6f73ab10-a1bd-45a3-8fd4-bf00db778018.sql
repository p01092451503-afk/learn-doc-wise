
CREATE OR REPLACE FUNCTION public.trigger_award_points_on_community()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_tenant_id UUID;
BEGIN
  SELECT tenant_id INTO v_tenant_id
  FROM public.user_roles
  WHERE user_id = NEW.author_id
  LIMIT 1;
  
  IF TG_TABLE_NAME = 'community_posts' THEN
    PERFORM public.award_points(NEW.author_id, v_tenant_id, 5, 'community_post', '게시글 작성');
  ELSIF TG_TABLE_NAME = 'community_comments' THEN
    PERFORM public.award_points(NEW.author_id, v_tenant_id, 2, 'community_comment', '댓글 작성');
  END IF;
  
  RETURN NEW;
END;
$function$;
