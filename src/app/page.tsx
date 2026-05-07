'use client';

import { useState, useMemo, useEffect } from 'react';
import { getPokemonCards } from '@/data/pokemonData';
import { PokemonCard as PokemonCardType } from '@/types/pokemon';
import PokemonCard from '@/components/PokemonCard';
import { useRouter } from 'next/navigation';
import { useSound } from '@/hooks/useSound';

export type ArenaId = 'pallet' | 'volcano' | 'cave' | 'seafoam';

export interface Arena {
  id: ArenaId;
  name: string;
  description: string;
  effect: string;
  bg: string;
  accent: string;
  emoji: string;
  modifier?: { type: string; bonus: number; penalty?: { type: string; amount: number } };
}

export const ARENAS: Arena[] = [
  {
    id: 'pallet',
    name: 'Pallet Town Gym',
    description: 'The classic hometown arena. All types fight equally.',
    effect: 'No modifiers',
    bg: 'from-green-900 via-emerald-900 to-teal-950',
    accent: '#4ade80',
    emoji: '🏠',
  },
  {
    id: 'volcano',
    name: 'Cinnabar Volcano',
    description: 'Lava erupts beneath your feet. Fire burns hotter here.',
    effect: 'Fire attacks +20% | Water attacks -20%',
    bg: 'from-red-950 via-orange-950 to-yellow-950',
    accent: '#f97316',
    emoji: '🌋',
    modifier: { type: 'Fire', bonus: 1.2, penalty: { type: 'Water', amount: 0.8 } },
  },
  {
    id: 'cave',
    name: 'Cerulean Cave',
    description: 'Dark energy pulses from the walls. Psychic forces thrive.',
    effect: 'Psychic attacks +20% | Fighting attacks -20%',
    bg: 'from-purple-950 via-indigo-950 to-slate-950',
    accent: '#a855f7',
    emoji: '🔮',
    modifier: { type: 'Psychic', bonus: 1.2, penalty: { type: 'Fighting', amount: 0.8 } },
  },
  {
    id: 'seafoam',
    name: 'Seafoam Islands',
    description: 'Frozen tides crash against the ice caves. Water rules here.',
    effect: 'Water & Ice attacks +20% | Fire attacks -20%',
    bg: 'from-cyan-950 via-blue-950 to-sky-950',
    accent: '#22d3ee',
    emoji: '🧊',
    modifier: { type: 'Water', bonus: 1.2, penalty: { type: 'Fire', amount: 0.8 } },
  },
];

