-- Create storage bucket for background videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'background-videos',
  'background-videos',
  false,
  52428800, -- 50MB limit
  ARRAY['video/mp4', 'video/webm', 'video/quicktime']
);

-- Create table for user background videos
CREATE TABLE public.user_background_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_size BIGINT,
  duration TEXT,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_background_videos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_background_videos table
CREATE POLICY "Users can view their own videos"
  ON public.user_background_videos
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upload their own videos"
  ON public.user_background_videos
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own videos"
  ON public.user_background_videos
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own videos"
  ON public.user_background_videos
  FOR DELETE
  USING (auth.uid() = user_id);

-- Storage policies for background-videos bucket
CREATE POLICY "Users can view their own background videos"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'background-videos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload their own background videos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'background-videos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own background videos"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'background-videos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own background videos"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'background-videos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Trigger to update updated_at
CREATE TRIGGER update_user_background_videos_updated_at
  BEFORE UPDATE ON public.user_background_videos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();