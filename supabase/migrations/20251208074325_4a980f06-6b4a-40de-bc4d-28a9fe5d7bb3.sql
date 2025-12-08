-- Add new role types for FUN Planet (kid, parent, dev)
-- First check if new values need to be added to app_role enum

-- Safely add new enum values if they don't exist
DO $$ 
BEGIN
  -- Add 'kid' if not exists
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'kid' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'app_role')) THEN
    ALTER TYPE app_role ADD VALUE 'kid';
  END IF;
  
  -- Add 'parent' if not exists
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'parent' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'app_role')) THEN
    ALTER TYPE app_role ADD VALUE 'parent';
  END IF;
  
  -- Add 'dev' if not exists
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'dev' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'app_role')) THEN
    ALTER TYPE app_role ADD VALUE 'dev';
  END IF;
END $$;

-- Create user_role_selection table to track if user has selected their role
CREATE TABLE IF NOT EXISTS public.user_role_selections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  selected_role text NOT NULL CHECK (selected_role IN ('kid', 'parent', 'dev')),
  selected_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.user_role_selections ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own role selection"
ON public.user_role_selections
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own role selection"
ON public.user_role_selections
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own role selection"
ON public.user_role_selections
FOR UPDATE
USING (auth.uid() = user_id);

-- Create charity_wallet_stats table for tracking donations
CREATE TABLE IF NOT EXISTS public.charity_wallet_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total_donated numeric NOT NULL DEFAULT 0,
  total_transactions integer NOT NULL DEFAULT 0,
  last_updated timestamp with time zone NOT NULL DEFAULT now()
);

-- Insert initial row if not exists
INSERT INTO public.charity_wallet_stats (id, total_donated, total_transactions)
SELECT gen_random_uuid(), 0, 0
WHERE NOT EXISTS (SELECT 1 FROM public.charity_wallet_stats);

-- Allow everyone to view charity stats
ALTER TABLE public.charity_wallet_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view charity stats"
ON public.charity_wallet_stats
FOR SELECT
USING (true);