import { useCallback, useRef } from "react";

interface UseDoubleTapOptions {
  onDoubleTap: () => void;
  onSingleTap?: () => void;
  delay?: number;
}

export function useDoubleTap({ onDoubleTap, onSingleTap, delay = 300 }: UseDoubleTapOptions) {
  const lastTapRef = useRef<number>(0);
  const singleTapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTap = useCallback((event: React.TouchEvent | React.MouseEvent) => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;

    if (singleTapTimeoutRef.current) {
      clearTimeout(singleTapTimeoutRef.current);
      singleTapTimeoutRef.current = null;
    }

    if (timeSinceLastTap < delay && timeSinceLastTap > 0) {
      // Double tap detected
      lastTapRef.current = 0;
      onDoubleTap();
    } else {
      // Potential single tap - wait to see if another tap comes
      lastTapRef.current = now;
      
      if (onSingleTap) {
        singleTapTimeoutRef.current = setTimeout(() => {
          onSingleTap();
          singleTapTimeoutRef.current = null;
        }, delay);
      }
    }
  }, [onDoubleTap, onSingleTap, delay]);

  return {
    onTouchEnd: handleTap,
    onClick: handleTap,
  };
}
