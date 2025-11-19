-- Update handle_new_user function to assign operator role to all new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

  -- Insert operator role (platform-wide access)
  INSERT INTO public.memberships (user_id, tenant_id, role, is_active)
  VALUES (NEW.id, NULL, 'operator', true);

  -- Also insert into user_roles for backward compatibility
  INSERT INTO public.user_roles (user_id, role, created_at)
  VALUES (NEW.id, 'operator', NOW());

  RETURN NEW;
END;
$function$;