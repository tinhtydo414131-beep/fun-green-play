-- Create table for uploaded game ratings
CREATE TABLE IF NOT EXISTS uploaded_game_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES uploaded_games(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(game_id, user_id)
);

-- Create table for uploaded game comments
CREATE TABLE IF NOT EXISTS uploaded_game_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES uploaded_games(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  comment text NOT NULL CHECK (char_length(comment) > 0 AND char_length(comment) <= 1000),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE uploaded_game_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_game_comments ENABLE ROW LEVEL SECURITY;

-- RLS policies for ratings
CREATE POLICY "Anyone can view ratings"
ON uploaded_game_ratings
FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own ratings"
ON uploaded_game_ratings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
ON uploaded_game_ratings
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings"
ON uploaded_game_ratings
FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for comments
CREATE POLICY "Anyone can view comments"
ON uploaded_game_comments
FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own comments"
ON uploaded_game_comments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
ON uploaded_game_comments
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON uploaded_game_comments
FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_uploaded_game_ratings_game_id ON uploaded_game_ratings(game_id);
CREATE INDEX idx_uploaded_game_ratings_user_id ON uploaded_game_ratings(user_id);
CREATE INDEX idx_uploaded_game_comments_game_id ON uploaded_game_comments(game_id);
CREATE INDEX idx_uploaded_game_comments_user_id ON uploaded_game_comments(user_id);
CREATE INDEX idx_uploaded_game_comments_created_at ON uploaded_game_comments(created_at DESC);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_uploaded_game_ratings_updated_at
BEFORE UPDATE ON uploaded_game_ratings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_uploaded_game_comments_updated_at
BEFORE UPDATE ON uploaded_game_comments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();