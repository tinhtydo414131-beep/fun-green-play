import { useState, useCallback } from 'react';

interface VoiceConfig {
  lang: string;
  rate: number;
  pitch: number;
  volume: number;
}

export const useVietnameseVoice = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(
    typeof window !== 'undefined' && 'speechSynthesis' in window
  );

  const speak = useCallback((text: string, config?: Partial<VoiceConfig>) => {
    if (!isSupported || !text) return;

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Vietnamese voice configuration
    utterance.lang = config?.lang || 'vi-VN';
    utterance.rate = config?.rate || 0.9; // Slightly slower for clarity
    utterance.pitch = config?.pitch || 1.1; // Slightly higher for cheerful tone
    utterance.volume = config?.volume || 1;

    // Try to find Vietnamese voice
    const voices = window.speechSynthesis.getVoices();
    const vietnameseVoice = voices.find(voice => 
      voice.lang.includes('vi') || voice.lang.includes('VN')
    );
    
    if (vietnameseVoice) {
      utterance.voice = vietnameseVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [isSupported]);

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
  };
};
