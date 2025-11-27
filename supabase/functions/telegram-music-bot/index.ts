import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.84.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!TELEGRAM_BOT_TOKEN || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing required environment variables');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface TelegramUpdate {
  message?: {
    message_id: number;
    from: {
      id: number;
      username?: string;
      first_name: string;
    };
    chat: {
      id: number;
    };
    text?: string;
    audio?: {
      file_id: string;
      file_name?: string;
      title?: string;
      performer?: string;
      duration?: number;
      file_size?: number;
    };
    voice?: {
      file_id: string;
      duration?: number;
      file_size?: number;
    };
  };
}

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
    await sendTelegramMessage(chatId, '❌ Vui lòng gửi file nhạc MP3!');
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

    // Generate filename
    const title = message.audio?.title || message.audio?.file_name || `Audio_${Date.now()}`;
    const artist = message.audio?.performer || message.from.first_name;
    const fileName = `${Date.now()}-${title.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`;
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

    // Save metadata to database
    const { error: dbError } = await supabase
      .from('user_music')
      .insert({
        user_id: userId,
        title: title.replace('.mp3', '').substring(0, 100),
        artist: artist.substring(0, 100),
        storage_path: filePath,
        file_size: audio.file_size || 0,
        duration: duration,
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
    const update: TelegramUpdate = await req.json();
    console.log('Received update:', JSON.stringify(update, null, 2));

    if (!update.message) {
      return new Response('OK', { status: 200, headers: corsHeaders });
    }

    const message = update.message;

    // Handle /start command
    if (message.text === '/start') {
      await sendTelegramMessage(
        message.chat.id,
        '🎵 <b>Chào mừng đến với FUN Planet Music Bot!</b>\n\n' +
        '📤 Gửi file MP3 cho tôi và tôi sẽ tự động tải lên trang web.\n\n' +
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
        '❓ Vui lòng gửi file nhạc MP3 để tải lên trang web!'
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
