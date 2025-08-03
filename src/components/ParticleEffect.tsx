'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  alpha: number;
}

interface ParticleEffectProps {
  type: 'fire' | 'water' | 'electric' | 'grass' | 'psychic' | 'impact';
  isActive: boolean;
  onComplete?: () => void;
  x?: number;
  y?: number;
}

export default function ParticleEffect({ type, isActive, onComplete, x = 50, y = 50 }: ParticleEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 300;

    particlesRef.current = createParticles(type, x, y);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particlesRef.current = particlesRef.current.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life--;
        particle.alpha = particle.life / particle.maxLife;

        if (type === 'fire') {
          particle.vy -= 0.1; // Fire rises
          particle.size *= 0.98; // Fire shrinks
        } else if (type === 'water') {
          particle.vy += 0.05; // Water falls
        } else if (type === 'electric') {
          particle.vx += (Math.random() - 0.5) * 0.5; // Electric jitters
          particle.vy += (Math.random() - 0.5) * 0.5;
        }

        ctx.save();
        ctx.globalAlpha = particle.alpha;
        ctx.fillStyle = particle.color;
        
        if (type === 'electric') {
          // Draw lightning-like lines
          ctx.strokeStyle = particle.color;
          ctx.lineWidth = particle.size;
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(particle.x + Math.random() * 10 - 5, particle.y + Math.random() * 10 - 5);
          ctx.stroke();
        } else if (type === 'psychic') {
          // Draw glowing orbs
          const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.size);
          gradient.addColorStop(0, particle.color);
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Draw regular particles
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.restore();

        return particle.life > 0;
      });

      if (particlesRef.current.length > 0) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, type, x, y, onComplete]);

  const createParticles = (effectType: string, centerX: number, centerY: number): Particle[] => {
    const particles: Particle[] = [];
    const count = effectType === 'electric' ? 15 : 30;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = Math.random() * 3 + 1;
      
      let particle: Particle;

      switch (effectType) {
        case 'fire':
          particle = {
            x: centerX + Math.random() * 20 - 10,
            y: centerY + Math.random() * 20 - 10,
            vx: Math.cos(angle) * speed * 0.5,
            vy: Math.sin(angle) * speed * 0.5 - 1,
            life: 60 + Math.random() * 30,
            maxLife: 60 + Math.random() * 30,
            color: `hsl(${Math.random() * 60}, 100%, ${50 + Math.random() * 30}%)`,
            size: Math.random() * 4 + 2,
            alpha: 1
          };
          break;

        case 'water':
          particle = {
            x: centerX + Math.random() * 30 - 15,
            y: centerY + Math.random() * 30 - 15,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed * 0.3,
            life: 40 + Math.random() * 20,
            maxLife: 40 + Math.random() * 20,
            color: `hsl(${200 + Math.random() * 40}, 80%, ${40 + Math.random() * 40}%)`,
            size: Math.random() * 3 + 1,
            alpha: 1
          };
          break;

        case 'electric':
          particle = {
            x: centerX + Math.random() * 40 - 20,
            y: centerY + Math.random() * 40 - 20,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 20 + Math.random() * 15,
            maxLife: 20 + Math.random() * 15,
            color: `hsl(${50 + Math.random() * 10}, 100%, ${70 + Math.random() * 30}%)`,
            size: Math.random() * 2 + 1,
            alpha: 1
          };
          break;

        case 'grass':
          particle = {
            x: centerX + Math.random() * 25 - 12.5,
            y: centerY + Math.random() * 25 - 12.5,
            vx: Math.cos(angle) * speed * 0.7,
            vy: Math.sin(angle) * speed * 0.7 - 0.5,
            life: 50 + Math.random() * 25,
            maxLife: 50 + Math.random() * 25,
            color: `hsl(${90 + Math.random() * 40}, 70%, ${30 + Math.random() * 40}%)`,
            size: Math.random() * 3 + 1.5,
            alpha: 1
          };
          break;

        case 'psychic':
          particle = {
            x: centerX + Math.random() * 35 - 17.5,
            y: centerY + Math.random() * 35 - 17.5,
            vx: Math.cos(angle) * speed * 0.6,
            vy: Math.sin(angle) * speed * 0.6,
            life: 70 + Math.random() * 30,
            maxLife: 70 + Math.random() * 30,
            color: `hsl(${280 + Math.random() * 40}, 80%, ${50 + Math.random() * 30}%)`,
            size: Math.random() * 5 + 2,
            alpha: 1
          };
          break;

        default: // impact
          particle = {
            x: centerX + Math.random() * 20 - 10,
            y: centerY + Math.random() * 20 - 10,
            vx: Math.cos(angle) * speed * 2,
            vy: Math.sin(angle) * speed * 2,
            life: 30 + Math.random() * 15,
            maxLife: 30 + Math.random() * 15,
            color: `hsl(${Math.random() * 60}, 70%, ${60 + Math.random() * 20}%)`,
            size: Math.random() * 2 + 1,
            alpha: 1
          };
      }

      particles.push(particle);
    }

    return particles;
  };

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-20"
      style={{ width: '100%', height: '100%' }}
    />
  );
}