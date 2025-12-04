-- Create table for tracking web3 rewards and balances
CREATE TABLE public.web3_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  wallet_address TEXT,
  camly_balance NUMERIC NOT NULL DEFAULT 0,
  first_wallet_claimed BOOLEAN NOT NULL DEFAULT false,
  first_game_claimed BOOLEAN NOT NULL DEFAULT false,
  last_daily_checkin DATE,
  total_claimed_to_wallet NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_reward UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.web3_rewards ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own rewards"
ON public.web3_rewards FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own rewards"
ON public.web3_rewards FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rewards"
ON public.web3_rewards FOR UPDATE
USING (auth.uid() = user_id);

-- Create table for reward transactions log
CREATE TABLE public.web3_reward_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  reward_type TEXT NOT NULL,
  description TEXT,
  transaction_hash TEXT,
  claimed_to_wallet BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.web3_reward_transactions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own reward transactions"
ON public.web3_reward_transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reward transactions"
ON public.web3_reward_transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_web3_rewards_updated_at
BEFORE UPDATE ON public.web3_rewards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();