const TYPES = ['all', 'Fire', 'Water', 'Grass', 'Electric', 'Psychic', 'Ice', 'Fighting',
  'Poison', 'Ground', 'Flying', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy', 'Normal'];
const RARITIES = ['all', 'common', 'uncommon', 'rare', 'legendary'];

export default function Home() {
  const [pokemonCards, setPokemonCards] = useState<PokemonCardType[]>([]);
  const [selectedCards, setSelectedCards] = useState<PokemonCardType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [rarityFilter, setRarityFilter] = useState('all');
  const [showArenaSelect, setShowArenaSelect] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const router = useRouter();
  const { playCardSelect } = useSound();

  useEffect(() => {
    setPokemonCards(getPokemonCards());
    if (!localStorage.getItem('hasSeenTutorial')) setShowTutorial(true);
  }, []);

  const filtered = useMemo(() => {
    if (!pokemonCards.length) return [];
    return pokemonCards.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || c.types.includes(typeFilter);
      const matchesRarity = rarityFilter === 'all' || c.rarity === rarityFilter;
      return matchesSearch && matchesType && matchesRarity;
    });
  }, [pokemonCards, searchTerm, typeFilter, rarityFilter]);

  const handleCardSelect = (card: PokemonCardType) => {
    if (selectedCards.find(c => c.id === card.id)) {
      setSelectedCards(selectedCards.filter(c => c.id !== card.id));
    } else if (selectedCards.length < 3) {
      playCardSelect();
      setSelectedCards([...selectedCards, card]);
    }
  };

  const handleArenaChosen = (arena: Arena) => {
    localStorage.setItem('battleCards', JSON.stringify(selectedCards));
    localStorage.setItem('selectedArena', JSON.stringify(arena));
    router.push('/battle');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950" />
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute inset-0 opacity-8"
          style={{
            backgroundImage: `linear-gradient(rgba(139,92,246,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.2) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="relative z-10 p-4 pb-24">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 drop-shadow-lg mb-1">
              Pokémon TCG Battle
            </h1>
            <p className="text-white/60 text-sm">Select your team of <span className="text-yellow-400 font-bold">3 Pokémon</span>, then choose your arena</p>
          </div>

          {/* Selected team preview */}
          {selectedCards.length > 0 && (
            <div className="mb-4 flex justify-center gap-3">
              {selectedCards.map((card, i) => (
                <div key={card.id} className="flex flex-col items-center gap-1">
                  <PokemonCard pokemon={card} isSelected size="sm" onSelect={() => handleCardSelect(card)} />
                  <span className="text-white/60 text-[10px]">Team {i + 1}</span>
                </div>
              ))}
              {Array.from({ length: 3 - selectedCards.length }).map((_, i) => (
                <div key={`empty-${i}`}
                  className="flex flex-col items-center gap-1"
                  style={{ width: 120, height: 168 }}
                >
                  <div className="w-full h-full rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center">
                    <span className="text-white/30 text-2xl">+</span>
                  </div>
                  <span className="text-white/30 text-[10px]">Empty</span>
                </div>
              ))}
            </div>
          )}

          {/* Filters */}
          <div className="mb-4 flex flex-wrap gap-2 justify-center">
            <input
              type="text"
              placeholder="Search Pokémon..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
            />
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none"
            >
              {TYPES.map(t => (
                <option key={t} value={t} className="bg-gray-800">{t === 'all' ? 'All Types' : t}</option>
              ))}
            </select>
            <select
              value={rarityFilter}
              onChange={e => setRarityFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none"
            >
              {RARITIES.map(r => (
                <option key={r} value={r} className="bg-gray-800">{r === 'all' ? 'All Rarities' : r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </select>
            <button
              onClick={() => setShowTutorial(true)}
              className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white/70 text-sm hover:bg-white/20"
            >
              ? How to Play
            </button>
          </div>

          {/* Card grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-3 justify-items-center">
            {filtered.map(card => (
              <PokemonCard
                key={card.id}
                pokemon={card}
                isSelected={!!selectedCards.find(c => c.id === card.id)}
                onSelect={() => handleCardSelect(card)}
                size="md"
              />
            ))}
          </div>

          {filtered.length === 0 && pokemonCards.length > 0 && (
            <div className="text-center text-white/50 mt-12 text-lg">No Pokémon found matching your filters.</div>
          )}
        </div>
      </div>

      {/* Battle button */}
      {selectedCards.length === 3 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={() => setShowArenaSelect(true)}
            className="px-10 py-4 rounded-full font-black text-xl text-white shadow-2xl border-4 border-yellow-400 animate-pulse"
            style={{
              background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
              boxShadow: '0 0 30px rgba(220,38,38,0.6), 0 4px 20px rgba(0,0,0,0.5)',
            }}
          >
            ⚔️ CHOOSE ARENA
          </button>
        </div>
      )}

      {/* Arena selection modal */}
      {showArenaSelect && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setShowArenaSelect(false)}>
          <div
            className="w-full max-w-2xl bg-gray-900 rounded-2xl p-6 border-2 border-yellow-400/50 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-2xl font-black text-center text-yellow-400 mb-2">Choose Your Arena</h2>
            <p className="text-white/50 text-center text-sm mb-5">The arena affects which types gain power</p>
            <div className="grid grid-cols-2 gap-4">
              {ARENAS.map(arena => (
                <button
                  key={arena.id}
                  onClick={() => handleArenaChosen(arena)}
                  className={`relative rounded-xl p-4 text-left overflow-hidden transition-all hover:scale-105 border-2 bg-gradient-to-br ${arena.bg}`}
                  style={{ borderColor: arena.accent }}
                >
                  <div className="text-3xl mb-2">{arena.emoji}</div>
                  <div className="font-black text-white text-base">{arena.name}</div>
                  <div className="text-white/60 text-xs mt-1">{arena.description}</div>
                  <div
                    className="mt-2 text-xs font-bold px-2 py-0.5 rounded-full inline-block"
                    style={{ background: `${arena.accent}33`, color: arena.accent }}
                  >
                    {arena.effect}
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => setShowArenaSelect(false)} className="mt-4 w-full py-2 rounded-lg bg-white/10 text-white/60 text-sm hover:bg-white/20">
              ← Back to selection
            </button>
          </div>
        </div>
      )}

      {/* Tutorial */}
      {showTutorial && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-yellow-400/50 shadow-2xl">
            <h2 className="text-xl font-black text-yellow-400 text-center mb-4">🎮 How to Play</h2>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="border-l-4 border-yellow-500 pl-3">
                <div className="font-bold text-white">1. Pick Your Team</div>
                <p>Select 3 Pokémon. One fights at a time; the other two wait on your bench.</p>
              </div>
              <div className="border-l-4 border-orange-500 pl-3">
                <div className="font-bold text-white">2. Choose an Arena</div>
                <p>Each arena boosts certain types. Pick one that favors your team.</p>
              </div>
              <div className="border-l-4 border-red-500 pl-3">
                <div className="font-bold text-white">3. Battle the AI</div>
                <p>Each turn: attach 1 energy → choose an attack (if you have enough energy) → end turn.</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-3">
                <div className="font-bold text-white">4. Win by Prize Cards</div>
                <p>Each KO earns you a prize card. Collect all 3 to win. Knock Out 3 enemy Pokémon!</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-3">
                <div className="font-bold text-white">5. Retreat</div>
                <p>Spend energy (equal to retreat cost) to swap your active Pokémon with a benched one.</p>
              </div>
              <div className="border-l-4 border-green-500 pl-3">
                <div className="font-bold text-white">Weakness & Resistance</div>
                <p>Super-effective = ×2 damage! Resistance reduces damage by 30.</p>
              </div>
            </div>
            <button
              onClick={() => { setShowTutorial(false); localStorage.setItem('hasSeenTutorial', 'true'); }}
              className="mt-5 w-full py-2 rounded-lg font-bold text-white bg-yellow-500 hover:bg-yellow-400"
            >
              Let's Battle! ⚔️
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
