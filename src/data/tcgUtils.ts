import { EnergyType, TCGAttack, StatusCondition, PokemonCard } from '@/types/pokemon';

export const GAME_TYPE_TO_ENERGY: Record<string, EnergyType> = {
  Fire: 'Fire', Water: 'Water', Grass: 'Grass',
  Electric: 'Lightning', Psychic: 'Psychic', Fighting: 'Fighting',
  Rock: 'Fighting', Ground: 'Fighting', Bug: 'Grass',
  Normal: 'Colorless', Flying: 'Colorless', Poison: 'Psychic',
  Ghost: 'Darkness', Dragon: 'Dragon', Ice: 'Water',
  Steel: 'Metal', Dark: 'Darkness', Fairy: 'Fairy',
};

export const TYPE_WEAKNESS: Record<string, string> = {
  Fire: 'Water', Water: 'Lightning', Grass: 'Fire',
  Electric: 'Fighting', Psychic: 'Darkness', Fighting: 'Psychic',
  Normal: 'Fighting', Flying: 'Lightning', Poison: 'Psychic',
  Bug: 'Fire', Rock: 'Grass', Ground: 'Grass',
  Ghost: 'Darkness', Dragon: 'Dragon', Ice: 'Metal',
  Steel: 'Fire', Dark: 'Fighting', Fairy: 'Metal',
};

export const TYPE_RESISTANCE: Record<string, { type: string; reduction: number } | null> = {
  Flying: { type: 'Fighting', reduction: 30 },
  Metal: { type: 'Grass', reduction: 30 },
  Dark: { type: 'Psychic', reduction: 30 },
};

const BASIC_ATTACK_NAMES: Record<string, string> = {
  Fire: 'Flare', Water: 'Water Shot', Grass: 'Vine Slap',
  Lightning: 'Zap', Psychic: 'Psywave', Fighting: 'Jab',
  Colorless: 'Tackle', Dragon: 'Dragon Breath', Metal: 'Iron Tail',
  Darkness: 'Feint Attack', Fairy: 'Fairy Wind',
};

