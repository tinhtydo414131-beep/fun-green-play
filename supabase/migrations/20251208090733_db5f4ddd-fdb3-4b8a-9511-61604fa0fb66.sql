-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own role selection" ON public.user_role_selections;
DROP POLICY IF EXISTS "Users can update their own role selection" ON public.user_role_selections;
DROP POLICY IF EXISTS "Users can view their own role selection" ON public.user_role_selections;

-- Recreate policies with proper authenticated check
CREATE POLICY "Users can insert their own role selection" 
ON public.user_role_selections 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own role selection" 
ON public.user_role_selections 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own role selection" 
ON public.user_role_selections 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);