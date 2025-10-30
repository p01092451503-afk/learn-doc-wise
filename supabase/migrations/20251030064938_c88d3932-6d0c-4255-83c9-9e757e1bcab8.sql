-- Create or replace the update_content_progress function
CREATE OR REPLACE FUNCTION update_content_progress(
  p_user_id UUID,
  p_content_id UUID,
  p_progress_percentage NUMERIC,
  p_last_position_seconds INTEGER DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO content_progress (
    user_id,
    content_id,
    progress_percentage,
    last_position_seconds,
    completed,
    completed_at,
    last_accessed_at
  )
  VALUES (
    p_user_id,
    p_content_id,
    p_progress_percentage,
    p_last_position_seconds,
    CASE WHEN p_progress_percentage >= 90 THEN true ELSE false END,
    CASE WHEN p_progress_percentage >= 90 THEN NOW() ELSE NULL END,
    NOW()
  )
  ON CONFLICT (user_id, content_id)
  DO UPDATE SET
    progress_percentage = GREATEST(content_progress.progress_percentage, p_progress_percentage),
    last_position_seconds = p_last_position_seconds,
    completed = CASE WHEN p_progress_percentage >= 90 THEN true ELSE content_progress.completed END,
    completed_at = CASE 
      WHEN p_progress_percentage >= 90 AND content_progress.completed_at IS NULL THEN NOW() 
      ELSE content_progress.completed_at 
    END,
    last_accessed_at = NOW();
END;
$$;