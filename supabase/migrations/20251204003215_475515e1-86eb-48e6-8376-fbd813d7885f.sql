-- Add streak column to web3_rewards table
ALTER TABLE public.web3_rewards 
ADD COLUMN IF NOT EXISTS daily_streak integer NOT NULL DEFAULT 0;

-- Make camly_balance publicly viewable for leaderboard (users can only update their own)
DROP POLICY IF EXISTS "Users can view their own rewards" ON public.web3_rewards;

CREATE POLICY "Anyone can view rewards for leaderboard" 
ON public.web3_rewards 
FOR SELECT 
USING (true);

-- Keep existing update policy for users to update only their own
-- (already exists: "Users can update their own rewards")