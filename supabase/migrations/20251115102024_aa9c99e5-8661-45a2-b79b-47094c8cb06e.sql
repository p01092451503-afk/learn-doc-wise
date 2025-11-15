-- Create storage bucket for assignment submissions
INSERT INTO storage.buckets (id, name, public)
VALUES ('assignment-files', 'assignment-files', false)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for assignment files
CREATE POLICY "Users can upload their own assignment files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'assignment-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own assignment files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'assignment-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Teachers can view all assignment files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'assignment-files'
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('teacher', 'admin', 'operator')
  )
);

CREATE POLICY "Users can delete their own assignment files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'assignment-files'
  AND auth.uid()::text = (storage.foldername(name))[1]
);