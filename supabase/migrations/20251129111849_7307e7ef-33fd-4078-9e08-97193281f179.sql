-- 1. test@test.com의 operator 역할 제거
DELETE FROM user_roles 
WHERE user_id = '0fc0ff3e-1729-454f-917a-83ac40021fed';

DELETE FROM memberships 
WHERE user_id = '0fc0ff3e-1729-454f-917a-83ac40021fed';

-- 2. test@test.com에 학생, 강사, 관리자 역할 부여 (operator 제외)
-- 기존 테넌트 ID 사용: 0c0be465-ff2d-4c0e-84a9-12bf4038653f
INSERT INTO user_roles (user_id, role, tenant_id)
VALUES 
  ('0fc0ff3e-1729-454f-917a-83ac40021fed', 'student', '0c0be465-ff2d-4c0e-84a9-12bf4038653f'),
  ('0fc0ff3e-1729-454f-917a-83ac40021fed', 'teacher', '0c0be465-ff2d-4c0e-84a9-12bf4038653f'),
  ('0fc0ff3e-1729-454f-917a-83ac40021fed', 'admin', '0c0be465-ff2d-4c0e-84a9-12bf4038653f');

INSERT INTO memberships (user_id, role, tenant_id, is_active)
VALUES 
  ('0fc0ff3e-1729-454f-917a-83ac40021fed', 'student', '0c0be465-ff2d-4c0e-84a9-12bf4038653f', true),
  ('0fc0ff3e-1729-454f-917a-83ac40021fed', 'instructor', '0c0be465-ff2d-4c0e-84a9-12bf4038653f', true),
  ('0fc0ff3e-1729-454f-917a-83ac40021fed', 'admin', '0c0be465-ff2d-4c0e-84a9-12bf4038653f', true);

-- 3. handle_new_user 트리거 함수 수정 - test@test.com은 operator 역할을 받지 못하도록
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Insert into profiles table
  INSERT INTO public.profiles (user_id, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NOW(),
    NOW()
  );

  -- DEMO ACCOUNT RESTRICTION: test@test.com should NOT get operator role
  IF NEW.email = 'test@test.com' THEN
    -- Do NOT give operator role to demo account
    RETURN NEW;
  END IF;

  -- For all other users: Insert operator role (platform-wide access)
  INSERT INTO public.memberships (user_id, tenant_id, role, is_active)
  VALUES (NEW.id, NULL, 'operator', true);

  -- Also insert into user_roles for backward compatibility
  INSERT INTO public.user_roles (user_id, role, created_at)
  VALUES (NEW.id, 'operator', NOW());

  RETURN NEW;
END;
$function$;