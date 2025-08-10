import { useCallback, useRef } from 'react';

export type SoundType = 'like' | 'swipe' | 'snap' | 'pop' | 'notification';

export function useSound() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundEnabledRef = useRef(true);

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
    if (!soundEnabledRef.current) return;
    
    initAudioContext();
    if (!audioContextRef.current) return;

    const context = audioContextRef.current;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    gainNode.gain.value = volume;

    switch (type) {
      case 'like':
        // Heart sound - quick ascending tone
        oscillator.frequency.setValueAtTime(400, context.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, context.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.15);
        oscillator.stop(context.currentTime + 0.15);
        break;
      case 'swipe':
        // Whoosh sound - descending tone
        oscillator.frequency.setValueAtTime(600, context.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, context.currentTime + 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);
        oscillator.stop(context.currentTime + 0.2);
        break;
      case 'snap':
        // Snap sound - quick pop
        oscillator.frequency.setValueAtTime(800, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.05);
        oscillator.stop(context.currentTime + 0.05);
        break;
      case 'pop':
        // Pop sound - quick burst
        oscillator.frequency.setValueAtTime(500, context.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1000, context.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.08);
        oscillator.stop(context.currentTime + 0.08);
        break;
      case 'notification':
        // Notification - two tone beep
        oscillator.frequency.setValueAtTime(600, context.currentTime);
        oscillator.frequency.setValueAtTime(800, context.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
        oscillator.stop(context.currentTime + 0.3);
        break;
    }

    oscillator.type = 'sine';
    try {
      oscillator.start(context.currentTime);
    } catch (error) {
      // Oscillator already started or context issues
      console.warn('Audio oscillator error:', error);
    }
  }, [initAudioContext]);

  const toggleSound = useCallback(() => {
    soundEnabledRef.current = !soundEnabledRef.current;
    return soundEnabledRef.current;
  }, []);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    soundEnabledRef.current = enabled;
  }, []);

  return { 
    playSound, 
    toggleSound, 
    setSoundEnabled,
    soundEnabled: soundEnabledRef.current
  };
}