import { useCallback, useRef } from 'react';

export const useSound = () => {
  const audioContext = useRef<AudioContext | null>(null);

  const initAudioContext = useCallback(() => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContext.current;
  }, []);

  const playSound = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.1) => {
    const ctx = initAudioContext();
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }, [initAudioContext]);

  const playCardSelect = useCallback(() => {
    playSound(800, 0.1, 'sine', 0.05);
  }, [playSound]);

  const playCardFlip = useCallback(() => {
    playSound(400, 0.15, 'square', 0.03);
    setTimeout(() => playSound(600, 0.1, 'square', 0.03), 50);
  }, [playSound]);

  const playAttack = useCallback((moveType: string) => {
    const soundMap: Record<string, () => void> = {
      Fire: () => {
        playSound(200, 0.3, 'sawtooth', 0.08);
        setTimeout(() => playSound(400, 0.2, 'triangle', 0.06), 100);
      },
      Water: () => {
        playSound(300, 0.4, 'sine', 0.06);
        setTimeout(() => playSound(250, 0.3, 'sine', 0.04), 150);
      },
      Electric: () => {
        for (let i = 0; i < 5; i++) {
          setTimeout(() => playSound(800 + Math.random() * 400, 0.05, 'square', 0.04), i * 30);
        }
      },
      Grass: () => {
        playSound(350, 0.3, 'triangle', 0.05);
        setTimeout(() => playSound(280, 0.4, 'sine', 0.04), 100);
      },
      Psychic: () => {
        playSound(600, 0.5, 'sine', 0.06);
        setTimeout(() => playSound(800, 0.3, 'triangle', 0.04), 200);
      },
      default: () => {
        playSound(400, 0.3, 'square', 0.06);
      }
    };

    (soundMap[moveType] || soundMap.default)();
  }, [playSound]);

  const playCriticalHit = useCallback(() => {
    playSound(1000, 0.1, 'square', 0.08);
    setTimeout(() => playSound(1200, 0.15, 'sawtooth', 0.06), 50);
    setTimeout(() => playSound(800, 0.2, 'triangle', 0.04), 100);
  }, [playSound]);

  const playVictory = useCallback(() => {
    const notes = [523, 659, 784, 1047]; // C, E, G, C octave
    notes.forEach((note, index) => {
      setTimeout(() => playSound(note, 0.3, 'triangle', 0.06), index * 150);
    });
  }, [playSound]);

  const playDefeat = useCallback(() => {
    playSound(400, 0.8, 'sawtooth', 0.05);
    setTimeout(() => playSound(300, 0.6, 'sine', 0.04), 200);
    setTimeout(() => playSound(200, 1.0, 'triangle', 0.03), 400);
  }, [playSound]);

  const playBattleStart = useCallback(() => {
    playSound(600, 0.2, 'triangle', 0.06);
    setTimeout(() => playSound(800, 0.2, 'sine', 0.05), 100);
    setTimeout(() => playSound(1000, 0.3, 'square', 0.04), 200);
  }, [playSound]);

  return {
    playCardSelect,
    playCardFlip,
    playAttack,
    playCriticalHit,
    playVictory,
    playDefeat,
    playBattleStart
  };
};