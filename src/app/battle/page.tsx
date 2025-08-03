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
  damage: number;
  critical: boolean;
  typeEffectiveness: number;
  attackDice: number;
  defenseDice: number;
  attackRoll: number;
  defenseRoll: number;
  criticalType: string;
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

  const calculateDamage = (attacker: PokemonCardType, defender: PokemonCardType) => {
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
    
    // Ensure damage is reasonable (20-40% of defender's max HP for faster battles)
    const minDamage = Math.floor(defender.maxHp * 0.20);
    const maxDamage = Math.floor(defender.maxHp * 0.40);
    
    return {
      damage: Math.max(minDamage, Math.min(maxDamage, totalDamage)),
      critical: isCritical,
      attackDice: attackDice,
      defenseDice: defenseDice,
      attackRoll: attackRoll,
      defenseRoll: defenseRoll,
      criticalType: attackCritical ? 'attack' : (defenseCritical ? 'defense' : 'none'),
      typeEffectiveness: typeMultiplier
    };
  };

  const performAttack = async () => {
    if (!player1Card || !player2Card || isAnimating || battlePhase !== 'fighting') return;

    setIsAnimating(true);
    const attacker = currentTurn === 'player1' ? player1Card : player2Card;
    const defender = currentTurn === 'player1' ? player2Card : player1Card;
    
    const attackResult = calculateDamage(attacker, defender);
    const newHP = Math.max(0, defender.hp - attackResult.damage);

    const logEntry: BattleLog = {
      attacker: attacker.name,
      defender: defender.name,
      move: attacker.specialMove.name,
      damage: attackResult.damage,
      critical: attackResult.critical,
      typeEffectiveness: attackResult.typeEffectiveness,
      attackDice: attackResult.attackDice,
      defenseDice: attackResult.defenseDice,
      attackRoll: attackResult.attackRoll,
      defenseRoll: attackResult.defenseRoll,
      criticalType: attackResult.criticalType
    };

    setBattleLog(prev => [...prev, logEntry]);

    // Auto-scroll to bottom of battle log
    setTimeout(() => {
      if (battleLogRef.current) {
        battleLogRef.current.scrollTop = battleLogRef.current.scrollHeight;
      }
    }, 100);

    // Play sound effects and show particles
    const primaryType = attacker.types[0];
    playAttack(primaryType);
    
    // Set particle type based on Pokemon type
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
    
    // Screen shake on critical hits
    if (attackResult.critical) {
      setTimeout(() => playCriticalHit(), 200);
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 500);
    }

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
    <div className={`min-h-screen relative p-4 ${screenShake ? 'animate-screen-shake' : ''}`} style={{
      background: `
        radial-gradient(circle at 30% 20%, rgba(255, 215, 0, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 70% 80%, rgba(255, 69, 0, 0.2) 0%, transparent 50%),
        linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #16213e 75%, #1a1a2e 100%)
      `
    }}>
      {/* Arena Floor Effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-amber-900 via-amber-800 to-transparent"></div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-96 h-20 bg-yellow-600 opacity-30 rounded-full blur-xl"></div>
      </div>

      {/* Arena Lights - Enhanced with dynamic effects */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-300 rounded-full opacity-20 blur-2xl animate-pulse"></div>
      <div className="absolute top-10 right-10 w-20 h-20 bg-yellow-300 rounded-full opacity-20 blur-2xl animate-pulse"></div>
      
      {/* Dynamic spotlights */}
      <div className="absolute top-0 left-1/4 w-32 h-32 bg-gradient-radial from-white/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute top-0 right-1/4 w-32 h-32 bg-gradient-radial from-white/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
      
      {/* Battle intensity lights */}
      {isAnimating && (
        <>
          <div className="absolute inset-0 bg-red-500 opacity-5 animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-400 rounded-full opacity-10 blur-3xl animate-ping"></div>
        </>
      )}
      
      {/* Victory lighting */}
      {winner && (
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 animate-pulse"></div>
      )}

      <div className="max-w-6xl mx-auto relative z-10">
        <h1 className="text-4xl font-bold text-center mb-8 text-white drop-shadow-lg">
          ⚔️ Battle Arena ⚔️
        </h1>

        {/* Center Arena Circle */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-4 border-yellow-400 rounded-full opacity-30 z-0"></div>
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-yellow-400 rounded-full opacity-10 z-0"></div>

        <div className="flex justify-between items-center mb-8 relative z-10">
          <div className={`transform transition-all duration-1000 ${battlePhase === 'setup' ? 'animate-slide-in-left' : ''} ${isAnimating && currentTurn === 'player1' ? 'animate-attack-3d' : ''} ${winner === 'player2' ? 'animate-defeated-3d' : ''} ${winner === 'player1' ? 'animate-victory-3d' : ''}`}>
            <div className="bg-white rounded-lg p-4 shadow-lg border-4 border-blue-500">
              <div className="text-center mb-2">
                <h3 className="font-bold text-xl text-gray-800">{player1Card.name}</h3>
                <div className="bg-blue-500 text-white px-2 py-1 rounded text-sm">Player 1</div>
              </div>
              <Image
                src={player1Card.image}
                alt={player1Card.name}
                width={120}
                height={120}
                className="mx-auto pixelated"
              />
              <div className="mt-2">
                <div className="bg-green-500 rounded-full h-4 mb-1">
                  <div 
                    className="bg-green-700 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${(player1Card.hp / player1Card.maxHp) * 100}%` }}
                  ></div>
                </div>
                <div className="text-center text-sm font-bold">
                  HP: {player1Card.hp}/{player1Card.maxHp}
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            {battlePhase === 'fighting' && (
              <div className="space-y-4">
                <div className="text-2xl font-bold text-gray-800">
                  {currentTurn === 'player1' ? player1Card.name : player2Card.name}&apos;s Turn
                </div>
                <button
                  onClick={performAttack}
                  disabled={isAnimating}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg text-xl shadow-lg transform transition-transform hover:scale-105 disabled:scale-100"
                >
                  {isAnimating ? 'Attacking...' : 'Attack!'}
                </button>
              </div>
            )}
            
            {battlePhase === 'finished' && (
              <div className="space-y-4">
                <div className="text-3xl font-bold text-green-600">
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
            <div className="bg-white rounded-lg p-4 shadow-lg border-4 border-red-500">
              <div className="text-center mb-2">
                <h3 className="font-bold text-xl text-gray-800">{player2Card.name}</h3>
                <div className="bg-red-500 text-white px-2 py-1 rounded text-sm">Player 2</div>
              </div>
              <Image
                src={player2Card.image}
                alt={player2Card.name}
                width={120}
                height={120}
                className="mx-auto pixelated"
              />
              <div className="mt-2">
                <div className="bg-green-500 rounded-full h-4 mb-1">
                  <div 
                    className="bg-green-700 h-4 rounded-full transition-all duration-500"
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

        <div className="bg-white rounded-lg p-4 shadow-lg max-h-64 overflow-y-auto relative z-10" ref={battleLogRef}>
          <h3 className="font-bold text-lg mb-2">Battle Log</h3>
          <div className="space-y-2">
            {battleLog.map((log, index) => (
              <div key={index} className="text-sm space-y-1">
                <div>
                  <span className="font-semibold">{log.attacker}</span> used{' '}
                  <span className="font-semibold text-blue-600">{log.move}</span> on{' '}
                  <span className="font-semibold">{log.defender}</span> for{' '}
                  <span className={`font-bold ${log.critical ? 'text-red-600' : 'text-orange-600'}`}>
                    {log.damage} damage
                  </span>
                  {log.critical && (
                    <span className="text-red-600 font-bold">
                      {' '}(Critical {log.criticalType === 'attack' ? 'Attack!' : 'Defense Fail!'})
                    </span>
                  )}
                  {log.typeEffectiveness > 1.0 && <span className="text-green-600 font-bold"> (Super Effective!)</span>}
                  {log.typeEffectiveness < 1.0 && <span className="text-gray-500"> (Not very effective...)</span>}
                </div>
                <div className="text-xs text-gray-600 ml-4">
                  🎲 Attack: {log.attackDice} (Total: {log.attackRoll}) | 
                  🛡️ Defense: {log.defenseDice} (Total: {log.defenseRoll})
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}