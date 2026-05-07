export type EnergyType =
  | 'Fire' | 'Water' | 'Grass' | 'Lightning' | 'Psychic'
  | 'Fighting' | 'Darkness' | 'Metal' | 'Fairy' | 'Dragon' | 'Colorless';

export type StatusCondition = 'poison' | 'burn' | 'paralyze' | 'sleep' | 'confuse';

export interface TCGAttack {
  name: string;
  energyCost: EnergyType[];
  damage: number;
  effect?: string;
  statusEffect?: StatusCondition;
  coinFlip?: boolean;
  selfDamage?: number;
}

export interface TCGAbility {
  name: string;
  description: string;
}

export interface PokemonCard {
  id: number;
  name: string;
  stage: 'Basic' | 'Stage 1' | 'Stage 2';
  types: string[];
  energyType: EnergyType;
  hp: number;
  maxHp: number;
  attacks: TCGAttack[];
  ability?: TCGAbility;
  weakness: { type: string; multiplier: number } | null;
  resistance: { type: string; reduction: number } | null;
  retreatCost: number;
  energyAttached: EnergyType[];
  statusCondition: StatusCondition | null;
  image: string;
  wins: number;
  losses: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  setNumber: string;
}
