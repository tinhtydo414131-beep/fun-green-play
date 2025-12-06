-- Tạo function để tìm user theo wallet address hoặc username cho P2P transfer
-- Sử dụng SECURITY DEFINER để bypass RLS
CREATE OR REPLACE FUNCTION public.find_user_for_transfer(
  p_search_input TEXT
)
RETURNS TABLE(
  user_id UUID,
  username TEXT,
  wallet_address TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Kiểm tra nếu input là wallet address (bắt đầu bằng 0x và 42 ký tự)
  IF p_search_input ~* '^0x[a-fA-F0-9]{40}$' THEN
    -- Tìm theo wallet address
    RETURN QUERY
    SELECT p.id, p.username, p.wallet_address
    FROM profiles p
    WHERE LOWER(p.wallet_address) = LOWER(p_search_input)
    LIMIT 1;
  ELSE
    -- Tìm theo username (case insensitive)
    RETURN QUERY
    SELECT p.id, p.username, p.wallet_address
    FROM profiles p
    WHERE LOWER(p.username) = LOWER(TRIM(p_search_input))
    LIMIT 1;
  END IF;
END;
$$;