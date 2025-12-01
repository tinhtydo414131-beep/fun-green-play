-- Create table for comment reports
CREATE TABLE public.comment_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL REFERENCES public.uploaded_game_comments(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid,
  UNIQUE(comment_id, reporter_id)
);

-- Enable RLS
ALTER TABLE public.comment_reports ENABLE ROW LEVEL SECURITY;

-- Users can report comments
CREATE POLICY "Users can report comments"
ON public.comment_reports
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = reporter_id);

-- Users can view their own reports
CREATE POLICY "Users can view their own reports"
ON public.comment_reports
FOR SELECT
TO authenticated
USING (auth.uid() = reporter_id);

-- Admins can view all reports
CREATE POLICY "Admins can view all reports"
ON public.comment_reports
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update reports
CREATE POLICY "Admins can update reports"
ON public.comment_reports
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for performance
CREATE INDEX idx_comment_reports_comment_id ON public.comment_reports(comment_id);
CREATE INDEX idx_comment_reports_status ON public.comment_reports(status);