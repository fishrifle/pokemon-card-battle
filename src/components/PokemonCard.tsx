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

export default function PokemonCard({ pokemon, isSelected = false, onSelect, isFlipped = false }: PokemonCardProps) {
  const [flipped, setFlipped] = useState(isFlipped);
  const { playCardSelect, playCardFlip } = useSound();

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-400';
      case 'uncommon': return 'border-green-400';
      case 'rare': return 'border-blue-400';
      case 'legendary': return 'border-purple-400';
      default: return 'border-gray-400';
    }
  };

  const getCardBackground = (types: string[]) => {
    const primaryType = types[0];
    const bgColors: Record<string, string> = {
      Fire: 'bg-gradient-to-br from-red-700 to-red-900',
      Water: 'bg-gradient-to-br from-blue-700 to-blue-900',
      Grass: 'bg-gradient-to-br from-green-700 to-green-900',
      Electric: 'bg-gradient-to-br from-yellow-600 to-yellow-800',
      Psychic: 'bg-gradient-to-br from-purple-700 to-purple-900',
      Ice: 'bg-gradient-to-br from-cyan-700 to-cyan-900',
      Fighting: 'bg-gradient-to-br from-orange-700 to-orange-900',
      Poison: 'bg-gradient-to-br from-violet-700 to-violet-900',
      Ground: 'bg-gradient-to-br from-amber-700 to-amber-900',
      Flying: 'bg-gradient-to-br from-sky-700 to-sky-900',
      Bug: 'bg-gradient-to-br from-lime-700 to-lime-900',
      Rock: 'bg-gradient-to-br from-stone-700 to-stone-900',
      Ghost: 'bg-gradient-to-br from-indigo-700 to-indigo-900',
      Dragon: 'bg-gradient-to-br from-red-800 to-red-950',
      Dark: 'bg-gradient-to-br from-gray-800 to-gray-950',
      Steel: 'bg-gradient-to-br from-slate-700 to-slate-900',
      Fairy: 'bg-gradient-to-br from-pink-700 to-pink-900',
      Normal: 'bg-gradient-to-br from-gray-700 to-gray-900'
    };
    return bgColors[primaryType] || 'bg-gradient-to-br from-gray-700 to-gray-900';
  };

  const getTypeBgColor = (type: string) => {
    const bgColors: Record<string, string> = {
      Fire: 'bg-red-800',
      Water: 'bg-blue-800',
      Grass: 'bg-green-800',
      Electric: 'bg-yellow-700',
      Psychic: 'bg-purple-800',
      Ice: 'bg-cyan-800',
      Fighting: 'bg-orange-800',
      Poison: 'bg-violet-800',
      Ground: 'bg-amber-800',
      Flying: 'bg-sky-800',
      Bug: 'bg-lime-800',
      Rock: 'bg-stone-800',
      Ghost: 'bg-indigo-800',
      Dragon: 'bg-red-900',
      Dark: 'bg-gray-900',
      Steel: 'bg-slate-800',
      Fairy: 'bg-pink-800',
      Normal: 'bg-gray-800'
    };
    return bgColors[type] || 'bg-gray-800';
  };

  const getSpecialMoveStyle = (moveName: string, primaryType: string) => {
    // Fall back to Pokemon type with readable colors and subtle effects
    const typeStyles: Record<string, any> = {
      Fire: { color: '#f7ab20ff', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' },
      Water: { color: '#6664e4ff', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' },
      Grass: { color: '#9acd32', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' },
      Electric: { color: '#ffd700', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' },
      Psychic: { color: '#da70d6', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' },
      Ice: { color: '#87ceeb', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' },
      Fighting: { color: '#cd853f', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' },
      Poison: { color: '#9370db', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' },
      Ground: { color: '#daa520', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' },
      Flying: { color: '#87ceeb', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' },
      Bug: { color: '#9acd32', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' },
      Rock: { color: '#a0522d', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' },
      Ghost: { color: '#9370db', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' },
      Dragon: { color: '#ff6347', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' },
      Dark: { color: '#9c0dd4ff', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' },
      Steel: { color: '#b6babeff', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' },
      Fairy: { color: '#ff69b4', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' },
      Normal: { color: '#8a543bff', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }
    };
    
    return typeStyles[primaryType] || typeStyles.Normal;
  };

  return (
    <div 
      className={`relative w-40 h-64 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
        isSelected ? 'ring-4 ring-blue-500 ring-opacity-75' : ''
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
      <div className={`w-full h-full rounded-lg border-2 ${getRarityColor(pokemon.rarity)} ${getCardBackground(pokemon.types)} shadow-lg p-3 transition-transform duration-500 ${flipped ? 'rotateY-180' : ''}`}>
        {!flipped ? (
          <div className="flex flex-col h-full">
            <div className="text-center mb-1">
              <h3 className="font-bold text-sm truncate text-white drop-shadow-lg">{pokemon.name}</h3>
              <div className="flex justify-center gap-1 flex-wrap">
                {pokemon.types.map((type, index) => (
                  <span key={index} className={`text-xs font-bold uppercase px-1 py-0.5 rounded text-white ${getTypeBgColor(type)} drop-shadow-md`}>
                    {type}
                  </span>
                ))}
              </div>
              {/* Special Move Display */}
              {(() => {
                const moveStyle = getSpecialMoveStyle(pokemon.specialMove.name, pokemon.types[0]);
                return (
                  <div 
                    className="mt-1 text-sm font-bold tracking-wide text-center bg-black bg-opacity-30 rounded px-2 py-1" 
                    style={moveStyle}
                  >
                    {pokemon.specialMove.name}
                  </div>
                );
              })()}
            </div>
            
            <div className="flex-1 flex justify-center items-center mb-1">
              <Image
                src={pokemon.image}
                alt={pokemon.name}
                width={80}
                height={80}
                className="pixelated"
              />
            </div>
            
            <div className="space-y-1">
              <div className="bg-gray-800 border border-gray-900 rounded px-1 py-0.5 text-center shadow-lg">
                <div className="text-xs font-bold text-white">HP</div>
                <div className="text-sm font-bold text-white">{pokemon.hp}</div>
              </div>
              
              <div className="text-xs flex justify-between gap-1">
                <div className="text-center bg-orange-800 rounded px-1 py-0.5 shadow-md flex-1">
                  <div className="font-bold text-white text-xs">ATK</div>
                  <div className="font-bold text-white text-xs">{pokemon.attack}</div>
                </div>
                <div className="text-center bg-blue-800 rounded px-1 py-0.5 shadow-md flex-1">
                  <div className="font-bold text-white text-xs">DEF</div>
                  <div className="font-bold text-white text-xs">{pokemon.defense}</div>
                </div>
              </div>
            </div>
            
            
          </div>
        ) : (
          <div className="flex flex-col h-full justify-center items-center space-y-4 rotateY-180">
            <h3 className="font-bold text-lg text-center text-white drop-shadow-lg">{pokemon.name}</h3>
            
            <div className="text-center space-y-3 w-full">
              <div className="bg-green-600 border border-green-800 rounded-lg px-4 py-2 shadow-lg">
                <div className="text-sm font-bold text-white">WINS</div>
                <div className="text-3xl font-bold text-white">{pokemon.wins}</div>
              </div>
              
              <div className="bg-red-600 border border-red-800 rounded-lg px-4 py-2 shadow-lg">
                <div className="text-sm font-bold text-white">LOSSES</div>
                <div className="text-3xl font-bold text-white">{pokemon.losses}</div>
              </div>
              
              <div className="bg-blue-600 border border-blue-800 rounded-lg px-4 py-1 shadow-lg">
                <div className="text-sm font-bold text-white">W/L RATIO</div>
                <div className="text-lg font-bold text-white">
                  {pokemon.losses === 0 ? (pokemon.wins === 0 ? '0.00' : '∞') : (pokemon.wins / pokemon.losses).toFixed(2)}
                </div>
              </div>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}