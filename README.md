# 🎮 Pokemon Card Battle Arena

A modern, interactive Pokemon card battle game built with Next.js, featuring 300 unique Pokemon cards, strategic combat, and stunning visual effects.

![Pokemon Battle Arena](https://img.shields.io/badge/Pokemon-Battle%20Arena-blue?style=for-the-badge&logo=pokemon)
![Next.js](https://img.shields.io/badge/Next.js-15.4.5-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/pokemon-card-battle.git

# Navigate to project directory
cd pokemon-card-battle

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` to start playing!

## 🎯 How to Play

### 📱 **First Launch**
- A tutorial popup will guide you through the basics
- Click "Let's Battle!" to start

### 🃏 **Card Selection**
1. **Browse Cards**: Scroll through 300 unique Pokemon
2. **Search & Filter**: Use the search bar and type/rarity filters
3. **Select Cards**: Click on 2 Pokemon cards to select them for battle
4. **View Stats**: **Double-click any card to flip it** and see:
   - Win/Loss record
   - Win/Loss ratio
   - Battle history

### ⚔️ **Battle System**
1. **Start Battle**: Click the floating "⚔️ BATTLE! ⚔️" button
2. **Take Turns**: Players alternate attacking
3. **Attack Mechanics**:
   - Each attack uses dual dice (attack + defense)
   - Pokemon stats influence dice effectiveness
   - Special moves deal unique damage
   - Type effectiveness matters (Fire vs Grass, Water vs Fire, etc.)
4. **Critical Hits**: 
   - Rolling 6 on attack dice OR rolling 1 on defense dice
   - 25% damage bonus + screen shake effect
5. **Victory**: First Pokemon to reach 0 HP loses

### 🏆 **Progress Tracking**
- **Automatic Saving**: All battle results are saved locally
- **Statistics**: Double-click cards to view win/loss records
- **Persistent Data**: Stats carry over between sessions

## 🎨 Features

### 🎮 **Core Gameplay**
- **300 Unique Pokemon**: Generation 1 & 2 with accurate stats
- **Strategic Combat**: Dual dice system with type effectiveness
- **Real Pokemon Data**: Authentic types, stats, and signature moves
- **Balanced Battles**: 2-5 turn fights for fast-paced action

### 🎬 **Visual Effects**
- **3D CSS Animations**: Cards attack with depth and perspective
- **Particle Systems**: Type-specific effects (fire, water, electric, etc.)
- **Dynamic Lighting**: Arena spotlights and battle intensity effects
- **Screen Shake**: Impact feedback on critical hits
- **Victory Animations**: Celebratory effects for winners

### 🔊 **Audio Experience**
- **Type-Specific Sounds**: Each Pokemon type has unique attack sounds
- **Critical Hit Effects**: Special audio for powerful attacks
- **Victory/Defeat Music**: Triumphant and somber melodies
- **Card Interaction**: Satisfying click and flip sounds

### 🎯 **User Experience**
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Auto-Scrolling Battle Log**: Never miss the action
- **Floating UI Elements**: Battle button and selection status
- **Tutorial System**: Built-in help for new players

## 🛠️ Technical Features

### 🏗️ **Architecture**
- **Next.js 15**: Latest React framework with App Router
- **TypeScript**: Full type safety and IntelliSense
- **TailwindCSS**: Utility-first styling with custom animations
- **Component-Based**: Modular, reusable React components

### 💾 **Data Management**
- **Local Storage**: Persistent battle statistics
- **Dynamic Loading**: Fresh data on each session
- **Type Safety**: Pokemon interfaces and battle logic types

### 🎵 **Audio System**
- **Web Audio API**: Real-time sound synthesis
- **Dynamic Generation**: Procedural sound effects
- **Performance Optimized**: Minimal audio footprint

## 🎲 Battle Mechanics Deep Dive

### ⚔️ **Damage Calculation**
```
Base Damage = Special Move Damage × 0.2
Attack Roll = (Pokemon Attack ÷ 20) + Attack Dice (1-6)
Defense Roll = (Pokemon Defense ÷ 8) + Defense Dice (1-6)
Total Damage = Base + Attack - Defense
Final Damage = Total × Type Effectiveness × Critical Multiplier
Damage Range = 20-40% of defender's max HP
```

### 🔥 **Type Effectiveness**
- **Super Effective (1.25×)**: Fire vs Grass, Water vs Fire, Electric vs Water, etc.
- **Not Very Effective (0.8×)**: Reverse matchups
- **Normal (1.0×)**: All other combinations

### ⭐ **Critical Hits**
- **Trigger Conditions**: Attack dice = 6 OR Defense dice = 1
- **Damage Bonus**: 25% additional damage
- **Visual Effects**: Screen shake + special sound
- **Strategic Impact**: Can turn the tide of battle

## 🔧 Development

### 🚀 **Available Scripts**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### 🎨 **Customization**
- **Add Pokemon**: Extend `gen1Pokemon.ts` or `gen2Pokemon.ts`
- **New Animations**: Add keyframes to `globals.css`
- **Sound Effects**: Modify `useSound.ts` hook
- **Battle Logic**: Update damage calculations in `battle/page.tsx`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- **Pokemon Company**: For the amazing Pokemon universe
- **PokeAPI**: For Pokemon sprite images
- **Next.js Team**: For the incredible React framework
- **Tailwind Labs**: For the utility-first CSS framework

---

**Ready to become a Pokemon Master?** 🏆

Start your journey now and build the ultimate Pokemon team!
