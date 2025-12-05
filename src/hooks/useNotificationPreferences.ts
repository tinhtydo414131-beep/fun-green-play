import { useState, useEffect } from "react";

export type NotificationPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
export type NotificationTheme = 'sunset' | 'ocean' | 'forest' | 'galaxy' | 'candy' | 'golden';

export interface NotificationPreferences {
  enabled: boolean;
  soundEnabled: boolean;
  volume: number;
  confettiEnabled: boolean;
  animationsEnabled: boolean;
  position: NotificationPosition;
  duration: number; // in seconds
  theme: NotificationTheme;
}

export const NOTIFICATION_THEMES: Record<NotificationTheme, { name: string; gradient: string; icon: string }> = {
  sunset: { name: 'Hoàng hôn', gradient: 'from-yellow-400 via-orange-400 to-red-400', icon: '🌅' },
  ocean: { name: 'Đại dương', gradient: 'from-cyan-400 via-blue-500 to-indigo-500', icon: '🌊' },
  forest: { name: 'Rừng xanh', gradient: 'from-green-400 via-emerald-500 to-teal-500', icon: '🌲' },
  galaxy: { name: 'Ngân hà', gradient: 'from-purple-500 via-pink-500 to-rose-500', icon: '🌌' },
  candy: { name: 'Kẹo ngọt', gradient: 'from-pink-400 via-fuchsia-400 to-purple-400', icon: '🍬' },
  golden: { name: 'Vàng kim', gradient: 'from-amber-400 via-yellow-500 to-orange-400', icon: '✨' },
};

const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: true,
  soundEnabled: true,
  volume: 50,
  confettiEnabled: true,
  animationsEnabled: true,
  position: 'top-right',
  duration: 5,
  theme: 'sunset',
};

const STORAGE_KEY = "coin_notification_preferences";

export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
      } catch {
        return DEFAULT_PREFERENCES;
      }
    }
    return DEFAULT_PREFERENCES;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  const updatePreferences = (updates: Partial<NotificationPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...updates }));
  };

  const resetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES);
  };

  return {
    preferences,
    updatePreferences,
    resetPreferences,
  };
}
