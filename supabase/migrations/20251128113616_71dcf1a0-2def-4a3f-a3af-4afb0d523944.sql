-- Create table for combo challenge templates
CREATE TABLE public.combo_challenges (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  challenge_type text NOT NULL CHECK (challenge_type IN ('time_limit', 'no_miss', 'consecutive', 'value_target', 'level_specific')),
  target_combo integer NOT NULL,
  time_limit_seconds integer,
  required_level integer,
  prize_amount numeric NOT NULL DEFAULT 50,
  prize_type text NOT NULL DEFAULT 'tokens',
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard', 'extreme')),
  icon text DEFAULT '🎯',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table for daily challenges (rotates daily)
CREATE TABLE public.daily_combo_challenges (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id uuid NOT NULL REFERENCES combo_challenges(id),
  challenge_date date NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  total_completions integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table to track user progress on challenges
CREATE TABLE public.user_challenge_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id),
  daily_challenge_id uuid NOT NULL REFERENCES daily_combo_challenges(id),
  current_combo integer NOT NULL DEFAULT 0,
  highest_combo integer NOT NULL DEFAULT 0,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  time_taken_seconds integer,
  missed_count integer NOT NULL DEFAULT 0,
  prize_claimed boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, daily_challenge_id)
);

-- Enable RLS
ALTER TABLE public.combo_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_combo_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenge_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for combo_challenges
CREATE POLICY "Challenges are viewable by everyone"
  ON public.combo_challenges
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage challenges"
  ON public.combo_challenges
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for daily_combo_challenges
CREATE POLICY "Daily challenges are viewable by everyone"
  ON public.daily_combo_challenges
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage daily challenges"
  ON public.daily_combo_challenges
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for user_challenge_progress
CREATE POLICY "Users can view their own progress"
  ON public.user_challenge_progress
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON public.user_challenge_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.user_challenge_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_daily_challenges_date ON public.daily_combo_challenges(challenge_date, is_active);
CREATE INDEX idx_user_progress_user_daily ON public.user_challenge_progress(user_id, daily_challenge_id);
CREATE INDEX idx_user_progress_completed ON public.user_challenge_progress(completed_at, prize_claimed);

-- Add trigger for updated_at
CREATE TRIGGER update_user_challenge_progress_updated_at
  BEFORE UPDATE ON public.user_challenge_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert challenge templates
INSERT INTO public.combo_challenges (title, description, challenge_type, target_combo, time_limit_seconds, prize_amount, difficulty, icon) VALUES
  ('Speed Demon', 'Đạt 30x combo trong vòng 5 phút', 'time_limit', 30, 300, 100, 'medium', '⚡'),
  ('Perfect Streak', 'Đạt 50x combo không bỏ lỡ lần nào', 'no_miss', 50, NULL, 200, 'hard', '💎'),
  ('Quick Combo', 'Đạt 20x combo trong vòng 2 phút', 'time_limit', 20, 120, 50, 'easy', '🎯'),
  ('Combo Master', 'Đạt 100x combo không bỏ lỡ lần nào', 'no_miss', 100, NULL, 500, 'extreme', '👑'),
  ('Lightning Fast', 'Đạt 40x combo trong vòng 3 phút', 'time_limit', 40, 180, 150, 'medium', '⚡'),
  ('Value Hunter', 'Thu thập 5000 gold với combo liên tục', 'value_target', 25, NULL, 120, 'medium', '💰'),
  ('Level 5 Champion', 'Đạt 35x combo ở level 5', 'level_specific', 35, NULL, 180, 'hard', '🏆'),
  ('Beginner Luck', 'Đạt 15x combo không bỏ lỡ', 'no_miss', 15, NULL, 30, 'easy', '🍀'),
  ('Time Attack', 'Đạt 60x combo trong 10 phút', 'time_limit', 60, 600, 250, 'hard', '⏱️'),
  ('Flawless Victory', 'Đạt 75x combo không bỏ lỡ', 'no_miss', 75, NULL, 350, 'extreme', '✨');

-- Initialize today's challenge
INSERT INTO public.daily_combo_challenges (challenge_id, challenge_date, expires_at, is_active)
SELECT 
  id,
  CURRENT_DATE,
  date_trunc('day', now() + interval '1 day'),
  true
FROM public.combo_challenges
WHERE is_active = true
ORDER BY RANDOM()
LIMIT 1;