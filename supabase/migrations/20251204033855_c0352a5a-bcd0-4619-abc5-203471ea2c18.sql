-- Add pinned columns to chat_messages
ALTER TABLE public.chat_messages 
ADD COLUMN is_pinned boolean DEFAULT false,
ADD COLUMN pinned_at timestamp with time zone,
ADD COLUMN pinned_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Create index for faster pinned message lookups
CREATE INDEX idx_chat_messages_pinned ON public.chat_messages(room_id, is_pinned) WHERE is_pinned = true;