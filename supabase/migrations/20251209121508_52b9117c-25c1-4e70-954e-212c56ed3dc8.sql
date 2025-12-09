-- Create storage policies for uploaded-games bucket (with unique names)
CREATE POLICY "Allow users to upload to uploaded-games bucket" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'uploaded-games' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow public read access to uploaded-games" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'uploaded-games');

-- Ensure uploaded_games table has proper RLS policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'uploaded_games' AND policyname = 'Users can insert own games'
  ) THEN
    ALTER TABLE public.uploaded_games ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Allow users to insert their own games
CREATE POLICY "Users can insert own games" 
ON public.uploaded_games 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow viewing all approved games or own games
CREATE POLICY "View approved or own games" 
ON public.uploaded_games 
FOR SELECT 
USING (status = 'approved' OR auth.uid() = user_id);

-- Allow users to update their own games
CREATE POLICY "Update own games" 
ON public.uploaded_games 
FOR UPDATE 
USING (auth.uid() = user_id);