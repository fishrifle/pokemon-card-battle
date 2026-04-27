'use client';

import { PokemonCard as PokemonCardType } from '@/types/pokemon';
import Image from 'next/image';
import { useState } from 'react';
import { useSound } from '@/hooks/useSound';

interface PokemonCardProps {
  pokemon: PokemonCardType;
  isSelected?: boolean;
  onSelect?: () => void;
  isFlipped?: boolean;
}

// Type color mappings - vibrant gradients
const typeColors: Record<string, { bg: string; border: string; accent: string }> = {
  Fire:     { bg: 'from-orange-500 via-red-600 to-orange-700',     border: '#F97316', accent: '#FCD34D' },
  Water:    { bg: 'from-blue-400 via-blue-600 to-cyan-600',         border: '#3B82F6', accent: '#67E8F9' },
  Grass:    { bg: 'from-green-400 via-emerald-600 to-green-700',    border: '#22C55E', accent: '#86EFAC' },
  Electric: { bg: 'from-yellow-300 via-yellow-500 to-amber-400',    border: '#EAB308', accent: '#FEF08A' },
  Psychic:  { bg: 'from-pink-500 via-fuchsia-600 to-pink-700',      border: '#EC4899', accent: '#F9A8D4' },
  Fighting: { bg: 'from-rose-700 via-red-800 to-red-900',           border: '#BE123C', accent: '#FDA4AF' },
  Rock:     { bg: 'from-stone-500 via-amber-700 to-stone-600',      border: '#A8A29E', accent: '#D6D3D1' },
  Ground:   { bg: 'from-amber-500 via-yellow-700 to-orange-800',    border: '#D97706', accent: '#FCD34D' },
  Flying:   { bg: 'from-sky-300 via-indigo-400 to-blue-500',        border: '#7DD3FC', accent: '#C7D2FE' },
  Bug:      { bg: 'from-lime-400 via-green-600 to-lime-700',        border: '#84CC16', accent: '#BEF264' },
  Poison:   { bg: 'from-purple-500 via-violet-700 to-purple-800',   border: '#9333EA', accent: '#C4B5FD' },
  Ghost:    { bg: 'from-indigo-800 via-purple-900 to-slate-900',    border: '#8B5CF6', accent: '#A78BFA' },
  Dragon:   { bg: 'from-indigo-500 via-purple-700 to-blue-800',     border: '#6366F1', accent: '#A5B4FC' },
  Ice:      { bg: 'from-cyan-200 via-sky-400 to-cyan-500',          border: '#06B6D4', accent: '#E0F2FE' },
  Steel:    { bg: 'from-slate-300 via-gray-500 to-zinc-500',        border: '#94A3B8', accent: '#E2E8F0' },
  Dark:     { bg: 'from-gray-800 via-indigo-950 to-gray-900',       border: '#8B5CF6', accent: '#818CF8' },
  Fairy:    { bg: 'from-pink-300 via-rose-400 to-pink-500',         border: '#F472B6', accent: '#FBCFE8' },
  Normal:   { bg: 'from-gray-300 via-stone-400 to-gray-500',        border: '#9CA3AF', accent: '#D1D5DB' },
};

