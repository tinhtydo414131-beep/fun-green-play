-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create table to track combo period winners
CREATE TABLE public.combo_period_winners (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id),
  period_type text NOT NULL CHECK (period_type IN ('daily', 'weekly')),
  period_start timestamp with time zone NOT NULL,
  period_end timestamp with time zone NOT NULL,
  highest_combo integer NOT NULL,
  prize_amount numeric NOT NULL DEFAULT 0,
  prize_type text NOT NULL DEFAULT 'tokens',
  claimed boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.combo_period_winners ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Winners are viewable by everyone"
  ON public.combo_period_winners
  FOR SELECT
  USING (true);

CREATE POLICY "Users can claim their own prizes"
  ON public.combo_period_winners
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_combo_winners_user_id ON public.combo_period_winners(user_id);
CREATE INDEX idx_combo_winners_period ON public.combo_period_winners(period_type, period_start);
CREATE INDEX idx_combo_winners_unclaimed ON public.combo_period_winners(user_id, claimed) WHERE claimed = false;

-- Create table to track current active combo periods
CREATE TABLE public.combo_active_periods (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  period_type text NOT NULL CHECK (period_type IN ('daily', 'weekly')),
  period_start timestamp with time zone NOT NULL,
  period_end timestamp with time zone NOT NULL,
  top_combo integer NOT NULL DEFAULT 0,
  top_user_id uuid REFERENCES profiles(id),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(period_type, period_start)
);

-- Enable RLS
ALTER TABLE public.combo_active_periods ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Active periods are viewable by everyone"
  ON public.combo_active_periods
  FOR SELECT
  USING (true);

-- Create index
CREATE INDEX idx_active_periods_type ON public.combo_active_periods(period_type, is_active);

-- Initialize current periods
INSERT INTO public.combo_active_periods (period_type, period_start, period_end, is_active)
VALUES 
  ('daily', date_trunc('day', now()), date_trunc('day', now() + interval '1 day'), true),
  ('weekly', date_trunc('week', now()), date_trunc('week', now() + interval '1 week'), true);