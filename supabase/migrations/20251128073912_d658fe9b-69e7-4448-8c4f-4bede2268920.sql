-- Add parent approval field to user_music table
ALTER TABLE public.user_music 
ADD COLUMN IF NOT EXISTS parent_approved BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS pending_approval BOOLEAN DEFAULT true;

-- Create 432Hz library table
CREATE TABLE IF NOT EXISTS public.healing_music_432hz (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT DEFAULT 'FUN Planet',
  description TEXT,
  duration TEXT,
  storage_path TEXT NOT NULL,
  category TEXT DEFAULT 'meditation',
  frequency TEXT DEFAULT '432Hz',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.healing_music_432hz ENABLE ROW LEVEL SECURITY;

-- Anyone can view healing music
CREATE POLICY "Anyone can view 432Hz healing music"
ON public.healing_music_432hz
FOR SELECT
USING (is_active = true);

-- Only admins can manage healing music
CREATE POLICY "Admins can manage 432Hz music"
ON public.healing_music_432hz
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert sample 432Hz tracks
INSERT INTO public.healing_music_432hz (title, artist, description, duration, storage_path, category)
VALUES
  ('Deep Meditation 432Hz', 'FUN Planet Healing', 'Calming meditation music tuned to 432Hz for deep relaxation', '10:00', 'healing/meditation-432hz.mp3', 'meditation'),
  ('Sleep Healing 432Hz', 'FUN Planet Healing', 'Gentle healing frequencies to help you sleep peacefully', '15:00', 'healing/sleep-432hz.mp3', 'sleep'),
  ('Focus & Study 432Hz', 'FUN Planet Healing', 'Enhance concentration and learning with 432Hz frequency', '20:00', 'healing/focus-432hz.mp3', 'focus'),
  ('Nature Harmony 432Hz', 'FUN Planet Healing', 'Nature sounds with 432Hz tuning for stress relief', '12:00', 'healing/nature-432hz.mp3', 'nature'),
  ('Heart Chakra 432Hz', 'FUN Planet Healing', 'Activate and balance your heart chakra with healing tones', '8:00', 'healing/chakra-432hz.mp3', 'chakra')
ON CONFLICT DO NOTHING;