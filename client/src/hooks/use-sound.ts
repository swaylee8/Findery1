import { useCallback } from 'react';

export type SoundType = 'like' | 'unlike' | 'swipe' | 'snap' | 'pop' | 'notification';

export function useSound() {
  // All sound functionality disabled - returning no-op functions
  const playSound = useCallback((type: SoundType, volume: number = 0.3) => {
    // No sound effects - keeping for interface compatibility
  }, []);

  const toggleSound = useCallback(() => {
    return false; // Always disabled
  }, []);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    // No-op - sound is permanently disabled
  }, []);

  return { 
    playSound, 
    toggleSound, 
    setSoundEnabled,
    soundEnabled: false // Always disabled
  };
}