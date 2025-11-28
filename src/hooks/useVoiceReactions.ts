import { useEffect, useState } from 'react';

interface VoiceReaction {
  text: string;
  pitch: number;
  rate: number;
}

const CHARACTER_VOICES = {
  bunny: { pitch: 1.8, rate: 1.2 }, // High-pitched, fast
  fox: { pitch: 1.5, rate: 1.1 }, // Medium-high, slightly fast
  bear: { pitch: 0.8, rate: 0.9 }, // Deep, slow
  penguin: { pitch: 1.6, rate: 1.3 }, // High-pitched, very fast
  dog: { pitch: 1.3, rate: 1.2 }, // Medium-high, fast
  cat: { pitch: 1.7, rate: 1.0 }, // High-pitched, normal speed
};

const POSITIVE_REACTIONS = [
  "Yummy!",
  "Delicious!",
  "So tasty!",
  "Amazing!",
  "More please!",
  "I love it!",
  "Super yummy!",
  "Best food ever!",
  "Nom nom nom!",
  "Incredible!",
  "Fantastic!",
  "Wonderful!",
  "Perfect!",
  "So good!",
  "Mmmmm!",
];

const SPECIAL_REACTIONS = {
  veggies: [
    "Crunchy and fresh!",
    "Healthy and delicious!",
    "Garden goodness!",
    "So green and yummy!",
  ],
  fruits: [
    "So sweet!",
    "Juicy and fresh!",
    "Fruity delight!",
    "Nature's candy!",
  ],
  sweets: [
    "Sweet tooth satisfied!",
    "Sugar rush!",
    "Candy heaven!",
    "Sweetness overload!",
  ],
  proteins: [
    "So filling!",
    "Power food!",
    "Strong and tasty!",
    "Energy boost!",
  ],
  carbs: [
    "Comfort food!",
    "Warm and cozy!",
    "Belly full!",
    "So satisfying!",
  ],
};

export const useVoiceReactions = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      speechSynthesis.cancel();
    };
  }, []);

  const getRandomReaction = (favoriteCategory?: string): string => {
    // 70% chance for category-specific reaction if category matches
    if (favoriteCategory && Math.random() > 0.3) {
      const categoryReactions = SPECIAL_REACTIONS[favoriteCategory as keyof typeof SPECIAL_REACTIONS];
      if (categoryReactions) {
        return categoryReactions[Math.floor(Math.random() * categoryReactions.length)];
      }
    }
    
    // Default to positive reactions
    return POSITIVE_REACTIONS[Math.floor(Math.random() * POSITIVE_REACTIONS.length)];
  };

  const speak = (
    characterId: string,
    text: string,
    onEnd?: () => void
  ) => {
    if (!isEnabled || !('speechSynthesis' in window)) {
      onEnd?.();
      return;
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Get character voice settings
    const voiceSettings = CHARACTER_VOICES[characterId as keyof typeof CHARACTER_VOICES] || 
                         CHARACTER_VOICES.bunny;
    
    utterance.pitch = voiceSettings.pitch;
    utterance.rate = voiceSettings.rate;
    utterance.volume = 1.0;

    // Try to use a child-friendly voice (look for female voices as they tend to be higher pitched)
    const preferredVoice = voices.find(v => 
      v.name.toLowerCase().includes('female') || 
      v.name.toLowerCase().includes('samantha') ||
      v.name.toLowerCase().includes('victoria')
    ) || voices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      onEnd?.();
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
      onEnd?.();
    };

    speechSynthesis.speak(utterance);
  };

  const speakReaction = (
    characterId: string,
    favoriteCategory?: string,
    onEnd?: () => void
  ) => {
    const reaction = getRandomReaction(favoriteCategory);
    speak(characterId, reaction, onEnd);
  };

  const stop = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const toggle = () => {
    setIsEnabled(!isEnabled);
    if (!isEnabled) {
      stop();
    }
  };

  return {
    speak,
    speakReaction,
    stop,
    toggle,
    isEnabled,
    isSpeaking,
  };
};
