import { useCallback, useRef, useEffect } from 'react';

interface MessageSoundOptions {
  enabled?: boolean;
  volume?: number;
}

/**
 * Hook for playing notification sounds on new messages
 * Fixes: Không có thông báo âm thanh + push khi có tin nhắn mới
 */
export function useMessageSound({
  enabled = true,
  volume = 0.5
}: MessageSoundOptions = {}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastPlayTimeRef = useRef<number>(0);
  const THROTTLE_MS = 1000; // Minimum time between sounds

  // Preload audio on mount
  useEffect(() => {
    if (enabled) {
      const audio = new Audio('/audio/coin-reward.mp3');
      audio.volume = volume;
      audio.preload = 'auto';
      
      // Preload the audio
      audio.load();
      
      audioRef.current = audio;
      console.log('✅ Message notification audio loaded');
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [enabled, volume]);

  const playSound = useCallback(() => {
    if (!enabled) return;

    const now = Date.now();
    
    // Throttle sound playback
    if (now - lastPlayTimeRef.current < THROTTLE_MS) {
      return;
    }

    lastPlayTimeRef.current = now;

    // Try to play the preloaded audio
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => {
        console.log('[MessageSound] Play failed (likely user interaction required):', err.message);
      });
    } else {
      // Fallback: create new audio instance
      const audio = new Audio('/audio/coin-reward.mp3');
      audio.volume = volume;
      audio.play().catch(() => {});
    }
  }, [enabled, volume]);

  const playCustomSound = useCallback((soundUrl: string) => {
    if (!enabled) return;

    const now = Date.now();
    if (now - lastPlayTimeRef.current < THROTTLE_MS) {
      return;
    }

    lastPlayTimeRef.current = now;

    const audio = new Audio(soundUrl);
    audio.volume = volume;
    audio.play().catch(() => {});
  }, [enabled, volume]);

  return {
    playSound,
    playCustomSound
  };
}

/**
 * Play a "ting" notification sound
 */
export function playNotificationTing(volume: number = 0.3) {
  const audio = new Audio('/audio/coin-reward.mp3');
  audio.volume = volume;
  audio.play().catch(() => {});
}

/**
 * Request notification permission for push notifications
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('[Notification] Not supported in this browser');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    console.log('[Notification] Permission denied by user');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('[Notification] Error requesting permission:', error);
    return false;
  }
}

/**
 * Show a browser notification
 */
export function showBrowserNotification(
  title: string,
  body: string,
  options?: {
    icon?: string;
    tag?: string;
    onClick?: () => void;
  }
) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  // Only show if app is in background
  if (document.visibilityState === 'visible') {
    return;
  }

  try {
    const notificationOptions: NotificationOptions = {
      body,
      icon: options?.icon || '/pwa-192x192.png',
      badge: '/favicon-32x32.png',
      tag: options?.tag || 'message'
    };

    const notification = new Notification(title, notificationOptions);

    notification.onclick = () => {
      window.focus();
      notification.close();
      options?.onClick?.();
    };

    // Auto close after 5 seconds
    setTimeout(() => notification.close(), 5000);
  } catch (error) {
    console.error('[Notification] Error showing notification:', error);
  }
}
