import { PokemonCard } from '@/types/pokemon';
import { gen1Pokemon } from './gen1PokemonDatabase';
import { gen2Pokemon } from './gen2PokemonDatabase';
import { generateTCGCard } from './tcgUtils';

function loadPokemonStats(): Record<number, { wins: number; losses: number }> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem('pokemonStats');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function generatePokemonCards(): PokemonCard[] {
  const cards: PokemonCard[] = [];
  const stats = loadPokemonStats();
  let internalId = 1;

  gen1Pokemon.forEach((pokemon) => {
    const s = stats[internalId] || { wins: 0, losses: 0 };
    const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;
    cards.push(generateTCGCard(pokemon, internalId, s.wins, s.losses, imageUrl));
    internalId++;
  });

  gen2Pokemon.forEach((pokemon) => {
    const s = stats[internalId] || { wins: 0, losses: 0 };
    const pokeApiId = pokemon.id <= 151 ? pokemon.id : pokemon.id + 100;
    const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokeApiId}.png`;
    cards.push(generateTCGCard(pokemon, internalId, s.wins, s.losses, imageUrl));
    internalId++;
  });

  return cards;
}

export const getPokemonCards = () => generatePokemonCards();
export const pokemonCards = generatePokemonCards();
