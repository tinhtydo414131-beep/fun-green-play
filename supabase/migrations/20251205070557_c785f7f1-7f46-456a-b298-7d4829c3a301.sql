-- RLS policies for wallet_auth_nonces - only edge function (service role) should access this table
-- No user-facing policies needed since it's managed by the edge function with service role

-- Policy to allow service role to manage nonces (implicit with service role)
-- Users should never directly access this table - it's internal to the auth flow
CREATE POLICY "Service role only" ON public.wallet_auth_nonces
FOR ALL USING (false) WITH CHECK (false);