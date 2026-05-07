'use client';

import { PokemonCard as PokemonCardType } from '@/types/pokemon';
import Image from 'next/image';
import { useState } from 'react';
import { useSound } from '@/hooks/useSound';
import EnergyIcon, { ENERGY_CONFIG } from './EnergyIcon';
import { EnergyType } from '@/types/pokemon';

interface PokemonCardProps {
  pokemon: PokemonCardType;
  isSelected?: boolean;
  onSelect?: () => void;
  size?: 'sm' | 'md' | 'lg';
  showEnergy?: boolean;
  clickable?: boolean;
}

// Type-based art area gradients
const TYPE_ART_BG: Record<string, string> = {
  Fire:      'from-orange-400 via-red-500 to-orange-600',
  Water:     'from-blue-300 via-blue-500 to-cyan-500',
  Grass:     'from-green-300 via-emerald-500 to-green-600',
  Electric:  'from-yellow-200 via-yellow-400 to-amber-400',
  Psychic:   'from-pink-300 via-purple-400 to-fuchsia-500',
  Fighting:  'from-orange-500 via-red-700 to-amber-700',
  Rock:      'from-stone-400 via-amber-600 to-stone-500',
  Ground:    'from-amber-300 via-yellow-600 to-orange-600',
  Flying:    'from-sky-200 via-indigo-300 to-blue-400',
  Bug:       'from-lime-300 via-green-500 to-lime-500',
  Poison:    'from-purple-400 via-violet-600 to-purple-700',
  Ghost:     'from-purple-700 via-indigo-900 to-slate-800',
  Dragon:    'from-indigo-400 via-purple-600 to-blue-700',
  Ice:       'from-cyan-100 via-sky-300 to-blue-300',
  Steel:     'from-slate-300 via-gray-500 to-zinc-400',
  Dark:      'from-gray-700 via-slate-800 to-gray-900',
  Fairy:     'from-pink-200 via-rose-300 to-pink-400',
  Normal:    'from-gray-200 via-stone-400 to-gray-400',
};

// Type header colors
const TYPE_HEADER: Record<string, { bg: string; text: string }> = {
  Fire:      { bg: '#C0392B', text: '#FFD0C0' },
  Water:     { bg: '#1A6EA8', text: '#C0E0FF' },
  Grass:     { bg: '#1E7B40', text: '#C0FFD0' },
  Electric:  { bg: '#B8860B', text: '#FFF0A0' },
  Psychic:   { bg: '#7D0F6E', text: '#FFC0F0' },
  Fighting:  { bg: '#7B2D00', text: '#FFD0A0' },
  Rock:      { bg: '#5D4037', text: '#E0D0B0' },
  Ground:    { bg: '#7A5000', text: '#FFE0A0' },
  Flying:    { bg: '#2471A3', text: '#C8DEFF' },
  Bug:       { bg: '#3A7D00', text: '#D0FFB0' },
  Poison:    { bg: '#5B2C6F', text: '#DFC0FF' },
  Ghost:     { bg: '#2C0078', text: '#C8AFFF' },
  Dragon:    { bg: '#1A237E', text: '#C0C8FF' },
  Ice:       { bg: '#0077A8', text: '#C8F0FF' },
  Steel:     { bg: '#4A5568', text: '#D8E0E8' },
  Dark:      { bg: '#1A1A2E', text: '#B0B8C8' },
  Fairy:     { bg: '#8E0040', text: '#FFB8D8' },
  Normal:    { bg: '#5D5D5D', text: '#E0E0D0' },
};

const RARITY_SYMBOLS: Record<string, string> = {
  common: '●',
  uncommon: '◆',
  rare: '★',
  legendary: '★★',
};

const STAGE_COLORS: Record<string, { bg: string; text: string }> = {
  'Basic':   { bg: '#1565C0', text: 'white' },
  'Stage 1': { bg: '#6A1B9A', text: 'white' },
  'Stage 2': { bg: '#AD1457', text: 'white' },
};

