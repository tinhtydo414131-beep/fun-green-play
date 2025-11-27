-- Create storage bucket for music files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('music', 'music', true);

-- Create RLS policies for music bucket
CREATE POLICY "Anyone can view music files"
ON storage.objects FOR SELECT
USING (bucket_id = 'music');

CREATE POLICY "Authenticated users can upload music"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'music' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their own music"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'music' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own music"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'music' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);