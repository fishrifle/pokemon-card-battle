'use client';

import { useState, useEffect, useRef } from "react";
import { PokemonCard as PokemonCardType } from '@/types/pokemon';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSound } from '@/hooks/useSound';
import ParticleEffect from '@/components/ParticleEffect';

interface BattleLog {
  attacker: string;
  defender: string;
  move: string;
  moveType: 'attack' | 'block' | 'dodge';
  damage: number;
  critical: boolean;
  typeEffectiveness: number;
  attackDice: number;
  defenseDice: number;
  attackRoll: number;
  defenseRoll: number;
  criticalType: string;
  blocked?: boolean;
  dodged?: boolean;
}

export default function BattlePage() {
  const [battleCards, setBattleCards] = useState<PokemonCardType[]>([]);
  const [player1Card, setPlayer1Card] = useState<PokemonCardType | null>(null);
  const [player2Card, setPlayer2Card] = useState<PokemonCardType | null>(null);
  const [currentTurn, setCurrentTurn] = useState<'player1' | 'player2'>('player1');
  const [battlePhase, setBattlePhase] = useState<'setup' | 'fighting' | 'finished'>('setup');
  const [winner, setWinner] = useState<'player1' | 'player2' | null>(null);
  const [battleLog, setBattleLog] = useState<BattleLog[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [particleType, setParticleType] = useState<'fire' | 'water' | 'electric' | 'grass' | 'psychic' | 'impact'>('impact');
  const [showDamageText, setShowDamageText] = useState(false);
  const [damageAmount, setDamageAmount] = useState(0);
  const [comboCounter, setComboCounter] = useState(0);
  const [lastDefenseRoll, setLastDefenseRoll] = useState<number>(0);
  const [isDiceRolling, setIsDiceRolling] = useState(false);
  const [diceResult, setDiceResult] = useState<number>(12);
  const [currentDiceDisplay, setCurrentDiceDisplay] = useState<number>(12);
  const [screenShake, setScreenShake] = useState(false);
  const router = useRouter();
  const { playAttack, playCriticalHit, playVictory, playDefeat, playArenaAmbience } = useSound();
  const battleLogRef = useRef<HTMLDivElement>(null);
 
 
 
 
  useEffect(() => {
    const savedCards = localStorage.getItem('battleCards');
    if (savedCards) {
      const cards = JSON.parse(savedCards);
      setBattleCards(cards);
      setPlayer1Card({ ...cards[0] });
      setPlayer2Card({ ...cards[1] });
      
      setTimeout(() => {
        setBattlePhase('fighting');
      }, 1500);
    } else {
      router.push('/');
    }
  }, [router]);

  // Update stats when winner is determined
  useEffect(() => {
    if (winner && battlePhase === 'finished') {
      updatePokemonStats();
    }
  }, [winner, battlePhase, battleCards]);

  const rollDice = () => Math.floor(Math.random() * 6) + 1;
  const roll12SidedDice = () => Math.floor(Math.random() * 12) + 1;

  const getTypeEffectiveness = (attackerTypes: string[], defenderTypes: string[]) => {
    // Simplified type effectiveness system
    const effectiveness: Record<string, string[]> = {
      Fire: ['Grass', 'Bug', 'Steel', 'Ice'],
      Water: ['Fire', 'Ground', 'Rock'],
      Grass: ['Water', 'Ground', 'Rock'],
      Electric: ['Water', 'Flying'],
      Psychic: ['Fighting', 'Poison'],
      Ice: ['Grass', 'Ground', 'Flying', 'Dragon'],
      Fighting: ['Normal', 'Rock', 'Steel', 'Ice', 'Dark'],
      Poison: ['Grass', 'Fairy'],
      Ground: ['Fire', 'Electric', 'Poison', 'Rock', 'Steel'],
      Flying: ['Grass', 'Fighting', 'Bug'],
      Bug: ['Grass', 'Psychic', 'Dark'],
      Rock: ['Fire', 'Ice', 'Flying', 'Bug'],
      Ghost: ['Psychic', 'Ghost'],
      Dragon: ['Dragon'],
      Dark: ['Psychic', 'Ghost'],
      Steel: ['Ice', 'Rock', 'Fairy'],
      Fairy: ['Fighting', 'Dragon', 'Dark']
    };

    for (const attackType of attackerTypes) {
      for (const defenderType of defenderTypes) {
        if (effectiveness[attackType]?.includes(defenderType)) {
          return 1.25; // Super effective
        }
        if (effectiveness[defenderType]?.includes(attackType)) {
          return 0.8; // Not very effective
        }
      }
    }
    return 1.0; // Normal effectiveness
  };

  const calculateDamage = (attacker: PokemonCardType, defender: PokemonCardType, currentCombo: number = 0) => {
    // Separate dice for attack and defense
    const attackDice = rollDice();
    const defenseDice = rollDice();
    
    // Base damage from special move (reduced)
    const baseDamage = Math.floor(attacker.specialMove.damage * 0.2);
    
    // Attack calculation: base attack + dice roll (reduced scaling)
    const attackRoll = Math.floor(attacker.attack / 20) + attackDice;
    
    // Defense calculation: base defense + dice roll (increased importance)
    const defenseRoll = Math.floor(defender.defense / 8) + defenseDice;
    
    // Critical hits: double 6s on attack dice OR double 1s on defense dice
    const attackCritical = attackDice === 6;
    const defenseCritical = defenseDice === 1; // Low defense roll is bad for defender
    const isCritical = attackCritical || defenseCritical;
    
    const typeMultiplier = getTypeEffectiveness(attacker.types, defender.types);
    
    // Damage = base damage + attack roll - defense roll
    let totalDamage = baseDamage + attackRoll - defenseRoll;
    
    // Apply type effectiveness
    totalDamage = Math.floor(totalDamage * typeMultiplier);
    
    // Apply critical hit bonus (reduced)
    if (isCritical) {
      totalDamage = Math.floor(totalDamage * 1.25);
    }
    
    // Apply combo bonus
    if (currentCombo > 0) {
      const comboMultiplier = 1 + (currentCombo * 0.1); // 10% bonus per combo
      totalDamage = Math.floor(totalDamage * comboMultiplier);
    }
    
    // Ensure damage is reasonable (20-40% of defender's max HP for faster battles)
    const minDamage = Math.floor(defender.maxHp * 0.20);
    const maxDamage = Math.floor(defender.maxHp * 0.40);
    
    const finalDamage = Math.max(minDamage, Math.min(maxDamage, totalDamage));
    
    // Only consider it a critical hit if it actually does significant damage
    const actualCritical = isCritical && finalDamage > minDamage * 1.1;
    
    return {
      damage: finalDamage,
      critical: actualCritical,
      attackDice: attackDice,
      defenseDice: defenseDice,
      attackRoll: attackRoll,
      defenseRoll: defenseRoll,
      criticalType: actualCritical ? (attackCritical ? 'attack' : (defenseCritical ? 'defense' : 'none')) : 'none',
      typeEffectiveness: typeMultiplier
    };
  };

  const performAction = async () => {
    if (!player1Card || !player2Card || isAnimating || battlePhase !== 'fighting') return;

    setIsAnimating(true);
    setIsDiceRolling(true);
    
    // Determine final result immediately but don't show it yet
    const finalRoll = roll12SidedDice();
    
    // Show random numbers while rolling for 1 second
    const rollingInterval = setInterval(() => {
      setCurrentDiceDisplay(roll12SidedDice());
    }, 100); // Change number every 100ms
    
    setTimeout(() => {
      clearInterval(rollingInterval);
      setCurrentDiceDisplay(finalRoll);
      setDiceResult(finalRoll);
      setLastDefenseRoll(finalRoll);
      setIsDiceRolling(false);
      
      // Continue with battle logic after dice stops rolling
      continueBattle(finalRoll);
    }, 1000);
  };

  const continueBattle = (defenseRoll: number) => {
    const attacker = currentTurn === 'player1' ? player1Card : player2Card;
    const defender = currentTurn === 'player1' ? player2Card : player1Card;
    
    if (!attacker || !defender) return;
    
    // Determine defensive action based on dice roll
    const isBlocked = defenseRoll >= 10; // 10-12 = block (25% chance)
    const isDodged = defenseRoll >= 7 && defenseRoll <= 9; // 7-9 = dodge (25% chance)
    const isNormalHit = defenseRoll <= 6; // 1-6 = normal hit (50% chance)
    
    let attackResult = calculateDamage(attacker, defender, comboCounter);
    let finalDamage = attackResult.damage;
    let newHP = defender.hp;
    
    // Apply defensive actions
    if (isDodged) {
      finalDamage = 0; // Complete dodge
    } else if (isBlocked) {
      finalDamage = Math.floor(finalDamage * 0.3); // Block reduces damage by 70%
    }
    
    newHP = Math.max(0, defender.hp - finalDamage);
    
    const logEntry: BattleLog = {
      attacker: attacker.name,
      defender: defender.name,
      move: attacker.specialMove.name,
      moveType: 'attack',
      damage: finalDamage,
      critical: attackResult.critical && !isBlocked && !isDodged,
      typeEffectiveness: attackResult.typeEffectiveness,
      attackDice: attackResult.attackDice,
      defenseDice: attackResult.defenseDice,
      attackRoll: attackResult.attackRoll,
      defenseRoll: attackResult.defenseRoll,
      criticalType: attackResult.critical && !isBlocked && !isDodged ? attackResult.criticalType : 'none',
      blocked: isBlocked,
      dodged: isDodged
    };

    setBattleLog(prev => [...prev, logEntry]);

    // Show floating damage text
    setDamageAmount(finalDamage);
    setShowDamageText(true);
    setTimeout(() => setShowDamageText(false), 2000);

    // Track combo system (only for successful hits)
    if (attackResult.critical && !isBlocked && !isDodged) {
      setComboCounter(prev => prev + 1);
    } else {
      setComboCounter(0);
    }

    // Auto-scroll to bottom of battle log
    setTimeout(() => {
      if (battleLogRef.current) {
        battleLogRef.current.scrollTop = battleLogRef.current.scrollHeight;
      }
    }, 100);

    // Play sound effects and show particles
    const primaryType = attacker.types[0];
    
    if (!isDodged) {
      playAttack(primaryType);
      
      const typeToParticle = (type: string) => {
        const typeMap: Record<string, 'fire' | 'water' | 'electric' | 'grass' | 'psychic' | 'impact'> = {
          Fire: 'fire',
          Water: 'water',
          Electric: 'electric',
          Grass: 'grass',
          Psychic: 'psychic'
        };
        return typeMap[type] || 'impact';
      };
      
      setParticleType(typeToParticle(primaryType));
      setShowParticles(true);
    }
    
    // Screen shake on critical hits
    if (attackResult.critical && !isBlocked && !isDodged) {
      setTimeout(() => playCriticalHit(), 200);
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 500);
    }

    // Update HP
    if (currentTurn === 'player1') {
      setPlayer2Card(prev => prev ? { ...prev, hp: newHP } : null);
    } else {
      setPlayer1Card(prev => prev ? { ...prev, hp: newHP } : null);
    }

    setTimeout(() => {
      if (newHP <= 0) {
        setWinner(currentTurn);
        setBattlePhase('finished');
        
        // Play victory/defeat sounds
        setTimeout(() => {
          playVictory();
          setTimeout(() => playDefeat(), 500);
        }, 300);
      } else {
        setCurrentTurn(currentTurn === 'player1' ? 'player2' : 'player1');
      }
      setIsAnimating(false);
    }, 1500);
  };



  // Function to get themed styling for special moves
  const getSpecialMoveStyle = (moveName: string) => {
    const lowerName = moveName.toLowerCase();
    
    if (lowerName.includes('flame') || lowerName.includes('fire') || lowerName.includes('burn')) {
      return {
        color: '#ff4500',
        textShadow: '0 0 8px #ff4500, 0 0 12px #ff650080',
        animation: 'fire-flicker 2s infinite alternate'
      };
    } else if (lowerName.includes('water') || lowerName.includes('surf') || lowerName.includes('hydro')) {
      return {
        color: '#1e90ff',
        textShadow: '0 0 8px #1e90ff, 0 0 12px #00bfff80',
        animation: 'water-wave 3s infinite ease-in-out'
      };
    } else if (lowerName.includes('thunder') || lowerName.includes('electric') || lowerName.includes('shock')) {
      return {
        color: '#ffd700',
        textShadow: '0 0 8px #ffd700, 0 0 12px #ffff0080',
        animation: 'electric-pulse 1.5s infinite'
      };
    } else if (lowerName.includes('leaf') || lowerName.includes('vine') || lowerName.includes('solar')) {
      return {
        color: '#32cd32',
        textShadow: '0 0 8px #32cd32, 0 0 12px #90ee9080',
        animation: 'nature-glow 2.5s infinite ease-in-out'
      };
    } else if (lowerName.includes('psychic') || lowerName.includes('mind') || lowerName.includes('confusion')) {
      return {
        color: '#da70d6',
        textShadow: '0 0 8px #da70d6, 0 0 12px #dda0dd80',
        animation: 'psychic-swirl 3s infinite linear'
      };
    } else {
      return {
        color: '#708090',
        textShadow: '0 0 8px #708090, 0 0 12px #a9a9a980',
        animation: 'generic-glow 2s infinite alternate'
      };
    }
  };

  const updatePokemonStats = () => {
    console.log('updatePokemonStats called', { winner, battleCardsLength: battleCards.length });
    if (!winner || !battleCards.length) {
      console.log('Early return from updatePokemonStats');
      return;
    }
    
    const winnerCard = winner === 'player1' ? battleCards[0] : battleCards[1];
    const loserCard = winner === 'player1' ? battleCards[1] : battleCards[0];
    
    console.log(`Winner: ${winnerCard.name} (ID: ${winnerCard.id})`);
    console.log(`Loser: ${loserCard.name} (ID: ${loserCard.id})`);
    
    // Get existing stats from localStorage
    const existingStats = localStorage.getItem('pokemonStats');
    let allPokemonStats: Record<number, {wins: number, losses: number}> = {};
    
    if (existingStats) {
      try {
        allPokemonStats = JSON.parse(existingStats);
      } catch (e) {
        console.error('Error parsing pokemon stats:', e);
      }
    }
    
    // Update stats
    if (!allPokemonStats[winnerCard.id]) {
      allPokemonStats[winnerCard.id] = { wins: 0, losses: 0 };
    }
    if (!allPokemonStats[loserCard.id]) {
      allPokemonStats[loserCard.id] = { wins: 0, losses: 0 };
    }
    
    allPokemonStats[winnerCard.id].wins += 1;
    allPokemonStats[loserCard.id].losses += 1;
    
    // Save back to localStorage
    localStorage.setItem('pokemonStats', JSON.stringify(allPokemonStats));
    
    console.log(`${winnerCard.name} wins: ${allPokemonStats[winnerCard.id].wins}`);
    console.log(`${loserCard.name} losses: ${allPokemonStats[loserCard.id].losses}`);
  };

  const returnToSelection = () => {
    localStorage.removeItem('battleCards');
    // Force refresh of pokemon data by clearing and reloading
    window.location.href = '/';
  };

  if (!player1Card || !player2Card) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center">
        <div className="text-2xl">Loading battle...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative p-2 md:p-4 ${screenShake ? 'animate-screen-shake' : ''}`} style={{
      background: `linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)`
    }}>
      {/* Arena Floor Effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-amber-900 via-amber-800 to-transparent"></div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-96 h-20 bg-yellow-600 opacity-30 rounded-full blur-xl"></div>
      </div>

      {/* Subtle arena lighting */}
      <div className="hidden md:block absolute top-10 left-10 w-16 h-16 bg-yellow-300 rounded-full opacity-10 blur-xl"></div>
      <div className="hidden md:block absolute top-10 right-10 w-16 h-16 bg-yellow-300 rounded-full opacity-10 blur-xl"></div>
      
      {/* Battle intensity effect */}
      {isAnimating && (
        <div className="absolute inset-0 bg-red-500 opacity-5 animate-pulse"></div>
      )}
      
      {/* Victory lighting */}
      {winner && (
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-orange-500/10"></div>
      )}

      <div className="max-w-6xl mx-auto relative z-10">
        <h1 className="text-2xl md:text-4xl font-bold text-center mb-4 md:mb-8 text-white drop-shadow-lg">
          ⚔️ Battle Arena ⚔️
        </h1>

        {/* Center Arena Circle */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-4 border-yellow-400 rounded-full opacity-30 z-0"></div>
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-yellow-400 rounded-full opacity-10 z-0"></div>

        <div className="flex flex-col md:flex-row justify-between items-center mb-8 relative z-10 gap-6 md:gap-0">
          <div className={`transform transition-all duration-1000 ${battlePhase === 'setup' ? 'animate-slide-in-left' : ''} ${isAnimating && currentTurn === 'player1' ? 'animate-attack-3d' : ''} ${winner === 'player2' ? 'animate-defeated-3d' : ''} ${winner === 'player1' ? 'animate-victory-3d' : ''}`}>
            <div className="bg-white rounded-lg p-3 md:p-4 shadow-lg border-4 border-blue-500 w-full max-w-xs mx-auto">
              <div className="text-center mb-2">
                <h3 className="font-bold text-xl text-gray-800">{player1Card.name}</h3>
                <div className="bg-blue-500 text-white px-2 py-1 rounded text-sm">Player 1</div>
                {/* Special Move Display */}
                <div 
                  className="mt-2 text-xs font-bold tracking-wide" 
                  style={getSpecialMoveStyle(player1Card.specialMove.name)}
                >
                  {player1Card.specialMove.name}
                </div>
              </div>
              <Image
                src={player1Card.image}
                alt={player1Card.name}
                width={100}
                height={100}
                className="mx-auto pixelated md:w-[120px] md:h-[120px]"
              />
              <div className="mt-2">
                <div className="bg-gray-300 rounded-full h-4 mb-1 overflow-hidden">
                  <div 
                    className={`h-4 rounded-full transition-all duration-700 ${
                      player1Card.hp / player1Card.maxHp > 0.6 ? 'bg-green-500' :
                      player1Card.hp / player1Card.maxHp > 0.3 ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'
                    }`}
                    style={{ width: `${(player1Card.hp / player1Card.maxHp) * 100}%` }}
                  ></div>
                </div>
                <div className="text-center text-sm font-bold">
                  HP: {player1Card.hp}/{player1Card.maxHp}
                </div>
              </div>
            </div>
          </div>

          <div className="text-center order-first md:order-none">
            {battlePhase === 'fighting' && (
              <div className="space-y-4">
                <div className="text-lg md:text-2xl font-bold text-white drop-shadow-lg">
                  {currentTurn === 'player1' ? player1Card.name : player2Card.name}&apos;s Turn
                </div>
                <div className="flex flex-col items-center gap-4">
                  {/* Visual Dice */}
                  <div 
                    onClick={performAction}
                    className={`cursor-pointer select-none ${isDiceRolling ? 'dice-rolling' : 'dice-idle'} ${isAnimating ? 'pointer-events-none' : ''}`}
                  >
                    <div className={`w-20 h-20 rounded-lg flex items-center justify-center text-white font-bold text-2xl shadow-2xl border-4 ${
                      comboCounter > 0 ? 'bg-gradient-to-br from-yellow-500 to-orange-600 border-yellow-400 animate-pulse' : 
                      'bg-gradient-to-br from-red-600 to-red-800 border-red-400'
                    }`}>
                      {currentDiceDisplay}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-white font-bold text-lg">
                      {isDiceRolling ? 'Rolling...' : 'Click to Roll!'}
                    </div>
                    {comboCounter > 0 && !isDiceRolling && (
                      <div className="text-yellow-400 font-bold text-sm animate-pulse">
                        Combo x{comboCounter + 1}
                      </div>
                    )}
                  </div>
                  
                  {lastDefenseRoll > 0 && !isDiceRolling && (
                    <div className="text-sm text-white bg-black bg-opacity-60 rounded px-3 py-2">
                      <div className="text-center">
                        <div className="font-bold">Last Roll: {lastDefenseRoll}</div>
                        <div className="text-xs">
                          {lastDefenseRoll >= 10 ? '🛡️ BLOCKED!' : 
                           lastDefenseRoll >= 7 ? '💨 DODGED!' : 
                           '⚔️ Hit!'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {battlePhase === 'finished' && (
              <div className="space-y-4">
                <div className="text-2xl md:text-3xl font-bold text-green-400 drop-shadow-lg">
                  {winner === 'player1' ? player1Card.name : player2Card.name} Wins!
                </div>
                <button
                  onClick={returnToSelection}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-xl shadow-lg transform transition-transform hover:scale-105"
                >
                  Return to Card Selection
                </button>
              </div>
            )}
          </div>

          <div className={`transform transition-all duration-1000 ${battlePhase === 'setup' ? 'animate-slide-in-right' : ''} ${isAnimating && currentTurn === 'player2' ? 'animate-attack-3d' : ''} ${winner === 'player1' ? 'animate-defeated-3d' : ''} ${winner === 'player2' ? 'animate-victory-3d' : ''}`}>
            <div className="bg-white rounded-lg p-3 md:p-4 shadow-lg border-4 border-red-500 w-full max-w-xs mx-auto">
              <div className="text-center mb-2">
                <h3 className="font-bold text-xl text-gray-800">{player2Card.name}</h3>
                <div className="bg-red-500 text-white px-2 py-1 rounded text-sm">Player 2</div>
                {/* Special Move Display */}
                <div 
                  className="mt-2 text-xs font-bold tracking-wide" 
                  style={getSpecialMoveStyle(player2Card.specialMove.name)}
                >
                  {player2Card.specialMove.name}
                </div>
              </div>
              <Image
                src={player2Card.image}
                alt={player2Card.name}
                width={100}
                height={100}
                className="mx-auto pixelated md:w-[120px] md:h-[120px]"
              />
              <div className="mt-2">
                <div className="bg-gray-300 rounded-full h-4 mb-1 overflow-hidden">
                  <div 
                    className={`h-4 rounded-full transition-all duration-700 ${
                      player2Card.hp / player2Card.maxHp > 0.6 ? 'bg-green-500' :
                      player2Card.hp / player2Card.maxHp > 0.3 ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'
                    }`}
                    style={{ width: `${(player2Card.hp / player2Card.maxHp) * 100}%` }}
                  ></div>
                </div>
                <div className="text-center text-sm font-bold">
                  HP: {player2Card.hp}/{player2Card.maxHp}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Particle Effects */}
        <ParticleEffect 
          type={particleType}
          isActive={showParticles}
          onComplete={() => setShowParticles(false)}
          x={200}
          y={150}
        />

        {/* Floating Damage Text */}
        {showDamageText && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
            <div className={`text-6xl font-bold drop-shadow-lg animate-bounce ${
              comboCounter > 0 ? 'text-orange-500' : 'text-red-500'
            }`}>
              -{damageAmount}
              {comboCounter > 0 && <div className="text-2xl text-yellow-400">COMBO!</div>}
            </div>
          </div>
        )}

        {/* Combo Counter Display */}
        {comboCounter > 0 && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40">
            <div className="bg-yellow-400 text-black px-4 py-2 rounded-full font-bold text-lg animate-pulse border-2 border-orange-500">
              🔥 COMBO x{comboCounter + 1} 🔥
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg p-3 md:p-4 shadow-lg max-h-48 md:max-h-64 overflow-y-auto relative z-10" ref={battleLogRef}>
          <h3 className="font-bold text-base md:text-lg mb-2">Battle Log</h3>
          <div className="space-y-2">
            {battleLog.map((log, index) => (
              <div key={index} className={`text-sm space-y-1 p-2 rounded ${
                log.critical ? 'bg-red-50 border-l-4 border-red-500' : 
                log.moveType === 'block' ? 'bg-gray-50 border-l-4 border-gray-500' :
                log.moveType === 'dodge' ? 'bg-blue-50 border-l-4 border-blue-500' :
                'bg-gray-50'
              }`}>
                <div>
                  <span className="font-semibold text-purple-600">{log.attacker}</span> used{' '}
                  <span className={`font-semibold ${
                    log.moveType === 'attack' ? 'text-red-600' :
                    log.moveType === 'block' ? 'text-gray-600' :
                    log.moveType === 'dodge' ? 'text-blue-600' : 'text-blue-600'
                  }`}>{log.move}</span>
                  {' '}on <span className="font-semibold text-purple-600">{log.defender}</span>
                  {log.dodged && <span className="text-blue-600 font-bold"> 💨 COMPLETELY DODGED!</span>}
                  {log.blocked && !log.dodged && <span className="text-gray-600 font-bold"> 🛡️ BLOCKED!</span>}
                  {!log.blocked && !log.dodged && (
                    <>
                      {' '}for{' '}
                      <span className={`font-bold text-lg ${log.critical ? 'text-red-600 animate-pulse' : 'text-orange-600'}`}>
                        {log.damage} damage
                      </span>
                      {log.critical && (
                        <span className="text-red-600 font-bold animate-bounce">
                          {' '}⚡ CRITICAL {log.criticalType === 'attack' ? 'HIT!' : 'FAIL!'} ⚡
                        </span>
                      )}
                      {!log.critical && log.typeEffectiveness > 1.0 && <span className="text-green-600 font-bold"> 🎯 Super Effective!</span>}
                      {!log.critical && log.typeEffectiveness < 1.0 && <span className="text-gray-500"> 😕 Not very effective...</span>}
                    </>
                  )}
                  {log.blocked && !log.dodged && log.damage > 0 && (
                    <>
                      {' '}but still took{' '}
                      <span className="font-bold text-orange-600">{log.damage} damage</span>
                    </>
                  )}
                </div>
                <div className="text-xs text-gray-600 ml-4">
                  🎲 Attack: {log.attackDice} (Total: {log.attackRoll}) | 
                  🛡️ Defense: {log.defenseDice} (Total: {log.defenseRoll}) | 
                  🎲 D12 Defense: {lastDefenseRoll}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}