-- Fix security warnings by adding search_path to functions

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_leaderboard_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET leaderboard_score = (total_plays * 10) + (total_likes * 5) + (total_messages * 1) + (total_friends * 2)
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;