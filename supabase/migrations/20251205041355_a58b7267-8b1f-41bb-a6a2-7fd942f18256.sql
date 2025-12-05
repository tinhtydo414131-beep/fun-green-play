-- Create table for active video calls
CREATE TABLE public.video_calls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  caller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  callee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  call_type TEXT NOT NULL DEFAULT 'video' CHECK (call_type IN ('audio', 'video')),
  status TEXT NOT NULL DEFAULT 'ringing' CHECK (status IN ('ringing', 'answered', 'ended', 'missed', 'rejected')),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for WebRTC signaling (SDP offers/answers and ICE candidates)
CREATE TABLE public.call_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  call_id UUID NOT NULL REFERENCES public.video_calls(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  signal_type TEXT NOT NULL CHECK (signal_type IN ('offer', 'answer', 'ice-candidate')),
  signal_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.video_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_signals ENABLE ROW LEVEL SECURITY;

-- RLS policies for video_calls
CREATE POLICY "Users can view their own calls" ON public.video_calls
  FOR SELECT USING (auth.uid() = caller_id OR auth.uid() = callee_id);

CREATE POLICY "Users can create calls" ON public.video_calls
  FOR INSERT WITH CHECK (auth.uid() = caller_id);

CREATE POLICY "Participants can update call status" ON public.video_calls
  FOR UPDATE USING (auth.uid() = caller_id OR auth.uid() = callee_id);

-- RLS policies for call_signals
CREATE POLICY "Call participants can view signals" ON public.call_signals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.video_calls 
      WHERE id = call_id AND (caller_id = auth.uid() OR callee_id = auth.uid())
    )
  );

CREATE POLICY "Call participants can insert signals" ON public.call_signals
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.video_calls 
      WHERE id = call_id AND (caller_id = auth.uid() OR callee_id = auth.uid())
    )
  );

-- Enable realtime for signaling
ALTER PUBLICATION supabase_realtime ADD TABLE public.video_calls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.call_signals;