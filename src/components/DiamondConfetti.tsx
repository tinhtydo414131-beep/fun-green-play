import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface DiamondConfettiProps {
  trigger: boolean;
  intensity?: 'light' | 'medium' | 'heavy' | 'rainbow';
}

export const DiamondConfetti = ({ trigger, intensity = 'medium' }: DiamondConfettiProps) => {
  useEffect(() => {
    if (!trigger) return;

    const colors = intensity === 'rainbow' 
      ? ['#FF6B35', '#4ECDC4', '#FFE66D', '#FF69B4', '#9B59B6', '#3498DB', '#2ECC71']
      : ['#4ECDC4', '#FFE66D', '#FF6B35', '#FF69B4'];

    const particleCount = {
      light: 50,
      medium: 100,
      heavy: 200,
      rainbow: 300
    }[intensity];

    // Diamond burst from center
    confetti({
      particleCount,
      spread: 120,
      origin: { y: 0.5, x: 0.5 },
      colors,
      shapes: ['circle', 'square'],
      scalar: 1.2
    });

    // Side cannons for rainbow effect
    if (intensity === 'rainbow' || intensity === 'heavy') {
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors
        });
      }, 200);
    }
  }, [trigger, intensity]);

  return null;
};

export const fireDiamondConfetti = (type: 'celebration' | 'reward' | 'achievement' | 'rainbow' = 'celebration') => {
  const colors = {
    celebration: ['#4ECDC4', '#FFE66D', '#FF6B35'],
    reward: ['#FFD700', '#FFA500', '#FF6B35'],
    achievement: ['#9B59B6', '#3498DB', '#2ECC71'],
    rainbow: ['#FF6B35', '#4ECDC4', '#FFE66D', '#FF69B4', '#9B59B6', '#3498DB', '#2ECC71']
  }[type];

  const count = type === 'rainbow' ? 300 : 150;

  // Main burst
  confetti({
    particleCount: count,
    spread: 100,
    origin: { y: 0.6 },
    colors,
    shapes: ['circle', 'square'],
    scalar: 1.1,
    gravity: 1,
    drift: 0
  });

  // Delayed side bursts for continuous effect
  if (type === 'rainbow' || type === 'achievement') {
    const interval = setInterval(() => {
      confetti({
        particleCount: 30,
        angle: 60,
        spread: 50,
        origin: { x: 0. },
        colors
      });
      confetti({
        particleCount: 30,
        angle: 120,
        spread: 50,
        origin: { x: 1 },
        colors
      });
    }, 250);

    setTimeout(() => clearInterval(interval), 2000);
  }
};
