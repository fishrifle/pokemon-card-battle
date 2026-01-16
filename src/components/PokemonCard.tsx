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
  Fire: { bg: 'from-orange-500 via-red-600 to-orange-700', border: '#f97316', accent: '#fbbf24' },
  Water: { bg: 'from-blue-400 via-blue-600 to-cyan-600', border: '#3b82f6', accent: '#67e8f9' },
  Grass: { bg: 'from-green-400 via-emerald-600 to-green-700', border: '#22c55e', accent: '#86efac' },
  Electric: { bg: 'from-yellow-300 via-yellow-500 to-amber-500', border: '#eab308', accent: '#fef08a' },
  Psychic: { bg: 'from-pink-400 via-purple-500 to-fuchsia-600', border: '#d946ef', accent: '#f0abfc' },
  Fighting: { bg: 'from-orange-600 via-red-700 to-amber-800', border: '#c2410c', accent: '#fdba74' },
  Rock: { bg: 'from-stone-400 via-amber-700 to-stone-600', border: '#a8a29e', accent: '#d6d3d1' },
  Ground: { bg: 'from-amber-500 via-yellow-700 to-orange-800', border: '#d97706', accent: '#fcd34d' },
  Flying: { bg: 'from-sky-300 via-indigo-400 to-blue-500', border: '#7dd3fc', accent: '#c7d2fe' },
  Bug: { bg: 'from-lime-400 via-green-600 to-lime-700', border: '#84cc16', accent: '#bef264' },
  Poison: { bg: 'from-purple-500 via-violet-700 to-purple-800', border: '#9333ea', accent: '#c4b5fd' },
  Ghost: { bg: 'from-purple-700 via-indigo-900 to-slate-900', border: '#6b21a8', accent: '#a78bfa' },
  Dragon: { bg: 'from-indigo-500 via-purple-700 to-blue-800', border: '#4f46e5', accent: '#a5b4fc' },
  Ice: { bg: 'from-cyan-200 via-sky-400 to-blue-400', border: '#67e8f9', accent: '#e0f2fe' },
  Steel: { bg: 'from-slate-300 via-gray-500 to-zinc-500', border: '#94a3b8', accent: '#e2e8f0' },
  Dark: { bg: 'from-gray-700 via-slate-900 to-black', border: '#374151', accent: '#6b7280' },
  Fairy: { bg: 'from-pink-300 via-rose-400 to-pink-500', border: '#f472b6', accent: '#fbcfe8' },
  Normal: { bg: 'from-gray-300 via-stone-500 to-gray-500', border: '#9ca3af', accent: '#d1d5db' },
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
        className={`w-full h-full rounded-xl overflow-hidden shadow-xl transition-transform duration-500 ${flipped ? 'rotateY-180' : ''} ${
          isLegendary ? 'border-4' : isRare ? 'border-3' : 'border-2'
        }`}
        style={{
          borderColor: colors.border,
          boxShadow: isRare ? `0 0 20px ${colors.border}50, 0 8px 32px rgba(0,0,0,0.3)` : '0 8px 32px rgba(0,0,0,0.3)'
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
              style={{ animation: 'holoSweep 3s ease-in-out infinite' }}
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
              {/* HP */}
              <div className="flex items-center justify-between text-white text-xs font-bold">
                <span>HP</span>
                <span style={{ color: colors.accent }}>{pokemon.hp}</span>
              </div>

              {/* ATK / DEF */}
              <div className="flex gap-2 text-xs">
                <div className="flex-1 bg-orange-600/80 rounded px-1.5 py-0.5 text-center">
                  <span className="text-white font-bold">{pokemon.attack}</span>
                  <span className="text-orange-200 ml-1">ATK</span>
                </div>
                <div className="flex-1 bg-blue-600/80 rounded px-1.5 py-0.5 text-center">
                  <span className="text-white font-bold">{pokemon.defense}</span>
                  <span className="text-blue-200 ml-1">DEF</span>
                </div>
              </div>

              {/* Types */}
              <div className="flex justify-center gap-1">
                {pokemon.types.slice(0, 2).map((type) => {
                  const tColor = typeColors[type] || typeColors.Normal;
                  return (
                    <span
                      key={type}
                      className="text-[9px] md:text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase text-white"
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