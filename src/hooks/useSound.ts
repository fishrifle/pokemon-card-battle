import { useCallback, useRef } from 'react';

export const useSound = () => {
  const audioContext = useRef<AudioContext | null>(null);

  const initAudioContext = useCallback(() => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContext.current;
  }, []);

  const playSound = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.02) => {
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
    playSound(800, 0.05, 'sine', 0.01);
  }, [playSound]);

  const playCardFlip = useCallback(() => {
    playSound(400, 0.08, 'square', 0.008);
    setTimeout(() => playSound(600, 0.05, 'square', 0.008), 25);
  }, [playSound]);

  const playAttack = useCallback((moveType: string) => {
    const soundMap: Record<string, () => void> = {
      Fire: () => {
        playSound(200, 0.1, 'sawtooth', 0.015);
      },
      Water: () => {
        playSound(300, 0.1, 'sine', 0.012);
      },
      Electric: () => {
        playSound(800, 0.05, 'square', 0.01);
      },
      Grass: () => {
        playSound(350, 0.1, 'triangle', 0.01);
      },
      Psychic: () => {
        playSound(600, 0.1, 'sine', 0.012);
      },
      default: () => {
        playSound(400, 0.1, 'square', 0.01);
      }
    };

    (soundMap[moveType] || soundMap.default)();
  }, [playSound]);

  const playCriticalHit = useCallback(() => {
    playSound(1000, 0.05, 'square', 0.015);
  }, [playSound]);

  const playVictory = useCallback(() => {
    playSound(659, 0.2, 'triangle', 0.02);
    setTimeout(() => playSound(784, 0.2, 'triangle', 0.02), 100);
  }, [playSound]);

  const playDefeat = useCallback(() => {
    playSound(300, 0.3, 'sine', 0.015);
  }, [playSound]);

  const playBattleStart = useCallback(() => {
    playSound(600, 0.1, 'triangle', 0.02);
  }, [playSound]);

  const playBackgroundMusic = useCallback(() => {
    const ctx = initAudioContext();
    
    // Create a simple ambient loop
    const playAmbientTone = (frequency: number, duration: number, delay: number) => {
      setTimeout(() => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.005, ctx.currentTime + 0.5);
        gainNode.gain.linearRampToValueAtTime(0.005, ctx.currentTime + duration - 0.5);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);
      }, delay);
    };

    // Play ambient tones in sequence
    const ambientSequence = [
      { freq: 220, duration: 4, delay: 0 },
      { freq: 330, duration: 3, delay: 2000 },
      { freq: 275, duration: 3.5, delay: 4000 },
      { freq: 440, duration: 2.5, delay: 6000 }
    ];

    ambientSequence.forEach(tone => {
      playAmbientTone(tone.freq, tone.duration, tone.delay);
    });

    // Loop the sequence
    setTimeout(() => playBackgroundMusic(), 8000);
  }, [initAudioContext]);

  const playArenaAmbience = useCallback(() => {
    const ctx = initAudioContext();
    
    // Create crowd-like ambient noise
    const createNoise = () => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filterNode = ctx.createBiquadFilter();
      
      oscillator.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = 100 + Math.random() * 200;
      oscillator.type = 'sawtooth';
      
      filterNode.frequency.value = 500 + Math.random() * 1000;
      filterNode.Q.value = 0.5;
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.002, ctx.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(0.002, ctx.currentTime + 0.8);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 1);
    };

    // Create multiple noise sources
    for (let i = 0; i < 3; i++) {
      setTimeout(() => createNoise(), i * 200);
    }

    // Continue ambient sounds
    setTimeout(() => playArenaAmbience(), 2000 + Math.random() * 1000);
  }, [initAudioContext]);

  return {
    playCardSelect,
    playCardFlip,
    playAttack,
    playCriticalHit,
    playVictory,
    playDefeat,
    playBattleStart,
    playBackgroundMusic,
    playArenaAmbience
  };
};