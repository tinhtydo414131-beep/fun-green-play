import { useEffect, useRef, useState } from 'react';

export const useGameAudio = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isMusicEnabled, setIsMusicEnabled] = useState(true);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const musicNodeRef = useRef<OscillatorNode | null>(null);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      stopBackgroundMusic();
      audioContextRef.current?.close();
    };
  }, []);

  const playSound = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
    if (!isSoundEnabled || !audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  };

  const playClick = () => {
    playSound(800, 0.1, 'sine');
  };

  const playSuccess = () => {
    if (!isSoundEnabled || !audioContextRef.current) return;
    const ctx = audioContextRef.current;
    
    // Play a cheerful ascending melody
    [523, 659, 784, 1047].forEach((freq, i) => {
      setTimeout(() => playSound(freq, 0.2, 'sine'), i * 100);
    });
  };

  const playError = () => {
    if (!isSoundEnabled || !audioContextRef.current) return;
    playSound(200, 0.3, 'sawtooth');
  };

  const playPop = () => {
    playSound(1200, 0.1, 'sine');
  };

  const playJump = () => {
    if (!isSoundEnabled || !audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.setValueAtTime(300, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
    oscillator.type = 'square';

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
  };

  const playScore = () => {
    playSound(1000, 0.15, 'triangle');
  };

  const startBackgroundMusic = () => {
    if (!isMusicEnabled || !audioContextRef.current || musicNodeRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.value = 440;
    filter.type = 'lowpass';
    filter.frequency.value = 1000;
    gainNode.gain.value = 0.05;

    // Create a simple melody pattern
    const notes = [440, 494, 523, 587, 523, 494]; // A, B, C, D, C, B
    let noteIndex = 0;

    const playNextNote = () => {
      if (oscillator && audioContextRef.current) {
        oscillator.frequency.setValueAtTime(notes[noteIndex], ctx.currentTime);
        noteIndex = (noteIndex + 1) % notes.length;
      }
    };

    const intervalId = setInterval(playNextNote, 500);

    oscillator.start();
    musicNodeRef.current = oscillator;

    // Store interval ID for cleanup
    (oscillator as any).intervalId = intervalId;
  };

  const stopBackgroundMusic = () => {
    if (musicNodeRef.current) {
      const intervalId = (musicNodeRef.current as any).intervalId;
      if (intervalId) clearInterval(intervalId);
      
      musicNodeRef.current.stop();
      musicNodeRef.current = null;
    }
  };

  const toggleMusic = () => {
    setIsMusicEnabled(!isMusicEnabled);
    if (isMusicEnabled) {
      stopBackgroundMusic();
    } else {
      startBackgroundMusic();
    }
  };

  const toggleSound = () => {
    setIsSoundEnabled(!isSoundEnabled);
  };

  return {
    playClick,
    playSuccess,
    playError,
    playPop,
    playJump,
    playScore,
    startBackgroundMusic,
    stopBackgroundMusic,
    toggleMusic,
    toggleSound,
    isMusicEnabled,
    isSoundEnabled,
  };
};
