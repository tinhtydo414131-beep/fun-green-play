-- Fix infinite recursion in chat_room_members policies
-- First, drop existing problematic policies
DROP POLICY IF EXISTS "Users can view members of rooms they're in" ON public.chat_room_members;
DROP POLICY IF EXISTS "Users can view chat room members" ON public.chat_room_members;
DROP POLICY IF EXISTS "Users can join chat rooms" ON public.chat_room_members;
DROP POLICY IF EXISTS "Users can leave chat rooms" ON public.chat_room_members;
DROP POLICY IF EXISTS "Chat room creators can add members" ON public.chat_room_members;
DROP POLICY IF EXISTS "Chat room creators can remove members" ON public.chat_room_members;
DROP POLICY IF EXISTS "Room creators can manage members" ON public.chat_room_members;
DROP POLICY IF EXISTS "Authenticated users can view members" ON public.chat_room_members;
DROP POLICY IF EXISTS "Authenticated users can insert members" ON public.chat_room_members;
DROP POLICY IF EXISTS "Authenticated users can delete members" ON public.chat_room_members;

-- Create simplified non-recursive policies
-- SELECT: Users can see members of rooms they belong to
CREATE POLICY "chat_room_members_select" ON public.chat_room_members
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() 
    OR 
    room_id IN (
      SELECT room_id FROM public.chat_room_members crm WHERE crm.user_id = auth.uid()
    )
  );

-- INSERT: Authenticated users can join rooms
CREATE POLICY "chat_room_members_insert" ON public.chat_room_members
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- DELETE: Users can leave rooms they belong to
CREATE POLICY "chat_room_members_delete" ON public.chat_room_members
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());