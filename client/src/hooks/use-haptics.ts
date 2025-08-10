import { useCallback } from 'react';

export type HapticType = 'light' | 'medium' | 'heavy' | 'selection' | 'impact' | 'notification';

export function useHaptics() {
  const triggerHaptic = useCallback((type: HapticType = 'light') => {
    // Check if haptics are supported
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      switch (type) {
        case 'light':
          navigator.vibrate(10);
          break;
        case 'medium':
          navigator.vibrate(20);
          break;
        case 'heavy':
          navigator.vibrate(50);
          break;
        case 'selection':
          navigator.vibrate([5, 5, 5]);
          break;
        case 'impact':
          navigator.vibrate([10, 10, 10]);
          break;
        case 'notification':
          navigator.vibrate([20, 10, 20]);
          break;
        default:
          navigator.vibrate(10);
      }
    }
  }, []);

  return { triggerHaptic };
}