-- Make stories bucket private to restrict access to authenticated users only
UPDATE storage.buckets SET public = false WHERE name = 'stories';

-- Add RLS policy for stories bucket - users can only access their own stories or friends' stories
CREATE POLICY "Users can view own stories"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'stories' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload own stories"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'stories' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own stories"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'stories' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow friends to view stories (check friendship table)
CREATE POLICY "Friends can view stories"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'stories' AND 
  EXISTS (
    SELECT 1 FROM public.friends 
    WHERE (user_id = auth.uid() AND friend_id::text = (storage.foldername(name))[1])
    OR (friend_id = auth.uid() AND user_id::text = (storage.foldername(name))[1])
  )
);