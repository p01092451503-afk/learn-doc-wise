-- Allow NULL for max_students to support unlimited plans
ALTER TABLE public.tenants 
ALTER COLUMN max_students DROP NOT NULL;