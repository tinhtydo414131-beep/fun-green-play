-- Create table for user tokens and game stats
CREATE TABLE public.user_nexus_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  nexus_tokens INTEGER NOT NULL DEFAULT 0,
  total_score INTEGER NOT NULL DEFAULT 0,
  highest_tile INTEGER NOT NULL DEFAULT 0,
  games_played INTEGER NOT NULL DEFAULT 0,
  daily_streak INTEGER NOT NULL DEFAULT 0,
  last_login_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_nexus_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own stats"
  ON public.user_nexus_stats
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats"
  ON public.user_nexus_stats
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats"
  ON public.user_nexus_stats
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create leaderboard table
CREATE TABLE public.nexus_leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  highest_tile INTEGER NOT NULL,
  level_reached INTEGER NOT NULL DEFAULT 1,
  time_played INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  week_start DATE NOT NULL
);

-- Enable RLS
ALTER TABLE public.nexus_leaderboard ENABLE ROW LEVEL SECURITY;

-- RLS Policies for leaderboard (public read, users can insert their own)
CREATE POLICY "Leaderboard is viewable by everyone"
  ON public.nexus_leaderboard
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own scores"
  ON public.nexus_leaderboard
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index for leaderboard queries
CREATE INDEX idx_leaderboard_week_score ON public.nexus_leaderboard(week_start DESC, score DESC);
CREATE INDEX idx_leaderboard_alltime ON public.nexus_leaderboard(score DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_nexus_stats_updated_at
  BEFORE UPDATE ON public.user_nexus_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();