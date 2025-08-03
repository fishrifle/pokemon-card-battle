# Pokemon Card Battle Arena

A Next.js-powered Pokemon card battle game where you can select from 300 different Pokemon cards and battle them against each other!

## Features

- **300 Unique Pokemon Cards**: Each with unique stats, types, rarities, and special moves
- **Card Selection Interface**: Browse, search, and filter cards by type and rarity
- **Battle System**: Turn-based combat with dice rolling mechanics
- **Special Moves**: Each Pokemon has a unique special attack with different damage values
- **Win/Loss Tracking**: Cards track their battle history (flip cards to see stats)
- **Animated Battles**: Cards slide in from sides, attack animations, victory/defeat effects
- **Responsive Design**: Works on desktop and mobile devices

## Game Mechanics

1. **Card Selection**: Choose 2 Pokemon cards from the collection of 300
2. **Battle Arena**: Cards enter the arena with slide-in animations
3. **Turn-Based Combat**: Players alternate turns using their Pokemon's special moves
4. **Damage Calculation**: Based on attack stats, defense stats, and dice rolls
5. **Critical Hits**: Double 6s on dice result in 1.5x damage multiplier
6. **Victory Conditions**: First Pokemon to reach 0 HP loses

## Tech Stack

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Custom CSS Animations**: Card flips, battle animations, victory effects

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Play

1. **Select Cards**: Browse through 300 Pokemon cards and select 2 for battle
2. **Filter & Search**: Use filters to find cards by type, rarity, or name
3. **View Stats**: Double-click cards to flip and see win/loss records
4. **Battle**: Click "BATTLE!" when you have 2 cards selected
5. **Fight**: Take turns attacking in the battle arena
6. **Win**: Defeat your opponent by reducing their HP to 0

## Card Features

- **Types**: Fire, Water, Grass, Electric, Psychic, Ice, Fighting, Poison, Ground, Flying, Bug, Rock, Ghost, Dragon, Dark, Steel, Fairy
- **Rarities**: Common, Uncommon, Rare, Legendary (affects base stats)
- **Stats**: HP, Attack, Defense (influence battle outcomes)
- **Special Moves**: Unique attacks with varying damage and descriptions

## Future Enhancements

- Multiple battle arenas with different backgrounds
- Tournament mode
- Card deck building
- Multiplayer battles
- Card trading system
- Additional Pokemon generations
