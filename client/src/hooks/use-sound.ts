import { useCallback, useRef, useState } from 'react';

export type SoundType = 'like' | 'unlike' | 'swipe' | 'snap' | 'pop' | 'notification';

export function useSound() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [soundEnabled, setSoundEnabledState] = useState(true);

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current && typeof window !== 'undefined') {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.warn('Audio context not supported');
      }
    }
  }, []);

  const playSound = useCallback((type: SoundType, volume: number = 0.3) => {
    if (!soundEnabled) return;
    
    initAudioContext();
    if (!audioContextRef.current) return;

    try {
      const context = audioContextRef.current;
      if (context.state === 'suspended') {
        context.resume();
      }

      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      gainNode.gain.value = volume;
      oscillator.type = 'sine';

      let duration = 0.1; // Default duration

      switch (type) {
        case 'like':
          // Premium like sound - clean ascending tone
          oscillator.frequency.setValueAtTime(500, context.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(1000, context.currentTime + 0.12);
          gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.18);
          duration = 0.18;
          break;
        case 'unlike':
          // Unlike sound - same like sound but pitch-shifted down for darker tone
          oscillator.frequency.setValueAtTime(375, context.currentTime); // 25% lower
          oscillator.frequency.exponentialRampToValueAtTime(750, context.currentTime + 0.12); // 25% lower
          gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.18);
          duration = 0.18;
          break;
        case 'swipe':
          // Whoosh sound - descending tone
          oscillator.frequency.setValueAtTime(600, context.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(200, context.currentTime + 0.2);
          gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);
          duration = 0.2;
          break;
        case 'snap':
          // Snap sound - quick pop
          oscillator.frequency.setValueAtTime(800, context.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.05);
          duration = 0.05;
          break;
        case 'pop':
          // Pop sound - quick burst
          oscillator.frequency.setValueAtTime(500, context.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(1000, context.currentTime + 0.05);
          gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.08);
          duration = 0.08;
          break;
        case 'notification':
          // Notification - two tone beep
          oscillator.frequency.setValueAtTime(600, context.currentTime);
          oscillator.frequency.setValueAtTime(800, context.currentTime + 0.1);
          gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
          duration = 0.3;
          break;
      }

      // Start the oscillator first, then schedule stop
      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + duration);
      
    } catch (error) {
      // Silently handle audio errors to prevent runtime crashes
      console.warn('Audio playback error:', error);
    }
  }, [initAudioContext, soundEnabled]);

  const toggleSound = useCallback(() => {
    setSoundEnabledState(!soundEnabled);
    return !soundEnabled;
  }, [soundEnabled]);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    setSoundEnabledState(enabled);
  }, []);

  return { 
    playSound, 
    toggleSound, 
    setSoundEnabled,
    soundEnabled
  };
}