-- Bảng lưu hash của file đã upload để phát hiện trùng lặp
CREATE TABLE public.uploaded_file_hashes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_hash TEXT NOT NULL, -- SHA-256 hash của file
  duration_ms INTEGER, -- Thời lượng tính bằng milliseconds
  bitrate INTEGER, -- Bitrate (kbps)
  sample_rate INTEGER, -- Sample rate (Hz)
  file_size BIGINT, -- Kích thước file (bytes)
  music_id UUID, -- Reference đến bài nhạc đã upload
  rewarded BOOLEAN NOT NULL DEFAULT false, -- Đã được thưởng coin chưa
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bảng theo dõi số lần được thưởng mỗi ngày của user
CREATE TABLE public.daily_upload_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reward_date DATE NOT NULL DEFAULT CURRENT_DATE, -- Ngày nhận thưởng
  reward_count INTEGER NOT NULL DEFAULT 0, -- Số lần đã nhận thưởng trong ngày
  total_coins_earned INTEGER NOT NULL DEFAULT 0, -- Tổng coin kiếm được trong ngày
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, reward_date) -- Mỗi user chỉ có 1 record/ngày
);

-- Index cho tìm kiếm nhanh
CREATE INDEX idx_file_hashes_hash ON public.uploaded_file_hashes(file_hash);
CREATE INDEX idx_file_hashes_user ON public.uploaded_file_hashes(user_id);
CREATE INDEX idx_file_hashes_duration_bitrate ON public.uploaded_file_hashes(duration_ms, bitrate);
CREATE INDEX idx_daily_rewards_user_date ON public.daily_upload_rewards(user_id, reward_date);

-- Enable RLS
ALTER TABLE public.uploaded_file_hashes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_upload_rewards ENABLE ROW LEVEL SECURITY;

-- RLS Policies cho uploaded_file_hashes
CREATE POLICY "Users can view their own file hashes"
  ON public.uploaded_file_hashes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own file hashes"
  ON public.uploaded_file_hashes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies cho daily_upload_rewards
CREATE POLICY "Users can view their own daily rewards"
  ON public.daily_upload_rewards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily rewards"
  ON public.daily_upload_rewards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily rewards"
  ON public.daily_upload_rewards FOR UPDATE
  USING (auth.uid() = user_id);

-- Function kiểm tra file hash đã tồn tại chưa
CREATE OR REPLACE FUNCTION public.check_file_hash_exists(
  p_user_id UUID,
  p_file_hash TEXT
)
RETURNS TABLE(
  exists_for_user BOOLEAN,
  exists_for_others BOOLEAN,
  original_user_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXISTS(SELECT 1 FROM uploaded_file_hashes WHERE file_hash = p_file_hash AND user_id = p_user_id) as exists_for_user,
    EXISTS(SELECT 1 FROM uploaded_file_hashes WHERE file_hash = p_file_hash AND user_id != p_user_id) as exists_for_others,
    (SELECT ufh.user_id FROM uploaded_file_hashes ufh WHERE ufh.file_hash = p_file_hash LIMIT 1) as original_user_id;
END;
$$;

-- Function kiểm tra file tương tự (cùng duration và bitrate)
CREATE OR REPLACE FUNCTION public.check_similar_file_exists(
  p_user_id UUID,
  p_duration_ms INTEGER,
  p_bitrate INTEGER,
  p_tolerance_ms INTEGER DEFAULT 1000
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM uploaded_file_hashes 
    WHERE user_id = p_user_id
    AND ABS(duration_ms - p_duration_ms) < p_tolerance_ms
    AND bitrate = p_bitrate
  );
END;
$$;

-- Function lấy và cập nhật daily reward count
CREATE OR REPLACE FUNCTION public.get_or_create_daily_reward(p_user_id UUID)
RETURNS TABLE(
  reward_count INTEGER,
  can_receive_reward BOOLEAN,
  remaining_rewards INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_max_daily_rewards INTEGER := 4; -- Config: Số lần thưởng tối đa/ngày
  v_current_count INTEGER;
BEGIN
  -- Lấy hoặc tạo record cho ngày hôm nay
  INSERT INTO daily_upload_rewards (user_id, reward_date, reward_count)
  VALUES (p_user_id, CURRENT_DATE, 0)
  ON CONFLICT (user_id, reward_date) DO NOTHING;
  
  -- Lấy số lần đã nhận thưởng hôm nay
  SELECT dur.reward_count INTO v_current_count
  FROM daily_upload_rewards dur
  WHERE dur.user_id = p_user_id AND dur.reward_date = CURRENT_DATE;
  
  RETURN QUERY
  SELECT 
    v_current_count,
    (v_current_count < v_max_daily_rewards),
    (v_max_daily_rewards - v_current_count);
END;
$$;

-- Function tăng reward count sau khi thưởng thành công
CREATE OR REPLACE FUNCTION public.increment_daily_reward(
  p_user_id UUID,
  p_coins_amount INTEGER DEFAULT 50000
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE daily_upload_rewards
  SET 
    reward_count = reward_count + 1,
    total_coins_earned = total_coins_earned + p_coins_amount,
    updated_at = now()
  WHERE user_id = p_user_id AND reward_date = CURRENT_DATE;
  
  RETURN FOUND;
END;
$$;