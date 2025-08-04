'use client';

import { useState, useMemo, useEffect } from 'react';
import { getPokemonCards } from '@/data/pokemonData';
import { PokemonCard as PokemonCardType } from '@/types/pokemon';
import PokemonCard from '@/components/PokemonCard';
import { useRouter } from 'next/navigation';
import { useSound } from '@/hooks/useSound';

export default function Home() {
  const [selectedCards, setSelectedCards] = useState<PokemonCardType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [rarityFilter, setRarityFilter] = useState('all');
  const [pokemonCards, setPokemonCards] = useState<PokemonCardType[]>([]);
  const [showTutorial, setShowTutorial] = useState(false);
  const router = useRouter();
  const { playBackgroundMusic } = useSound();

  useEffect(() => {
    // Load fresh pokemon data on component mount
    const cards = getPokemonCards();
    console.log('Loaded Pokemon cards:', cards.length);
    setPokemonCards(cards);
    
    // Show tutorial for first-time users
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);

  const closeTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('hasSeenTutorial', 'true');
  };

  const filteredCards = useMemo(() => {
    if (!pokemonCards.length) return [];
    return pokemonCards.filter(card => {
      const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || card.types.includes(typeFilter);
      const matchesRarity = rarityFilter === 'all' || card.rarity === rarityFilter;
      return matchesSearch && matchesType && matchesRarity;
    });
  }, [pokemonCards, searchTerm, typeFilter, rarityFilter]);

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
    <div className="min-h-screen bg-gray-800 p-4">
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
          
        </div>

        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 justify-items-center">
          {filteredCards.map(card => (
            <PokemonCard
              key={card.id}
              pokemon={card}
              isSelected={selectedCards.includes(card)}
              onSelect={() => handleCardSelect(card)}
            />
          ))}
        </div>

        {pokemonCards.length === 0 ? (
          <div className="text-center text-white mt-8">
            <p className="text-xl">Loading Pokemon...</p>
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="text-center text-white mt-8">
            <p className="text-xl">No Pokemon found matching your criteria.</p>
          </div>
        ) : null}
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

      {/* Tutorial Popup */}
      {showTutorial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg mx-auto shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">
              🎮 Pokemon Battle Guide
            </h2>
            
            <div className="space-y-3 text-gray-700 text-sm">
              <div className="border-l-4 border-blue-500 pl-3">
                <h3 className="font-bold">🃏 Card Selection</h3>
                <p>• Click cards to select (choose 2)</p>
                <p>• <strong>Double-click to flip and see wins/losses!</strong></p>
              </div>
              
              <div className="border-l-4 border-red-500 pl-3">
                <h3 className="font-bold">⚔️ Battle</h3>
                <p>• Click floating "BATTLE!" button</p>
                <p>• Take turns attacking with dice + stats</p>
              </div>
              
              <div className="border-l-4 border-green-500 pl-3">
                <h3 className="font-bold">🏆 Progress</h3>
                <p>• Battle results auto-save</p>
                <p>• Build your ultimate team!</p>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <button
                onClick={closeTutorial}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition-all hover:scale-105"
              >
                Let's Battle! 🚀
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
