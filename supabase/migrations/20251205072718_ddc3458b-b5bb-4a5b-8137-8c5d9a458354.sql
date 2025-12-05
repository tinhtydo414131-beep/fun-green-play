-- Make chat storage buckets private and add proper RLS policies

-- Update chat-attachments bucket to be private
UPDATE storage.buckets SET public = false WHERE id = 'chat-attachments';

-- Update voice-messages bucket to be private
UPDATE storage.buckets SET public = false WHERE id = 'voice-messages';

-- Drop any existing policies on these buckets
DROP POLICY IF EXISTS "Chat attachments are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload chat attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can view chat attachments" ON storage.objects;
DROP POLICY IF EXISTS "Voice messages are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload voice messages" ON storage.objects;
DROP POLICY IF EXISTS "Users can view voice messages" ON storage.objects;

-- Create secure policies for chat-attachments bucket
-- Users can upload their own attachments
CREATE POLICY "Users can upload chat attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'chat-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can view attachments in chat rooms they're members of
CREATE POLICY "Users can view chat attachments"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'chat-attachments' AND (
    -- User uploaded it
    auth.uid()::text = (storage.foldername(name))[1]
    OR
    -- User is member of the chat room (room_id is second folder component)
    EXISTS (
      SELECT 1 FROM public.chat_room_members
      WHERE user_id = auth.uid()
      AND room_id::text = (storage.foldername(name))[2]
    )
  )
);

-- Users can delete their own attachments
CREATE POLICY "Users can delete chat attachments"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'chat-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create secure policies for voice-messages bucket
CREATE POLICY "Users can upload voice messages"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'voice-messages' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view voice messages"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'voice-messages' AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR
    EXISTS (
      SELECT 1 FROM public.chat_room_members
      WHERE user_id = auth.uid()
      AND room_id::text = (storage.foldername(name))[2]
    )
  )
);

CREATE POLICY "Users can delete voice messages"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'voice-messages' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Remove direct client update capability for wallet_balance in profiles
-- Create a policy that prevents direct updates to wallet_balance
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Recreate policy excluding wallet_balance updates from client
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Create a function to update wallet balance (server-side only)
CREATE OR REPLACE FUNCTION public.update_wallet_balance(
  p_user_id UUID,
  p_amount NUMERIC,
  p_operation TEXT DEFAULT 'add'
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_balance NUMERIC;
BEGIN
  IF p_operation = 'add' THEN
    UPDATE profiles
    SET wallet_balance = COALESCE(wallet_balance, 0) + p_amount
    WHERE id = p_user_id
    RETURNING wallet_balance INTO v_new_balance;
  ELSIF p_operation = 'subtract' THEN
    UPDATE profiles
    SET wallet_balance = GREATEST(0, COALESCE(wallet_balance, 0) - p_amount)
    WHERE id = p_user_id
    RETURNING wallet_balance INTO v_new_balance;
  ELSIF p_operation = 'set' THEN
    UPDATE profiles
    SET wallet_balance = p_amount
    WHERE id = p_user_id
    RETURNING wallet_balance INTO v_new_balance;
  END IF;
  
  RETURN v_new_balance;
END;
$$;