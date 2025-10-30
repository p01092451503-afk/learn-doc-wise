-- Step 1: app_role enum에 'operator' 추가
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'operator';