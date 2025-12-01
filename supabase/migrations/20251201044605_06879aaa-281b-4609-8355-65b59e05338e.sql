-- Allow users to delete their own games
CREATE POLICY "Users can delete their own games"
ON uploaded_games
FOR DELETE
USING (auth.uid() = user_id);

-- Update the policy to allow users to edit their own games (not just pending)
DROP POLICY IF EXISTS "Users can update their pending games" ON uploaded_games;

CREATE POLICY "Users can update their own games"
ON uploaded_games
FOR UPDATE
USING (auth.uid() = user_id);