// Stage map keyed by PokeAPI ID
export const POKEMON_STAGES: Record<number, 'Basic' | 'Stage 1' | 'Stage 2'> = {
  // Gen 1
  1: 'Basic', 2: 'Stage 1', 3: 'Stage 2',
  4: 'Basic', 5: 'Stage 1', 6: 'Stage 2',
  7: 'Basic', 8: 'Stage 1', 9: 'Stage 2',
  10: 'Basic', 11: 'Stage 1', 12: 'Stage 2',
  13: 'Basic', 14: 'Stage 1', 15: 'Stage 2',
  16: 'Basic', 17: 'Stage 1', 18: 'Stage 2',
  19: 'Basic', 20: 'Stage 1',
  21: 'Basic', 22: 'Stage 1',
  23: 'Basic', 24: 'Stage 1',
  25: 'Basic', 26: 'Stage 1',
  27: 'Basic', 28: 'Stage 1',
  29: 'Basic', 30: 'Stage 1', 31: 'Stage 2',
  32: 'Basic', 33: 'Stage 1', 34: 'Stage 2',
  35: 'Basic', 36: 'Stage 1',
  37: 'Basic', 38: 'Stage 1',
  39: 'Basic', 40: 'Stage 1',
  41: 'Basic', 42: 'Stage 1',
  43: 'Basic', 44: 'Stage 1', 45: 'Stage 2',
  46: 'Basic', 47: 'Stage 1',
  48: 'Basic', 49: 'Stage 1',
  50: 'Basic', 51: 'Stage 1',
  52: 'Basic', 53: 'Stage 1',
  54: 'Basic', 55: 'Stage 1',
  56: 'Basic', 57: 'Stage 1',
  58: 'Basic', 59: 'Stage 1',
  60: 'Basic', 61: 'Stage 1', 62: 'Stage 2',
  63: 'Basic', 64: 'Stage 1', 65: 'Stage 2',
  66: 'Basic', 67: 'Stage 1', 68: 'Stage 2',
  69: 'Basic', 70: 'Stage 1', 71: 'Stage 2',
  72: 'Basic', 73: 'Stage 1',
  74: 'Basic', 75: 'Stage 1', 76: 'Stage 2',
  77: 'Basic', 78: 'Stage 1',
  79: 'Basic', 80: 'Stage 1',
  81: 'Basic', 82: 'Stage 1',
  83: 'Basic', 84: 'Basic', 85: 'Stage 1',
  86: 'Basic', 87: 'Stage 1',
  88: 'Basic', 89: 'Stage 1',
  90: 'Basic', 91: 'Stage 1',
  92: 'Basic', 93: 'Stage 1', 94: 'Stage 2',
  95: 'Basic', 96: 'Basic', 97: 'Stage 1',
  98: 'Basic', 99: 'Stage 1',
  100: 'Basic', 101: 'Stage 1',
  102: 'Basic', 103: 'Stage 1',
  104: 'Basic', 105: 'Stage 1',
  106: 'Basic', 107: 'Basic', 108: 'Basic',
  109: 'Basic', 110: 'Stage 1',
  111: 'Basic', 112: 'Stage 1',
  113: 'Basic', 114: 'Basic', 115: 'Basic',
  116: 'Basic', 117: 'Stage 1',
  118: 'Basic', 119: 'Stage 1',
  120: 'Basic', 121: 'Stage 1',
  122: 'Basic', 123: 'Basic', 124: 'Basic',
  125: 'Basic', 126: 'Basic', 127: 'Basic', 128: 'Basic',
  129: 'Basic', 130: 'Stage 1',
  131: 'Basic', 132: 'Basic',
  133: 'Basic', 134: 'Stage 1', 135: 'Stage 1', 136: 'Stage 1',
  137: 'Basic',
  138: 'Basic', 139: 'Stage 1',
  140: 'Basic', 141: 'Stage 1',
  142: 'Basic', 143: 'Basic',
  144: 'Basic', 145: 'Basic', 146: 'Basic',
  147: 'Basic', 148: 'Stage 1', 149: 'Stage 2',
  150: 'Basic', 151: 'Basic',
  // Gen 2 evolution chains
  152: 'Basic', 153: 'Stage 1', 154: 'Stage 2',
  155: 'Basic', 156: 'Stage 1', 157: 'Stage 2',
  158: 'Basic', 159: 'Stage 1', 160: 'Stage 2',
  161: 'Basic', 162: 'Stage 1',
  163: 'Basic', 164: 'Stage 1',
  165: 'Basic', 166: 'Stage 1',
  167: 'Basic', 168: 'Stage 1',
  169: 'Stage 2',
  170: 'Basic', 171: 'Stage 1',
  172: 'Basic', 173: 'Basic', 174: 'Basic',
  175: 'Basic', 176: 'Stage 1',
  177: 'Basic', 178: 'Stage 1',
  179: 'Basic', 180: 'Stage 1', 181: 'Stage 2',
  182: 'Stage 2', 183: 'Basic', 184: 'Stage 1',
  185: 'Stage 1', 186: 'Stage 2',
  187: 'Basic', 188: 'Stage 1', 189: 'Stage 2',
  190: 'Basic', 191: 'Basic', 192: 'Stage 1',
  193: 'Basic', 194: 'Basic', 195: 'Stage 1',
  196: 'Stage 1', 197: 'Stage 1',
  198: 'Basic', 199: 'Stage 1',
  200: 'Basic', 201: 'Basic',
  202: 'Basic', 203: 'Basic',
  204: 'Basic', 205: 'Stage 1',
  206: 'Basic', 207: 'Basic',
  208: 'Stage 2', 209: 'Basic', 210: 'Stage 1',
  211: 'Basic', 212: 'Stage 1',
  213: 'Basic', 214: 'Stage 1',
  215: 'Basic', 216: 'Basic', 217: 'Stage 1',
  218: 'Basic', 219: 'Stage 1',
  220: 'Basic', 221: 'Stage 1',
  222: 'Basic', 223: 'Basic', 224: 'Stage 1',
  225: 'Basic', 226: 'Basic',
  227: 'Basic', 228: 'Basic', 229: 'Stage 1',
  230: 'Stage 2', 231: 'Basic', 232: 'Stage 1',
  233: 'Stage 2', 234: 'Basic',
  235: 'Basic', 236: 'Basic', 237: 'Stage 1',
  238: 'Basic', 239: 'Basic', 240: 'Basic',
  241: 'Basic', 242: 'Basic', 243: 'Basic',
  244: 'Basic', 245: 'Basic',
  246: 'Basic', 247: 'Stage 1', 248: 'Stage 2',
  249: 'Basic', 250: 'Basic', 251: 'Basic',
};

