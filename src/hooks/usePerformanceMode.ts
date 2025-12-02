import { useState, useEffect } from 'react';
import { useIsMobile } from './use-mobile';

export const usePerformanceMode = () => {
  const isMobile = useIsMobile();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    // Detect low-end devices (rough heuristic based on hardware concurrency)
    const cores = navigator.hardwareConcurrency || 4;
    setIsLowEndDevice(cores < 4);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return {
    // Use performance mode on mobile or low-end devices or when user prefers reduced motion
    shouldReduceAnimations: isMobile || prefersReducedMotion || isLowEndDevice,
    isMobile,
    prefersReducedMotion,
    isLowEndDevice,
  };
};
