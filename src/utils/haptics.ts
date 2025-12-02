/**
 * Vibration utility functions for mobile haptic feedback
 */

export const haptics = {
  /**
   * Light tap feedback for button presses
   */
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },

  /**
   * Medium feedback for game actions
   */
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(20);
    }
  },

  /**
   * Strong feedback for important events
   */
  strong: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  },

  /**
   * Success pattern - double tap
   */
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([30, 50, 30]);
    }
  },

  /**
   * Error pattern - strong single
   */
  error: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(100);
    }
  },

  /**
   * Selection pattern - quick tap
   */
  selection: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(5);
    }
  }
};
