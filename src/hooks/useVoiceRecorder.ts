import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { haptics } from '@/utils/haptics';

interface UseVoiceRecorderOptions {
  maxDuration?: number; // in seconds
  onRecordingComplete?: (audioUrl: string, duration: number) => void;
}

export const useVoiceRecorder = (options: UseVoiceRecorderOptions = {}) => {
  const { maxDuration = 60, onRecordingComplete } = options;
  
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      // Try to use webm/opus, fallback to other formats
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/wav';
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        
        const finalDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        
        if (chunksRef.current.length > 0 && finalDuration > 0) {
          const audioBlob = new Blob(chunksRef.current, { type: mimeType });
          await uploadAudio(audioBlob, finalDuration);
        }
        
        setDuration(0);
      };
      
      mediaRecorder.start(100); // Collect data every 100ms
      startTimeRef.current = Date.now();
      setIsRecording(true);
      haptics.medium();
      
      // Start duration timer
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setDuration(elapsed);
        
        if (elapsed >= maxDuration) {
          stopRecording();
        }
      }, 1000);
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      haptics.error();
    }
  }, [maxDuration]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      haptics.success();
    }
  }, []);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      const stream = mediaRecorderRef.current.stream;
      stream.getTracks().forEach(track => track.stop());
      
      if (mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      
      chunksRef.current = [];
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      setIsRecording(false);
      setDuration(0);
      haptics.light();
    }
  }, []);

  const uploadAudio = async (audioBlob: Blob, audioDuration: number) => {
    setIsUploading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const fileExt = audioBlob.type.includes('webm') ? 'webm' : 
                      audioBlob.type.includes('mp4') ? 'm4a' : 'wav';
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('voice-messages')
        .upload(fileName, audioBlob, {
          contentType: audioBlob.type,
          cacheControl: '3600'
        });
      
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('voice-messages')
        .getPublicUrl(data.path);
      
      onRecordingComplete?.(publicUrl, audioDuration);
      
    } catch (error) {
      console.error('Failed to upload audio:', error);
      haptics.error();
    } finally {
      setIsUploading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    isRecording,
    isUploading,
    duration,
    formattedDuration: formatDuration(duration),
    startRecording,
    stopRecording,
    cancelRecording
  };
};
