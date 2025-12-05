import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.84.0';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
const TELEGRAM_WEBHOOK_SECRET = Deno.env.get('TELEGRAM_WEBHOOK_SECRET');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!TELEGRAM_BOT_TOKEN || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing required environment variables');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Input validation schemas
const telegramUserSchema = z.object({
  id: z.number(),
  username: z.string().optional(),
  first_name: z.string(),
});

const telegramChatSchema = z.object({
  id: z.number(),
});

const telegramAudioSchema = z.object({
  file_id: z.string(),
  file_name: z.string().optional(),
  title: z.string().optional(),
  performer: z.string().optional(),
  duration: z.number().optional(),
  file_size: z.number().optional(),
}).optional();

const telegramVoiceSchema = z.object({
  file_id: z.string(),
  duration: z.number().optional(),
  file_size: z.number().optional(),
}).optional();

const telegramMessageSchema = z.object({
  message_id: z.number(),
  from: telegramUserSchema,
  chat: telegramChatSchema,
  text: z.string().optional(),
  audio: telegramAudioSchema,
  voice: telegramVoiceSchema,
}).optional();

const telegramUpdateSchema = z.object({
  message: telegramMessageSchema,
});

type TelegramUpdate = z.infer<typeof telegramUpdateSchema>;

async function sendTelegramMessage(chatId: number, text: string) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    }),
  });
}

async function getFileUrl(fileId: string): Promise<string> {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`;
  const response = await fetch(url);
  const data = await response.json();
  
  if (!data.ok) {
    throw new Error('Failed to get file from Telegram');
  }
  
  return `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${data.result.file_path}`;
}

async function downloadFile(fileUrl: string): Promise<Uint8Array> {
  const response = await fetch(fileUrl);
  if (!response.ok) {
    throw new Error('Failed to download file from Telegram');
  }
  return new Uint8Array(await response.arrayBuffer());
}

async function handleAudioMessage(update: TelegramUpdate) {
  const message = update.message!;
  const audio = message.audio || message.voice;
  const chatId = message.chat.id;
  const telegramUserId = message.from.id;

  if (!audio) {
    await sendTelegramMessage(chatId, '❌ Vui lòng gửi file nhạc (MP3, M4A, WAV, OGG)!');
    return;
  }

  try {
    await sendTelegramMessage(chatId, '⏳ Đang tải nhạc lên...');

    // Get Telegram user info and check if profile exists
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', `telegram_${telegramUserId}`)
      .single();

    let userId: string;

    if (profileError || !profiles) {
      // Create a new profile for this Telegram user
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          username: `telegram_${telegramUserId}`,
          email: `telegram_${telegramUserId}@funplanet.local`,
        })
        .select('id')
        .single();

      if (createError || !newProfile) {
        console.error('Failed to create profile:', createError);
        await sendTelegramMessage(chatId, '❌ Lỗi: Không thể tạo tài khoản. Vui lòng liên hệ admin.');
        return;
      }
      
      userId = newProfile.id;
    } else {
      userId = profiles.id;
    }

    // Download file from Telegram
    const fileUrl = await getFileUrl(audio.file_id);
    const fileData = await downloadFile(fileUrl);

    // Generate filename - sanitize to prevent path traversal
    const rawTitle = message.audio?.title || message.audio?.file_name || `Audio_${Date.now()}`;
    const title = rawTitle.substring(0, 100);
    const artist = (message.audio?.performer || message.from.first_name).substring(0, 100);
    const sanitizedTitle = title.replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `${Date.now()}-${sanitizedTitle}.mp3`;
    const filePath = `${userId}/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('music')
      .upload(filePath, fileData, {
        contentType: 'audio/mpeg',
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      await sendTelegramMessage(chatId, '❌ Không thể tải file lên. Vui lòng thử lại!');
      return;
    }

    // Calculate duration
    const duration = audio.duration 
      ? `${Math.floor(audio.duration / 60)}:${(audio.duration % 60).toString().padStart(2, '0')}`
      : '0:00';

    // Save metadata to database with auto-approval
    const { error: dbError } = await supabase
      .from('user_music')
      .insert({
        user_id: userId,
        title: title.replace('.mp3', ''),
        artist: artist,
        storage_path: filePath,
        file_size: audio.file_size || 0,
        duration: duration,
        parent_approved: true,
        pending_approval: false,
      });

    if (dbError) {
      console.error('Database error:', dbError);
      // Try to clean up uploaded file
      await supabase.storage.from('music').remove([filePath]);
      await sendTelegramMessage(chatId, '❌ Không thể lưu thông tin nhạc. Vui lòng thử lại!');
      return;
    }

    await sendTelegramMessage(
      chatId,
      `✅ Đã tải lên thành công!\n\n🎵 <b>${title}</b>\n🎤 ${artist}\n\nNhạc của bạn đã được thêm vào thư viện!`
    );
  } catch (error) {
    console.error('Error processing audio:', error);
    await sendTelegramMessage(chatId, '❌ Có lỗi xảy ra. Vui lòng thử lại sau!');
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify Telegram webhook signature if secret is configured
    if (TELEGRAM_WEBHOOK_SECRET) {
      const signature = req.headers.get('X-Telegram-Bot-Api-Secret-Token');
      if (!signature || signature !== TELEGRAM_WEBHOOK_SECRET) {
        console.error('Invalid or missing Telegram webhook signature');
        return new Response('Unauthorized', { status: 401, headers: corsHeaders });
      }
    } else {
      console.warn('TELEGRAM_WEBHOOK_SECRET not configured - webhook signature verification disabled');
    }

    // Parse and validate input
    const rawBody = await req.json().catch(() => null);
    if (!rawBody) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validationResult = telegramUpdateSchema.safeParse(rawBody);
    if (!validationResult.success) {
      console.error('Invalid Telegram update format:', validationResult.error);
      return new Response(
        JSON.stringify({ error: 'Invalid update format', details: validationResult.error.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const update = validationResult.data;
    console.log('Received valid update for chat:', update.message?.chat?.id);

    if (!update.message) {
      return new Response('OK', { status: 200, headers: corsHeaders });
    }

    const message = update.message;

    // Handle /start command
    if (message.text === '/start') {
      await sendTelegramMessage(
        message.chat.id,
        '🎵 <b>Chào mừng đến với FUN Planet Music Bot!</b>\n\n' +
        '📤 Gửi file nhạc (MP3, M4A, WAV, OGG) cho tôi và tôi sẽ tự động tải lên trang web.\n\n' +
        '✨ Các file của bạn sẽ xuất hiện ngay trên trang Thư Viện Nhạc!'
      );
      return new Response('OK', { status: 200, headers: corsHeaders });
    }

    // Handle audio files
    if (message.audio || message.voice) {
      await handleAudioMessage(update);
      return new Response('OK', { status: 200, headers: corsHeaders });
    }

    // Handle other messages
    if (message.text) {
      await sendTelegramMessage(
        message.chat.id,
        '❓ Vui lòng gửi file nhạc (MP3, M4A, WAV, OGG) để tải lên trang web!'
      );
    }

    return new Response('OK', { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error('Error in telegram-music-bot:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
