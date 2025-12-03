-- Create lovable_games table for game submissions
CREATE TABLE public.lovable_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  project_url TEXT NOT NULL,
  image_url TEXT,
  zip_url TEXT,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.lovable_games ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved games
CREATE POLICY "Anyone can view approved games"
ON public.lovable_games
FOR SELECT
USING (approved = true);

-- Authenticated users can submit games
CREATE POLICY "Authenticated users can submit games"
ON public.lovable_games
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can view their own submissions
CREATE POLICY "Users can view own submissions"
ON public.lovable_games
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all games
CREATE POLICY "Admins can view all games"
ON public.lovable_games
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update games (approve/reject)
CREATE POLICY "Admins can update games"
ON public.lovable_games
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete games
CREATE POLICY "Admins can delete games"
ON public.lovable_games
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.lovable_games;