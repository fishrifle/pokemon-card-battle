import { PokemonCard } from '@/types/pokemon';
import { gen1Pokemon } from './gen1PokemonDatabase';
import { gen2Pokemon } from './gen2PokemonDatabase';

function loadPokemonStats(): Record<number, {wins: number, losses: number}> {
  if (typeof window === 'undefined') return {};
  
  const existingStats = localStorage.getItem('pokemonStats');
  if (existingStats) {
    try {
      return JSON.parse(existingStats);
    } catch (e) {
      console.error('Error parsing pokemon stats:', e);
    }
  }
  return {};
}

function generatePokemonCards(): PokemonCard[] {
  const cards: PokemonCard[] = [];
  let currentId = 1;
  const pokemonStats = loadPokemonStats();

  // Add all 150 Gen 1 Pokemon
  gen1Pokemon.forEach((pokemon) => {
    const rarity = getRarityByStats(pokemon.hp, pokemon.attack, pokemon.defense);
    const stats = pokemonStats[currentId] || { wins: 0, losses: 0 };
    
    cards.push({
      id: currentId++,
      name: pokemon.name,
      types: pokemon.types,
      hp: pokemon.hp,
      maxHp: pokemon.hp,
      attack: pokemon.attack,
      defense: pokemon.defense,
      specialMove: pokemon.signatureMove,
      image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`,
      wins: stats.wins,
      losses: stats.losses,
      rarity
    });
  });

  // Add real Gen 2 Pokemon + missing Mew (150 more real Pokemon)
  gen2Pokemon.forEach((pokemon) => {
    const rarity = getRarityByStats(pokemon.hp, pokemon.attack, pokemon.defense);
    const stats = pokemonStats[currentId] || { wins: 0, losses: 0 };
    
    cards.push({
      id: currentId++,
      name: pokemon.name,
      types: pokemon.types,
      hp: pokemon.hp,
      maxHp: pokemon.hp,
      attack: pokemon.attack,
      defense: pokemon.defense,
      specialMove: pokemon.signatureMove,
      image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id <= 151 ? pokemon.id : pokemon.id + 100}.png`,
      wins: stats.wins,
      losses: stats.losses,
      rarity
    });
  });

  return cards;
}

function getRarityByStats(hp: number, attack: number, defense: number): 'common' | 'uncommon' | 'rare' | 'legendary' {
  const totalStats = hp + attack + defense;
  
  if (totalStats >= 300) return 'legendary';
  if (totalStats >= 200) return 'rare';
  if (totalStats >= 120) return 'uncommon';
  return 'common';
}

// Export function instead of static data to allow dynamic updates
export const getPokemonCards = () => generatePokemonCards();
export const pokemonCards = generatePokemonCards();