-- Fix security definer view warning by explicitly setting SECURITY INVOKER
DROP VIEW IF EXISTS public.public_leaderboard;

CREATE VIEW public.public_leaderboard
WITH (security_invoker = true)
AS
SELECT 
  id,
  username,
  avatar_url,
  leaderboard_score,
  total_plays,
  total_likes
FROM public.profiles
ORDER BY leaderboard_score DESC;