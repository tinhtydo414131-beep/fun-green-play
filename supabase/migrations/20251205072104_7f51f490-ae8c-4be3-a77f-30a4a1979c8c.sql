-- Fix web3_rewards table RLS policy to prevent public financial data exposure
-- Check current policies and update to require authentication

-- First, let's see what policies exist and fix them
DROP POLICY IF EXISTS "Users can view their own rewards" ON public.web3_rewards;
DROP POLICY IF EXISTS "Web3 rewards are viewable by everyone" ON public.web3_rewards;

-- Create secure policy: Users can only view their own rewards data
CREATE POLICY "Users can view their own rewards" 
ON public.web3_rewards 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);
