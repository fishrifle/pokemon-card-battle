export interface PokemonMove {
  name: string;
  damage: number;
  description: string;
}

export interface PokemonCard {
  id: number;
  name: string;
  types: string[]; // Updated to support dual types like Fire/Flying
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  specialMove: PokemonMove;
  image: string;
  wins: number;
  losses: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
}

export interface BattleState {
  player1Card: PokemonCard | null;
  player2Card: PokemonCard | null;
  currentTurn: 'player1' | 'player2';
  battlePhase: 'selecting' | 'battle' | 'finished';
  winner: 'player1' | 'player2' | null;
}