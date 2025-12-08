import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiEffectProps {
  trigger: boolean;
  type?: 'celebration' | 'reward' | 'achievement';
}

export function ConfettiEffect({ trigger, type = 'celebration' }: ConfettiEffectProps) {
  useEffect(() => {
    if (!trigger) return;

    const colors = {
      celebration: ['#FF6B00', '#0066FF', '#FFD700', '#FF69B4', '#00FF7F'],
      reward: ['#FFD700', '#FFA500', '#FF6B00', '#FFFF00'],
      achievement: ['#8B46FF', '#FF6B00', '#FFD700', '#00FF7F', '#FF69B4'],
    };

    const duration = type === 'achievement' ? 5000 : 3000;
    const particleCount = type === 'achievement' ? 150 : 100;

    // Fire confetti
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: colors[type],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: colors[type],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    // Initial burst
    confetti({
      particleCount,
      spread: 100,
      origin: { y: 0.6 },
      colors: colors[type],
    });

    frame();
  }, [trigger, type]);

  return null;
}

// Fire confetti programmatically
export const fireConfetti = (type: 'celebration' | 'reward' | 'achievement' = 'celebration') => {
  const colors = {
    celebration: ['#FF6B00', '#0066FF', '#FFD700', '#FF69B4', '#00FF7F'],
    reward: ['#FFD700', '#FFA500', '#FF6B00', '#FFFF00'],
    achievement: ['#8B46FF', '#FF6B00', '#FFD700', '#00FF7F', '#FF69B4'],
  };

  confetti({
    particleCount: 100,
    spread: 100,
    origin: { y: 0.6 },
    colors: colors[type],
  });

  // Side cannons
  const end = Date.now() + 2000;
  const frame = () => {
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors: colors[type],
    });
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors: colors[type],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  frame();
};
