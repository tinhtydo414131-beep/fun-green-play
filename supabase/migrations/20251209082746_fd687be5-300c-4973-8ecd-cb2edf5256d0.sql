-- Create parent_child_links table to link parents with children
CREATE TABLE public.parent_child_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  approved_at TIMESTAMPTZ,
  UNIQUE(parent_id, child_id)
);

-- Create child_time_limits table for daily play time limits
CREATE TABLE public.child_time_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_limit_minutes INTEGER NOT NULL DEFAULT 60,
  weekend_limit_minutes INTEGER NOT NULL DEFAULT 120,
  bedtime_start TIME DEFAULT '21:00',
  bedtime_end TIME DEFAULT '07:00',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(parent_id, child_id)
);

-- Create blocked_games table for games blocked by parent
CREATE TABLE public.blocked_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id UUID NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(parent_id, child_id, game_id)
);

-- Create child_play_sessions to track daily usage
CREATE TABLE public.child_play_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id UUID,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.parent_child_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_time_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_play_sessions ENABLE ROW LEVEL SECURITY;

-- RLS for parent_child_links
CREATE POLICY "Parents can view their links" ON public.parent_child_links
  FOR SELECT USING (auth.uid() = parent_id OR auth.uid() = child_id);

CREATE POLICY "Parents can create links" ON public.parent_child_links
  FOR INSERT WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Children can approve links" ON public.parent_child_links
  FOR UPDATE USING (auth.uid() = child_id);

CREATE POLICY "Parents can delete links" ON public.parent_child_links
  FOR DELETE USING (auth.uid() = parent_id);

-- RLS for child_time_limits
CREATE POLICY "Parents can view time limits" ON public.child_time_limits
  FOR SELECT USING (auth.uid() = parent_id OR auth.uid() = child_id);

CREATE POLICY "Parents can create time limits" ON public.child_time_limits
  FOR INSERT WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Parents can update time limits" ON public.child_time_limits
  FOR UPDATE USING (auth.uid() = parent_id);

CREATE POLICY "Parents can delete time limits" ON public.child_time_limits
  FOR DELETE USING (auth.uid() = parent_id);

-- RLS for blocked_games
CREATE POLICY "Parents and children can view blocked games" ON public.blocked_games
  FOR SELECT USING (auth.uid() = parent_id OR auth.uid() = child_id);

CREATE POLICY "Parents can block games" ON public.blocked_games
  FOR INSERT WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Parents can unblock games" ON public.blocked_games
  FOR DELETE USING (auth.uid() = parent_id);

-- RLS for child_play_sessions
CREATE POLICY "Children can view their sessions" ON public.child_play_sessions
  FOR SELECT USING (auth.uid() = child_id OR EXISTS (
    SELECT 1 FROM parent_child_links WHERE parent_id = auth.uid() AND child_id = child_play_sessions.child_id
  ));

CREATE POLICY "Children can create sessions" ON public.child_play_sessions
  FOR INSERT WITH CHECK (auth.uid() = child_id);

CREATE POLICY "Children can update their sessions" ON public.child_play_sessions
  FOR UPDATE USING (auth.uid() = child_id);

-- Add update trigger
CREATE TRIGGER update_child_time_limits_updated_at
  BEFORE UPDATE ON public.child_time_limits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();