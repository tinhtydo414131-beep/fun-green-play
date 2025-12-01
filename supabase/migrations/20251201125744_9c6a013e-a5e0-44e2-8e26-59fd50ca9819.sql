-- Drop old wallet_transactions table
DROP TABLE IF EXISTS public.wallet_transactions CASCADE;

-- Create new wallet_transactions table with improved structure
CREATE TABLE public.wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  to_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  amount numeric NOT NULL,
  token_type text NOT NULL DEFAULT 'BNB',
  transaction_hash text,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  gas_fee numeric,
  transaction_type text NOT NULL DEFAULT 'transfer', -- 'transfer', 'airdrop'
  recipients_count integer,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions (sent or received)
CREATE POLICY "Users can view their transactions"
ON public.wallet_transactions
FOR SELECT
USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- Users can create transactions (as sender)
CREATE POLICY "Users can create transactions"
ON public.wallet_transactions
FOR INSERT
WITH CHECK (auth.uid() = from_user_id);

-- Enable real-time
ALTER TABLE public.wallet_transactions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wallet_transactions;

-- Create index for faster queries
CREATE INDEX idx_wallet_transactions_from_user ON public.wallet_transactions(from_user_id);
CREATE INDEX idx_wallet_transactions_to_user ON public.wallet_transactions(to_user_id);
CREATE INDEX idx_wallet_transactions_created_at ON public.wallet_transactions(created_at DESC);