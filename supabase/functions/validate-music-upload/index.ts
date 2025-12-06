// Edge Function: Xác thực upload nhạc và chống abuse
// Kết hợp 3 biện pháp: SHA-256 hash, giới hạn ngày, metadata check

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ===== CẤU HÌNH CHỐNG ABUSE =====
const CONFIG = {
  MAX_DAILY_REWARDS: 4,           // Số lần thưởng tối đa mỗi ngày
  REWARD_AMOUNT: 50000,           // Số Camly coin thưởng mỗi bài
  DURATION_TOLERANCE_MS: 1000,    // Sai số duration cho phép (1 giây)
  MIN_DURATION_MS: 30000,         // Thời lượng tối thiểu 30 giây
  MAX_FILE_SIZE_MB: 50,           // Kích thước file tối đa (MB)
}

// Các loại response
interface ValidationResponse {
  success: boolean
  canUpload: boolean           // Có thể upload file không
  canReceiveReward: boolean    // Có được nhận thưởng không
  rewardAmount: number         // Số coin được thưởng (0 nếu không đủ điều kiện)
  message: string              // Thông báo cho user
  code: string                 // Mã lỗi để frontend xử lý
  dailyInfo?: {
    rewardsUsed: number        // Số lần đã nhận thưởng hôm nay
    rewardsRemaining: number   // Số lần còn lại
    maxDaily: number           // Giới hạn tối đa
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Lấy thông tin authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({
          success: false,
          canUpload: false,
          canReceiveReward: false,
          rewardAmount: 0,
          message: 'Bạn cần đăng nhập để upload nhạc',
          code: 'AUTH_REQUIRED'
        } as ValidationResponse),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Khởi tạo Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify user từ token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({
          success: false,
          canUpload: false,
          canReceiveReward: false,
          rewardAmount: 0,
          message: 'Phiên đăng nhập không hợp lệ',
          code: 'INVALID_SESSION'
        } as ValidationResponse),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const userId = user.id

    // Parse request body
    const body = await req.json()
    const { 
      fileHash,      // SHA-256 hash của file (tính từ frontend)
      durationMs,    // Thời lượng bài hát (milliseconds)
      bitrate,       // Bitrate (kbps)
      sampleRate,    // Sample rate (Hz)
      fileSize,      // Kích thước file (bytes)
      fileName       // Tên file gốc
    } = body

    // ===== VALIDATION CƠ BẢN =====
    if (!fileHash || typeof fileHash !== 'string') {
      return new Response(
        JSON.stringify({
          success: false,
          canUpload: false,
          canReceiveReward: false,
          rewardAmount: 0,
          message: 'File hash không hợp lệ',
          code: 'INVALID_HASH'
        } as ValidationResponse),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Kiểm tra thời lượng tối thiểu
    if (durationMs && durationMs < CONFIG.MIN_DURATION_MS) {
      return new Response(
        JSON.stringify({
          success: false,
          canUpload: true, // Vẫn cho upload
          canReceiveReward: false,
          rewardAmount: 0,
          message: `Bài hát phải dài ít nhất ${CONFIG.MIN_DURATION_MS / 1000} giây để nhận thưởng`,
          code: 'DURATION_TOO_SHORT'
        } as ValidationResponse),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ===== BIỆN PHÁP 1: KIỂM TRA SHA-256 HASH =====
    console.log(`[Anti-Abuse] Checking hash for user ${userId}: ${fileHash.substring(0, 16)}...`)
    
    const { data: hashCheck, error: hashError } = await supabase
      .rpc('check_file_hash_exists', {
        p_user_id: userId,
        p_file_hash: fileHash
      })

    if (hashError) {
      console.error('[Anti-Abuse] Hash check error:', hashError)
      throw new Error('Lỗi kiểm tra file hash')
    }

    const hashResult = hashCheck?.[0]
    
    // Nếu user này đã upload file này rồi → từ chối hoàn toàn
    if (hashResult?.exists_for_user) {
      console.log(`[Anti-Abuse] BLOCKED: User ${userId} already uploaded this file`)
      return new Response(
        JSON.stringify({
          success: false,
          canUpload: false,
          canReceiveReward: false,
          rewardAmount: 0,
          message: '🚫 Bạn đã upload bài hát này rồi! Vui lòng chọn bài khác.',
          code: 'DUPLICATE_FILE_SAME_USER'
        } as ValidationResponse),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Nếu user khác đã upload file này → cho upload nhưng KHÔNG thưởng
    if (hashResult?.exists_for_others) {
      console.log(`[Anti-Abuse] File already exists from another user, no reward for ${userId}`)
      
      // Vẫn lưu hash để track
      await supabase.from('uploaded_file_hashes').insert({
        user_id: userId,
        file_hash: fileHash,
        duration_ms: durationMs || null,
        bitrate: bitrate || null,
        sample_rate: sampleRate || null,
        file_size: fileSize || null,
        rewarded: false
      })

      return new Response(
        JSON.stringify({
          success: true,
          canUpload: true,
          canReceiveReward: false,
          rewardAmount: 0,
          message: '⚠️ Bài hát này đã có trong hệ thống. Bạn có thể upload để nghe nhưng không nhận được thưởng.',
          code: 'DUPLICATE_FILE_OTHER_USER'
        } as ValidationResponse),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ===== BIỆN PHÁP 3: KIỂM TRA METADATA TƯƠNG TỰ =====
    if (durationMs && bitrate) {
      const { data: similarExists, error: similarError } = await supabase
        .rpc('check_similar_file_exists', {
          p_user_id: userId,
          p_duration_ms: durationMs,
          p_bitrate: bitrate,
          p_tolerance_ms: CONFIG.DURATION_TOLERANCE_MS
        })

      if (!similarError && similarExists) {
        console.log(`[Anti-Abuse] Similar file detected for user ${userId}`)
        return new Response(
          JSON.stringify({
            success: false,
            canUpload: false,
            canReceiveReward: false,
            rewardAmount: 0,
            message: '🔍 Phát hiện file tương tự đã upload. Vui lòng chọn bài khác.',
            code: 'SIMILAR_FILE_DETECTED'
          } as ValidationResponse),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // ===== BIỆN PHÁP 2: KIỂM TRA GIỚI HẠN NGÀY =====
    console.log(`[Anti-Abuse] Checking daily limit for user ${userId}`)
    
    const { data: dailyReward, error: dailyError } = await supabase
      .rpc('get_or_create_daily_reward', { p_user_id: userId })

    if (dailyError) {
      console.error('[Anti-Abuse] Daily reward check error:', dailyError)
      throw new Error('Lỗi kiểm tra giới hạn ngày')
    }

    const dailyResult = dailyReward?.[0]
    const rewardsUsed = dailyResult?.reward_count || 0
    const canReceiveReward = dailyResult?.can_receive_reward ?? true
    const remainingRewards = dailyResult?.remaining_rewards ?? CONFIG.MAX_DAILY_REWARDS

    // Nếu đã đạt giới hạn ngày → cho upload nhưng KHÔNG thưởng
    if (!canReceiveReward) {
      console.log(`[Anti-Abuse] Daily limit reached for user ${userId}`)
      
      // Vẫn lưu hash
      await supabase.from('uploaded_file_hashes').insert({
        user_id: userId,
        file_hash: fileHash,
        duration_ms: durationMs || null,
        bitrate: bitrate || null,
        sample_rate: sampleRate || null,
        file_size: fileSize || null,
        rewarded: false
      })

      return new Response(
        JSON.stringify({
          success: true,
          canUpload: true,
          canReceiveReward: false,
          rewardAmount: 0,
          message: `📅 Bạn đã đạt giới hạn ${CONFIG.MAX_DAILY_REWARDS} bài/ngày. Upload vẫn thành công nhưng không nhận thêm thưởng hôm nay.`,
          code: 'DAILY_LIMIT_REACHED',
          dailyInfo: {
            rewardsUsed,
            rewardsRemaining: 0,
            maxDaily: CONFIG.MAX_DAILY_REWARDS
          }
        } as ValidationResponse),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ===== TẤT CẢ ĐIỀU KIỆN THỎA MÃN → CHO THƯỞNG =====
    console.log(`[Anti-Abuse] All checks passed for user ${userId}, awarding ${CONFIG.REWARD_AMOUNT} coins`)
    
    // Lưu hash với rewarded = true
    await supabase.from('uploaded_file_hashes').insert({
      user_id: userId,
      file_hash: fileHash,
      duration_ms: durationMs || null,
      bitrate: bitrate || null,
      sample_rate: sampleRate || null,
      file_size: fileSize || null,
      rewarded: true
    })

    // Tăng counter daily reward
    await supabase.rpc('increment_daily_reward', {
      p_user_id: userId,
      p_coins_amount: CONFIG.REWARD_AMOUNT
    })

    // Cập nhật wallet balance
    await supabase.rpc('update_wallet_balance', {
      p_user_id: userId,
      p_amount: CONFIG.REWARD_AMOUNT,
      p_operation: 'add'
    })

    // Ghi log transaction
    await supabase.from('camly_coin_transactions').insert({
      user_id: userId,
      amount: CONFIG.REWARD_AMOUNT,
      transaction_type: 'music_upload_reward',
      description: `Thưởng upload nhạc: ${fileName || 'Unknown'}`
    })

    return new Response(
      JSON.stringify({
        success: true,
        canUpload: true,
        canReceiveReward: true,
        rewardAmount: CONFIG.REWARD_AMOUNT,
        message: `🎉 Upload thành công! Bạn nhận được +${CONFIG.REWARD_AMOUNT.toLocaleString()} Camly coins!`,
        code: 'UPLOAD_SUCCESS_WITH_REWARD',
        dailyInfo: {
          rewardsUsed: rewardsUsed + 1,
          rewardsRemaining: remainingRewards - 1,
          maxDaily: CONFIG.MAX_DAILY_REWARDS
        }
      } as ValidationResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[Anti-Abuse] Error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        canUpload: false,
        canReceiveReward: false,
        rewardAmount: 0,
        message: 'Đã xảy ra lỗi, vui lòng thử lại sau',
        code: 'INTERNAL_ERROR'
      } as ValidationResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
