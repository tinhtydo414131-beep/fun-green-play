-- Create table for storing wallet auth nonces (challenges)
CREATE TABLE public.wallet_auth_nonces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL,
  nonce text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '5 minutes'),
  used boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wallet_auth_nonces ENABLE ROW LEVEL SECURITY;

-- Index for faster lookups
CREATE INDEX idx_wallet_auth_nonces_nonce ON public.wallet_auth_nonces(nonce);
CREATE INDEX idx_wallet_auth_nonces_expires ON public.wallet_auth_nonces(expires_at);

-- Cleanup job - delete expired nonces (can be called by cron or edge function)
CREATE OR REPLACE FUNCTION public.cleanup_expired_nonces()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.wallet_auth_nonces WHERE expires_at < now();
END;
$$;