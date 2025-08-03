'use client';

import { useState, useMemo, useEffect } from 'react';
import { pokemonCards } from '@/data/pokemonData';
import { PokemonCard as PokemonCardType } from '@/types/pokemon';
import PokemonCard from '@/components/PokemonCard';
import { useRouter } from 'next/navigation';
import { useSound } from '@/hooks/useSound';

export default function Home() {
  const [selectedCards, setSelectedCards] = useState<PokemonCardType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [rarityFilter, setRarityFilter] = useState('all');
  const router = useRouter();
  const { playBackgroundMusic } = useSound();

  // Removed auto-starting background music

  const filteredCards = useMemo(() => {
    return pokemonCards.filter(card => {
      const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || card.types.includes(typeFilter);
      const matchesRarity = rarityFilter === 'all' || card.rarity === rarityFilter;
      return matchesSearch && matchesType && matchesRarity;
    });
  }, [searchTerm, typeFilter, rarityFilter]);

  const handleCardSelect = (card: PokemonCardType) => {
    if (selectedCards.includes(card)) {
      setSelectedCards(selectedCards.filter(c => c.id !== card.id));
    } else if (selectedCards.length < 2) {
      setSelectedCards([...selectedCards, card]);
    }
  };

  const handleBattle = () => {
    if (selectedCards.length === 2) {
      localStorage.setItem('battleCards', JSON.stringify(selectedCards));
      router.push('/battle');
    }
  };

  const types = ['all', 'Fire', 'Water', 'Grass', 'Electric', 'Psychic', 'Ice', 'Fighting', 'Poison', 'Ground', 'Flying', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy', 'Normal'];
  const rarities = ['all', 'common', 'uncommon', 'rare', 'legendary'];

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-white drop-shadow-lg">
          Pokemon Card Battle Arena
        </h1>
        
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap gap-4 justify-center">
            <input
              type="text"
              placeholder="Search Pokemon..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {types.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
            
            <select
              value={rarityFilter}
              onChange={(e) => setRarityFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {rarities.map(rarity => (
                <option key={rarity} value={rarity}>
                  {rarity === 'all' ? 'All Rarities' : rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="text-center">
            <p className="text-lg mb-4 text-white">
              Selected: {selectedCards.length}/2 cards
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 justify-items-center">
          {filteredCards.map(card => (
            <PokemonCard
              key={card.id}
              pokemon={card}
              isSelected={selectedCards.includes(card)}
              onSelect={() => handleCardSelect(card)}
            />
          ))}
        </div>

        {filteredCards.length === 0 && (
          <div className="text-center text-white mt-8">
            <p className="text-xl">No Pokemon found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Floating Battle Button */}
      {selectedCards.length === 2 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <button
            onClick={handleBattle}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-12 rounded-full text-2xl shadow-2xl transform transition-all hover:scale-110 border-4 border-yellow-400 animate-pulse"
          >
            ⚔️ BATTLE! ⚔️
          </button>
        </div>
      )}

      {/* Selected Cards Status - Floating */}
      <div className="fixed top-6 right-6 bg-black bg-opacity-80 text-white px-4 py-2 rounded-lg shadow-lg z-40">
        <div className="text-sm font-bold">
          Selected: {selectedCards.length}/2
        </div>
        {selectedCards.map((card, index) => (
          <div key={card.id} className="text-xs">
            {index + 1}. {card.name}
          </div>
        ))}
      </div>
    </div>
  );
}