export default function PokemonCard({ pokemon, isSelected = false, onSelect, isFlipped = false }: PokemonCardProps) {
  const [flipped, setFlipped] = useState(isFlipped);
  const { playCardSelect, playCardFlip } = useSound();

  const primaryType = pokemon.types[0] || 'Normal';
  const colors = typeColors[primaryType] || typeColors.Normal;
  const isLegendary = pokemon.rarity === 'legendary';
  const isRare = pokemon.rarity === 'rare' || isLegendary;

  return (
    <div
      className={`relative w-36 h-52 md:w-40 md:h-60 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
        isSelected ? 'ring-4 ring-yellow-400 scale-105' : ''
      }`}
      onClick={() => {
        playCardSelect();
        onSelect?.();
      }}
      onDoubleClick={() => {
        playCardFlip();
        setFlipped(!flipped);
      }}
    >
      <div
        className={`w-full h-full rounded-xl overflow-hidden shadow-xl ${
          isLegendary ? 'border-4' : isRare ? 'border-[3px]' : 'border-2'
        }`}
        style={{
          borderColor: colors.border,
          boxShadow: isRare ? `0 0 20px ${colors.border}50, 0 8px 32px rgba(0,0,0,0.3)` : '0 8px 32px rgba(0,0,0,0.3)',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.5s ease',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg}`} />

        {/* Holographic effects for rare/legendary */}
        {isRare && (
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10 animate-pulse" />
        )}
        {isLegendary && (
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
              style={{ animation: 'holoSweep 8s ease-in-out infinite 2s' }}
            />
          </div>
        )}

        {!flipped ? (
          <div className="relative flex flex-col h-full p-2">
            {/* Name at top */}
            <h3 className="font-bold text-sm md:text-base text-white text-center truncate drop-shadow-lg"
                style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
              {pokemon.name}
            </h3>

            {/* Pokemon image - BIGGER */}
            <div className="flex-1 flex items-center justify-center relative py-1">
              {/* Glow behind Pokemon */}
              <div className="absolute w-24 h-24 md:w-28 md:h-28 rounded-full bg-white/20 blur-xl" />
              <Image
                src={pokemon.image}
                alt={pokemon.name}
                width={90}
                height={90}
                className="pixelated relative z-10 drop-shadow-2xl md:w-[100px] md:h-[100px]"
              />
            </div>

            {/* Stats bar */}
            <div className="bg-black/50 rounded-lg p-1.5 backdrop-blur-sm space-y-1">
              {/* Special Move */}
              <div className="text-center py-0.5 rounded"
                   style={{ background: `linear-gradient(135deg, ${colors.border}40, ${colors.border}20)` }}>
                <span className="text-[9px] md:text-[10px] font-bold text-white/70 uppercase">Move:</span>
                <div className="text-[10px] md:text-xs font-bold truncate px-1"
                     style={{ color: colors.accent }}>
                  {pokemon.specialMove.name}
                </div>
              </div>

              {/* HP + ATK/DEF row */}
              <div className="flex gap-1 text-[10px]">
                <div className="flex-1 bg-green-600/80 rounded px-1 py-0.5 text-center">
                  <span className="text-white font-bold">{pokemon.hp}</span>
                  <span className="text-green-200 ml-0.5">HP</span>
                </div>
                <div className="flex-1 bg-orange-600/80 rounded px-1 py-0.5 text-center">
                  <span className="text-white font-bold">{pokemon.attack}</span>
                  <span className="text-orange-200 ml-0.5">ATK</span>
                </div>
                <div className="flex-1 bg-blue-600/80 rounded px-1 py-0.5 text-center">
                  <span className="text-white font-bold">{pokemon.defense}</span>
                  <span className="text-blue-200 ml-0.5">DEF</span>
                </div>
              </div>

              {/* Types */}
              <div className="flex justify-center gap-1">
                {pokemon.types.slice(0, 2).map((type) => {
                  const tColor = typeColors[type] || typeColors.Normal;
                  return (
                    <span
                      key={type}
                      className="text-[8px] md:text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase text-white"
                      style={{ background: tColor.border }}
                    >
                      {type}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Rarity stars */}
            <div className="absolute top-1 right-1 text-[10px]">
              {isLegendary && <span className="text-yellow-400">&#9733;&#9733;&#9733;</span>}
              {pokemon.rarity === 'rare' && <span className="text-yellow-400">&#9733;&#9733;</span>}
              {pokemon.rarity === 'uncommon' && <span className="text-gray-300">&#9733;</span>}
            </div>
          </div>
        ) : (
          <div className="relative flex flex-col h-full justify-center items-center p-3 rotateY-180">
            <h3 className="font-bold text-base text-white text-center drop-shadow-lg mb-2">{pokemon.name}</h3>

            <div className="text-center space-y-2 w-full">
              <div className="bg-green-600/90 rounded-lg px-3 py-1.5 shadow-lg">
                <div className="text-xs font-bold text-green-200">WINS</div>
                <div className="text-2xl font-bold text-white">{pokemon.wins}</div>
              </div>

              <div className="bg-red-600/90 rounded-lg px-3 py-1.5 shadow-lg">
                <div className="text-xs font-bold text-red-200">LOSSES</div>
                <div className="text-2xl font-bold text-white">{pokemon.losses}</div>
              </div>

              <div className="bg-blue-600/90 rounded-lg px-3 py-1 shadow-lg">
                <div className="text-xs font-bold text-blue-200">RATIO</div>
                <div className="text-lg font-bold text-white">
                  {pokemon.losses === 0 ? (pokemon.wins === 0 ? '0.00' : '∞') : (pokemon.wins / pokemon.losses).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes holoSweep {
          0% { transform: translateX(-200%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
      `}</style>
    </div>
  );
}