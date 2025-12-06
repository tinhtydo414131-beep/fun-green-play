// Utility functions cho việc validate và chống abuse upload nhạc

/**
 * Tính SHA-256 hash của file
 * @param file File cần tính hash
 * @returns Promise<string> Hash dạng hex
 */
export async function calculateFileHash(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Lấy metadata của file audio (duration, bitrate, sample rate)
 * Sử dụng Web Audio API
 */
export async function getAudioMetadata(file: File): Promise<{
  durationMs: number;
  bitrate: number;
  sampleRate: number;
}> {
  return new Promise((resolve, reject) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        // Duration tính bằng milliseconds
        const durationMs = Math.round(audioBuffer.duration * 1000);
        
        // Sample rate
        const sampleRate = audioBuffer.sampleRate;
        
        // Ước tính bitrate từ file size và duration
        // bitrate = (fileSize * 8) / duration (seconds)
        const bitrate = Math.round((file.size * 8) / audioBuffer.duration / 1000); // kbps
        
        audioContext.close();
        
        resolve({
          durationMs,
          bitrate,
          sampleRate
        });
      } catch (error) {
        audioContext.close();
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Interface cho response từ validate-music-upload edge function
 */
export interface ValidationResponse {
  success: boolean;
  canUpload: boolean;
  canReceiveReward: boolean;
  rewardAmount: number;
  message: string;
  code: string;
  dailyInfo?: {
    rewardsUsed: number;
    rewardsRemaining: number;
    maxDaily: number;
  };
}

/**
 * Validate file upload với server
 */
export async function validateMusicUpload(
  file: File,
  accessToken: string
): Promise<ValidationResponse> {
  // Tính hash và lấy metadata song song
  const [fileHash, metadata] = await Promise.all([
    calculateFileHash(file),
    getAudioMetadata(file).catch(() => ({
      durationMs: 0,
      bitrate: 0,
      sampleRate: 0
    }))
  ]);

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/validate-music-upload`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileHash,
        durationMs: metadata.durationMs,
        bitrate: metadata.bitrate,
        sampleRate: metadata.sampleRate,
        fileSize: file.size,
        fileName: file.name
      })
    }
  );

  const result = await response.json();
  return result as ValidationResponse;
}

/**
 * Format số coin để hiển thị
 */
export function formatCoins(amount: number): string {
  return amount.toLocaleString('vi-VN');
}

/**
 * Các mã lỗi và icon tương ứng
 */
export const ValidationCodeIcons: Record<string, string> = {
  'UPLOAD_SUCCESS_WITH_REWARD': '🎉',
  'DUPLICATE_FILE_SAME_USER': '🚫',
  'DUPLICATE_FILE_OTHER_USER': '⚠️',
  'SIMILAR_FILE_DETECTED': '🔍',
  'DAILY_LIMIT_REACHED': '📅',
  'DURATION_TOO_SHORT': '⏱️',
  'AUTH_REQUIRED': '🔐',
  'INVALID_SESSION': '🔑',
  'INVALID_HASH': '❌',
  'INTERNAL_ERROR': '⚠️'
};
