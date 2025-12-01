-- Create game categories enum
CREATE TYPE public.game_category AS ENUM ('action', 'puzzle', 'adventure', 'casual', 'educational', 'racing', 'sports', 'arcade');

-- Create game status enum
CREATE TYPE public.game_status AS ENUM ('pending', 'approved', 'rejected');

-- Create uploaded_games table
CREATE TABLE public.uploaded_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category public.game_category NOT NULL,
  tags TEXT[],
  game_file_path TEXT NOT NULL,
  thumbnail_path TEXT,
  status public.game_status NOT NULL DEFAULT 'pending',
  play_count INTEGER NOT NULL DEFAULT 0,
  download_count INTEGER NOT NULL DEFAULT 0,
  rating NUMERIC(2,1) DEFAULT 0,
  rating_count INTEGER NOT NULL DEFAULT 0,
  rejection_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES profiles(id)
);

-- Create game_reviews table
CREATE TABLE public.game_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES uploaded_games(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status public.game_status NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create game_plays table to track who played what
CREATE TABLE public.game_plays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES uploaded_games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  played_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(game_id, user_id)
);

-- Enable RLS
ALTER TABLE public.uploaded_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_plays ENABLE ROW LEVEL SECURITY;

-- RLS Policies for uploaded_games
CREATE POLICY "Anyone can view approved games"
  ON public.uploaded_games
  FOR SELECT
  USING (status = 'approved' OR auth.uid() = user_id);

CREATE POLICY "Users can upload their own games"
  ON public.uploaded_games
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their pending games"
  ON public.uploaded_games
  FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can update any game"
  ON public.uploaded_games
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for game_reviews
CREATE POLICY "Admins can create reviews"
  ON public.game_reviews
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view reviews of their games"
  ON public.game_reviews
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM uploaded_games 
      WHERE id = game_reviews.game_id 
      AND user_id = auth.uid()
    ) OR has_role(auth.uid(), 'admin')
  );

-- RLS Policies for game_plays
CREATE POLICY "Users can insert their own plays"
  ON public.game_plays
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own plays"
  ON public.game_plays
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create storage bucket for uploaded games
INSERT INTO storage.buckets (id, name, public) 
VALUES ('uploaded-games', 'uploaded-games', true);

-- Storage policies for uploaded games
CREATE POLICY "Users can upload their own game files"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'uploaded-games' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view game files"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'uploaded-games');

CREATE POLICY "Users can update their own game files"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'uploaded-games' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own game files"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'uploaded-games' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Trigger to update updated_at
CREATE TRIGGER update_uploaded_games_updated_at
  BEFORE UPDATE ON public.uploaded_games
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();