-- Create Camly Coin transactions table
CREATE TABLE IF NOT EXISTS public.camly_coin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.camly_coin_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view their own transactions"
ON public.camly_coin_transactions
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own transactions
CREATE POLICY "Users can insert their own transactions"
ON public.camly_coin_transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_camly_coin_transactions_user_id ON public.camly_coin_transactions(user_id);
CREATE INDEX idx_camly_coin_transactions_created_at ON public.camly_coin_transactions(created_at DESC);