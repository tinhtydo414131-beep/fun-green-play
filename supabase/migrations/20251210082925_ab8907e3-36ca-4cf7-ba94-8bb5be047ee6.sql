-- Add soft delete columns to uploaded_games table
ALTER TABLE public.uploaded_games 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS delete_reason TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS delete_reason_detail TEXT DEFAULT NULL;

-- Create index for efficient trash queries
CREATE INDEX IF NOT EXISTS idx_uploaded_games_deleted_at ON public.uploaded_games(deleted_at);

-- Create a function to auto-permanently delete games after 30 days
CREATE OR REPLACE FUNCTION public.cleanup_old_deleted_games()
RETURNS void AS $$
BEGIN
  DELETE FROM public.uploaded_games 
  WHERE deleted_at IS NOT NULL 
  AND deleted_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies to filter out deleted games by default for normal queries
-- but allow users to see their own deleted games

DROP POLICY IF EXISTS "Users can view their own games" ON public.uploaded_games;
CREATE POLICY "Users can view their own games" 
ON public.uploaded_games 
FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own games" ON public.uploaded_games;
CREATE POLICY "Users can update their own games" 
ON public.uploaded_games 
FOR UPDATE 
USING (auth.uid() = user_id);