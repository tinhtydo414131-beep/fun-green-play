-- Create gold_miner_combos table to track highest combos
CREATE TABLE IF NOT EXISTS public.gold_miner_combos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  highest_combo INTEGER NOT NULL DEFAULT 0,
  level_achieved INTEGER NOT NULL DEFAULT 1,
  total_value INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.gold_miner_combos ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view combo records
CREATE POLICY "Combo records are viewable by everyone"
ON public.gold_miner_combos
FOR SELECT
USING (true);

-- Policy: Users can insert their own combo records
CREATE POLICY "Users can insert their own combo records"
ON public.gold_miner_combos
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own combo records
CREATE POLICY "Users can update their own combo records"
ON public.gold_miner_combos
FOR UPDATE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_gold_miner_combos_highest ON public.gold_miner_combos(highest_combo DESC);
CREATE INDEX idx_gold_miner_combos_user ON public.gold_miner_combos(user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_gold_miner_combos_updated_at
  BEFORE UPDATE ON public.gold_miner_combos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();