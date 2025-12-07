-- Drop the old restrictive INSERT policy for friends table
DROP POLICY IF EXISTS "Users can add friends" ON public.friends;

-- Create new policy that allows adding friends when:
-- 1. User is adding themselves as user_id (normal case)
-- 2. OR user is the friend_id (when accepting a friend request, the other user creates the reciprocal entry)
CREATE POLICY "Users can add friends bidirectional" 
ON public.friends 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  OR auth.uid() = friend_id
);

-- Also allow DELETE for friend requests table so users can cancel sent requests
DROP POLICY IF EXISTS "Users can delete their sent requests" ON public.friend_requests;

CREATE POLICY "Users can delete their sent requests" 
ON public.friend_requests 
FOR DELETE 
USING (auth.uid() = sender_id);