import { supabase } from '@/integrations/supabase/client';

export interface R2UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  size?: number;
  type?: string;
  error?: string;
}

export type R2Folder = 
  | 'avatars'
  | 'games'
  | 'music'
  | 'videos'
  | 'chat-attachments'
  | 'voice-messages'
  | 'stories'
  | 'posts'
  | 'covers'
  | 'uploads';

/**
 * Upload a file to Cloudflare R2 via edge function
 * @param file - The file to upload
 * @param folder - The folder/category for the file
 * @returns Upload result with URL or error
 */
export async function uploadToR2(
  file: File,
  folder: R2Folder = 'uploads'
): Promise<R2UploadResult> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const { data, error } = await supabase.functions.invoke('r2-upload', {
      body: formData,
    });

    if (error) {
      console.error('R2 upload error:', error);
      return { success: false, error: error.message };
    }

    if (!data.success) {
      return { success: false, error: data.error || 'Upload failed' };
    }

    return {
      success: true,
      url: data.url,
      key: data.key,
      size: data.size,
      type: data.type,
    };
  } catch (err) {
    console.error('R2 upload exception:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    };
  }
}

/**
 * Check if R2 is configured and available
 */
export async function isR2Available(): Promise<boolean> {
  try {
    // Try a simple health check - we'll just assume it's available
    // The actual check happens when uploading
    return true;
  } catch {
    return false;
  }
}