// Pokemon with free retreat
const FREE_RETREAT_IDS = new Set([63, 92, 50, 132, 201]);

function roundToTen(n: number): number {
  return Math.round(n / 10) * 10;
}

function deriveStatus(desc: string): StatusCondition | undefined {
  const d = desc.toLowerCase();
  if (d.includes('may poison') || d.includes('badly poisons') || d.includes('poisons target')) return 'poison';
  if (d.includes('may burn') || d.includes('burn target')) return 'burn';
  if (d.includes('may paralyze') || d.includes('may paralyse') || (d.includes('paralyze') && !d.includes('be'))) return 'paralyze';
  if ((d.includes('puts') && d.includes('sleep')) || d.includes('puts enemy to sleep') || d.includes('hypnosis')) return 'sleep';
  if (d.includes('may confuse') || (d.includes('confus') && d.includes('may'))) return 'confuse';
  return undefined;
}

export function generateTCGCard(
  pokemon: {
    id: number;
    name: string;
    types: string[];
    hp: number;
    attack: number;
    defense: number;
    signatureMove: { name: string; damage: number; description: string };
  },
  internalId: number,
  wins: number,
  losses: number,
  imageUrl: string
): PokemonCard {
  const primaryType = pokemon.types[0] || 'Normal';
  const energyType: EnergyType = GAME_TYPE_TO_ENERGY[primaryType] || 'Colorless';
  const stage = POKEMON_STAGES[pokemon.id] || 'Basic';

  const hpMultiplier = stage === 'Stage 2' ? 1.7 : stage === 'Stage 1' ? 1.6 : 1.5;
  const minHp = stage === 'Stage 2' ? 90 : stage === 'Stage 1' ? 70 : 50;
  const tcgHp = Math.max(minHp, roundToTen(pokemon.hp * hpMultiplier));

  const totalStats = pokemon.hp + pokemon.attack + pokemon.defense;
  const rarity: PokemonCard['rarity'] =
    totalStats >= 300 ? 'legendary' :
    totalStats >= 200 ? 'rare' :
    totalStats >= 120 ? 'uncommon' : 'common';

  const weaknessType = TYPE_WEAKNESS[primaryType];
  const weakness = weaknessType ? { type: weaknessType, multiplier: 2 } : null;
  const resistance = TYPE_RESISTANCE[primaryType] || null;

  const totalBulk = pokemon.hp + pokemon.defense;
  const retreatCost = FREE_RETREAT_IDS.has(pokemon.id) ? 0 :
    totalBulk < 70 ? 1 : totalBulk < 130 ? 2 : 3;

  const basicName = BASIC_ATTACK_NAMES[energyType] || 'Tackle';
  const basicDmg = roundToTen(Math.max(10, 10 + Math.floor(pokemon.attack * 0.2)));

  const moveDmg = pokemon.signatureMove.damage;
  const powerDmg = moveDmg === 0 ? 0 : Math.max(30, roundToTen(moveDmg * 2));

  let powerCost: EnergyType[];
  if (moveDmg === 0) {
    powerCost = [energyType];
  } else if (powerDmg >= 100) {
    powerCost = [energyType, energyType, 'Colorless'];
  } else if (powerDmg >= 60) {
    powerCost = [energyType, energyType];
  } else {
    powerCost = [energyType, 'Colorless'];
  }

  const statusEffect = deriveStatus(pokemon.signatureMove.description);

  const attacks: TCGAttack[] = [
    {
      name: basicName,
      energyCost: [energyType],
      damage: basicDmg,
    },
    {
      name: pokemon.signatureMove.name,
      energyCost: powerCost,
      damage: powerDmg,
      effect: pokemon.signatureMove.description,
      ...(statusEffect && { statusEffect }),
      ...(pokemon.signatureMove.description.toLowerCase().includes('coin') && { coinFlip: true }),
    },
  ];

  return {
    id: internalId,
    name: pokemon.name,
    stage,
    types: pokemon.types,
    energyType,
    hp: tcgHp,
    maxHp: tcgHp,
    attacks,
    weakness,
    resistance,
    retreatCost,
    energyAttached: [],
    statusCondition: null,
    image: imageUrl,
    wins,
    losses,
    rarity,
    setNumber: `${String(internalId).padStart(3, '0')}/302`,
  };
}