const CARD_SIZES = {
  sm: { w: 120, h: 168,  font: 'text-[9px]',  name: 'text-[10px]', hp: 'text-sm',  img: 60,  atkFont: 'text-[8px]', dmgFont: 'text-xs' },
  md: { w: 160, h: 224,  font: 'text-[9px]',  name: 'text-xs',    hp: 'text-base', img: 80,  atkFont: 'text-[9px]', dmgFont: 'text-xs' },
  lg: { w: 200, h: 280,  font: 'text-[10px]', name: 'text-sm',    hp: 'text-lg',   img: 110, atkFont: 'text-[10px]', dmgFont: 'text-sm' },
};

export default function PokemonCard({
  pokemon,
  isSelected = false,
  onSelect,
  size = 'md',
  showEnergy = false,
  clickable = true,
}: PokemonCardProps) {
  const [flipped, setFlipped] = useState(false);
  const { playCardSelect, playCardFlip } = useSound();

  const primaryType = pokemon.types[0] || 'Normal';
  const artBg = TYPE_ART_BG[primaryType] || TYPE_ART_BG.Normal;
  const header = TYPE_HEADER[primaryType] || TYPE_HEADER.Normal;
  const stageColor = STAGE_COLORS[pokemon.stage];
  const sizes = CARD_SIZES[size];

  const isLegendary = pokemon.rarity === 'legendary';
  const isRare = pokemon.rarity === 'rare' || isLegendary;

  const energyConfig = ENERGY_CONFIG[pokemon.energyType] || ENERGY_CONFIG.Colorless;

  return (
    <div
      className={`relative shrink-0 cursor-pointer select-none transition-all duration-200 ${
        isSelected ? 'scale-105 drop-shadow-[0_0_12px_rgba(250,200,0,0.9)]' : 'hover:scale-102'
      } ${!clickable ? 'cursor-default' : ''}`}
      style={{ width: sizes.w, height: sizes.h, perspective: '800px' }}
      onClick={() => {
        if (!clickable) return;
        playCardSelect();
        onSelect?.();
      }}
      onDoubleClick={() => {
        playCardFlip();
        setFlipped(f => !f);
      }}
    >
      <div
        className="w-full h-full transition-transform duration-500 relative"
        style={{
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* FRONT */}
        <div
          className="absolute inset-0 rounded-xl overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            border: `3px solid ${isLegendary ? '#FFD700' : isRare ? '#C0C0C0' : '#DEB887'}`,
            boxShadow: isLegendary
              ? '0 0 18px rgba(255,215,0,0.6), inset 0 0 6px rgba(255,215,0,0.2)'
              : isRare
              ? '0 0 10px rgba(192,192,192,0.4)'
              : '0 4px 12px rgba(0,0,0,0.4)',
          }}
        >
          {/* Holographic overlay for rare/legendary */}
          {isRare && (
            <div
              className="absolute inset-0 z-10 pointer-events-none rounded-xl overflow-hidden"
              style={{ mixBlendMode: 'overlay' }}
            >
              <div className="absolute inset-0 holo-shimmer opacity-40" />
            </div>
          )}

          {/* HEADER BAR */}
          <div
            className="flex items-center justify-between px-1.5 py-0.5 relative z-20"
            style={{ background: header.bg }}
          >
            <div className="flex items-center gap-1 min-w-0">
              {/* Stage badge */}
              <span
                className={`shrink-0 px-1 py-0.5 rounded text-[7px] font-black leading-none`}
                style={{ background: stageColor.bg, color: stageColor.text }}
              >
                {pokemon.stage}
              </span>
              {/* Name */}
              <span
                className={`font-black truncate leading-tight ${sizes.name}`}
                style={{ color: header.text }}
              >
                {pokemon.name}
              </span>
            </div>
            {/* HP + type icon */}
            <div className="flex items-center gap-0.5 shrink-0 ml-1">
              <span className={`font-black ${sizes.hp} leading-none`} style={{ color: header.text }}>
                {pokemon.hp}
              </span>
              <span className={`${sizes.font} font-bold`} style={{ color: `${header.text}99` }}>HP</span>
              <div
                className="w-4 h-4 rounded-full border border-white/30 flex items-center justify-center text-[7px] font-black text-white ml-0.5"
                style={{ background: energyConfig.bg }}
                title={pokemon.energyType}
              >
                {energyConfig.text}
              </div>
            </div>
          </div>

          {/* ART BOX */}
          <div
            className={`relative bg-gradient-to-b ${artBg} flex items-center justify-center overflow-hidden`}
            style={{ height: '42%' }}
          >
            {/* Art frame */}
            <div
              className="absolute inset-[3px] border border-black/20 rounded-sm"
              style={{ background: 'rgba(0,0,0,0.05)' }}
            />
            {/* Radial glow */}
            <div className="absolute inset-0 bg-radial-gradient opacity-30 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)' }} />
            <Image
              src={pokemon.image}
              alt={pokemon.name}
              width={sizes.img}
              height={sizes.img}
              className="pixelated relative z-10 drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]"
              unoptimized
            />
            {/* Energy attached (shown in battle) */}
            {showEnergy && pokemon.energyAttached.length > 0 && (
              <div className="absolute bottom-1 right-1 flex gap-0.5 flex-wrap justify-end">
                {pokemon.energyAttached.map((e, i) => (
                  <EnergyIcon key={i} type={e} size="xs" />
                ))}
              </div>
            )}
          </div>

          {/* CARD BODY — cream/parchment background */}
          <div
            className="flex flex-col"
            style={{
              background: 'linear-gradient(180deg, #FFF9E6 0%, #FFF3CC 100%)',
              borderTop: '2px solid #C8A800',
              flex: 1,
            }}
          >
            {/* Species/flavor strip */}
            <div
              className={`px-1.5 py-0.5 ${sizes.font} text-gray-600 italic border-b border-amber-200`}
              style={{ background: 'rgba(200,168,0,0.1)' }}
            >
              {pokemon.types.join(' / ')} Pokémon
            </div>

            {/* Attacks */}
            <div className="flex-1 px-1.5 py-0.5 space-y-1">
              {pokemon.attacks.map((atk, i) => (
                <div key={i} className="flex items-start gap-1">
                  {/* Energy cost */}
                  <div className="flex flex-wrap gap-px mt-0.5 shrink-0" style={{ maxWidth: 36 }}>
                    {atk.energyCost.map((e, j) => (
                      <EnergyIcon key={j} type={e} size="xs" />
                    ))}
                  </div>
                  {/* Attack name + effect */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`font-bold text-gray-800 ${sizes.atkFont} leading-tight truncate`}>
                        {atk.name}
                      </span>
                      {atk.damage > 0 && (
                        <span className={`font-black text-gray-900 ${sizes.dmgFont} ml-1 shrink-0`}>
                          {atk.damage}
                        </span>
                      )}
                    </div>
                    {atk.effect && size !== 'sm' && (
                      <p className={`text-gray-600 leading-tight ${sizes.font} mt-0.5 line-clamp-2`}>
                        {atk.effect}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BOTTOM STRIP */}
          <div
            className="px-1.5 py-1 flex items-center justify-between"
            style={{
              background: '#E8D88A',
              borderTop: '2px solid #C8A800',
            }}
          >
            {/* Weakness */}
            <div className="flex items-center gap-0.5">
              <span className={`${sizes.font} text-gray-700 font-semibold`}>Weak:</span>
              {pokemon.weakness ? (
                <>
                  <EnergyIcon type={pokemon.weakness.type as EnergyType} size="xs" />
                  <span className={`${sizes.font} text-gray-800 font-bold`}>×{pokemon.weakness.multiplier}</span>
                </>
              ) : <span className={`${sizes.font} text-gray-500`}>—</span>}
            </div>

            {/* Resistance */}
            <div className="flex items-center gap-0.5">
              <span className={`${sizes.font} text-gray-700 font-semibold`}>Res:</span>
              {pokemon.resistance ? (
                <>
                  <EnergyIcon type={pokemon.resistance.type as EnergyType} size="xs" />
                  <span className={`${sizes.font} text-gray-800 font-bold`}>-{pokemon.resistance.reduction}</span>
                </>
              ) : <span className={`${sizes.font} text-gray-500`}>—</span>}
            </div>

            {/* Retreat cost */}
            <div className="flex items-center gap-0.5">
              <span className={`${sizes.font} text-gray-700 font-semibold`}>Ret:</span>
              {pokemon.retreatCost === 0 ? (
                <span className={`${sizes.font} text-green-700 font-bold`}>Free</span>
              ) : (
                <div className="flex gap-px">
                  {Array.from({ length: pokemon.retreatCost }).map((_, i) => (
                    <EnergyIcon key={i} type="Colorless" size="xs" />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* FOOTER */}
          <div
            className="flex items-center justify-between px-1.5 py-0.5"
            style={{ background: header.bg }}
          >
            <span className={`${sizes.font} font-semibold`} style={{ color: `${header.text}aa` }}>
              {RARITY_SYMBOLS[pokemon.rarity]}
            </span>
            <span className={`${sizes.font}`} style={{ color: `${header.text}88` }}>
              {pokemon.setNumber}
            </span>
          </div>
        </div>

        {/* BACK — card record */}
        <div
          className="absolute inset-0 rounded-xl overflow-hidden flex flex-col items-center justify-center gap-2 p-3"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            border: `3px solid ${isLegendary ? '#FFD700' : '#DEB887'}`,
          }}
        >
          <div className="text-center">
            <div className={`font-black text-white ${sizes.name} drop-shadow-lg mb-2`}>{pokemon.name}</div>
            <div className="space-y-2">
              <div className="bg-green-600/90 rounded-lg px-3 py-1.5">
                <div className={`${sizes.font} font-bold text-green-200`}>WINS</div>
                <div className="text-2xl font-black text-white">{pokemon.wins}</div>
              </div>
              <div className="bg-red-600/90 rounded-lg px-3 py-1.5">
                <div className={`${sizes.font} font-bold text-red-200`}>LOSSES</div>
                <div className="text-2xl font-black text-white">{pokemon.losses}</div>
              </div>
              <div className="bg-blue-600/90 rounded-lg px-3 py-1">
                <div className={`${sizes.font} font-bold text-blue-200`}>RATIO</div>
                <div className="text-lg font-black text-white">
                  {pokemon.losses === 0
                    ? pokemon.wins === 0 ? '—' : '∞'
                    : (pokemon.wins / pokemon.losses).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected glow ring */}
      {isSelected && (
        <div className="absolute inset-0 rounded-xl pointer-events-none" style={{ boxShadow: '0 0 0 3px #FFD700, 0 0 20px rgba(255,215,0,0.5)' }} />
      )}

      <style jsx>{`
        .holo-shimmer {
          background: linear-gradient(
            105deg,
            transparent 20%,
            rgba(255,255,255,0.4) 30%,
            rgba(255,200,100,0.3) 40%,
            rgba(100,200,255,0.3) 50%,
            rgba(200,100,255,0.3) 60%,
            rgba(255,255,255,0.4) 70%,
            transparent 80%
          );
          background-size: 200% 200%;
          animation: holoMove 4s linear infinite;
        }
        @keyframes holoMove {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        .pixelated {
          image-rendering: pixelated;
          image-rendering: crisp-edges;
        }
      `}</style>
    </div>
  );
}
