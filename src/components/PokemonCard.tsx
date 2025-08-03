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
      Fire: 'bg-gradient-to-br from-red-400 to-red-600',
      Water: 'bg-gradient-to-br from-blue-400 to-blue-600',
      Grass: 'bg-gradient-to-br from-green-400 to-green-600',
      Electric: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
      Psychic: 'bg-gradient-to-br from-purple-400 to-purple-600',
      Ice: 'bg-gradient-to-br from-cyan-400 to-cyan-600',
      Fighting: 'bg-gradient-to-br from-orange-400 to-orange-600',
      Poison: 'bg-gradient-to-br from-violet-400 to-violet-600',
      Ground: 'bg-gradient-to-br from-amber-500 to-amber-700',
      Flying: 'bg-gradient-to-br from-sky-400 to-sky-600',
      Bug: 'bg-gradient-to-br from-lime-400 to-lime-600',
      Rock: 'bg-gradient-to-br from-stone-400 to-stone-600',
      Ghost: 'bg-gradient-to-br from-indigo-400 to-indigo-600',
      Dragon: 'bg-gradient-to-br from-red-500 to-red-700',
      Dark: 'bg-gradient-to-br from-gray-600 to-gray-800',
      Steel: 'bg-gradient-to-br from-slate-400 to-slate-600',
      Fairy: 'bg-gradient-to-br from-pink-400 to-pink-600',
      Normal: 'bg-gradient-to-br from-gray-400 to-gray-600'
    };
    return bgColors[primaryType] || 'bg-gradient-to-br from-gray-400 to-gray-600';
  };

  const getTypeBgColor = (type: string) => {
    const bgColors: Record<string, string> = {
      Fire: 'bg-red-600',
      Water: 'bg-blue-600',
      Grass: 'bg-green-600',
      Electric: 'bg-yellow-600',
      Psychic: 'bg-purple-600',
      Ice: 'bg-cyan-600',
      Fighting: 'bg-orange-600',
      Poison: 'bg-violet-600',
      Ground: 'bg-amber-500',
      Flying: 'bg-sky-400',
      Bug: 'bg-lime-400',
      Rock: 'bg-stone-400',
      Ghost: 'bg-indigo-400',
      Dragon: 'bg-red-500',
      Dark: 'bg-gray-600',
      Steel: 'bg-slate-400',
      Fairy: 'bg-pink-400',
      Normal: 'bg-gray-400'
    };
    return bgColors[type] || 'bg-gray-400';
  };

  return (
    <div 
      className={`relative w-48 h-80 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
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
      <div className={`w-full h-full rounded-lg border-2 ${getRarityColor(pokemon.rarity)} ${getCardBackground(pokemon.types)} shadow-lg p-4 transition-transform duration-500 ${flipped ? 'rotateY-180' : ''}`}>
        {!flipped ? (
          <div className="flex flex-col h-full">
            <div className="text-center mb-2">
              <h3 className="font-bold text-lg truncate text-white drop-shadow-lg">{pokemon.name}</h3>
              <div className="flex justify-center gap-1 flex-wrap">
                {pokemon.types.map((type, index) => (
                  <span key={index} className={`text-xs font-bold uppercase px-2 py-1 rounded text-white ${getTypeBgColor(type)} drop-shadow-md`}>
                    {type}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex-1 flex justify-center items-center mb-2">
              <Image
                src={pokemon.image}
                alt={pokemon.name}
                width={80}
                height={80}
                className="pixelated"
              />
            </div>
            
            <div className="space-y-2">
              <div className="bg-gray-600 border border-gray-800 rounded px-2 py-1 text-center shadow-lg">
                <div className="text-xs font-bold text-white">HIT POINTS</div>
                <div className="text-lg font-bold text-white">{pokemon.hp}</div>
              </div>
              
              <div className="text-xs flex justify-between">
                <div className="text-center bg-orange-600 rounded px-2 py-1 shadow-md">
                  <div className="font-bold text-white">ATK</div>
                  <div className="font-bold text-white">{pokemon.attack}</div>
                </div>
                <div className="text-center bg-blue-600 rounded px-2 py-1 shadow-md">
                  <div className="font-bold text-white">DEF</div>
                  <div className="font-bold text-white">{pokemon.defense}</div>
                </div>
              </div>
            </div>
            
            <div className="mt-2 bg-purple-600 border border-purple-800 rounded px-2 py-1 shadow-lg">
              <div className="text-xs font-bold text-white text-center">SPECIAL MOVE</div>
              <div className="font-bold text-center text-sm text-white">{pokemon.specialMove.name}</div>
              <div className="text-center text-yellow-300 font-bold">⚡ {pokemon.specialMove.damage} DMG</div>
            </div>
            
            <div className="mt-2 text-center">
              <div className="text-xs text-white bg-black bg-opacity-60 rounded px-2 py-1 font-medium">
                Double-click to flip
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
            
            <div className="text-xs text-center bg-black bg-opacity-60 rounded px-2 py-1 text-white font-medium">
              Double-click to flip back
            </div>
          </div>
        )}
      </div>
    </div>
  );
}