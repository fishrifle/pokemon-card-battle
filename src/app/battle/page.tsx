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
  attackerDice: number;
  defenderDice: number;
}

// Visual Dice Component
const DiceFace = ({ value, color }: { value: number; color: 'red' | 'blue' }) => {
  const dotPositions: Record<number, string[]> = {
    1: ['center'],
    2: ['top-right', 'bottom-left'],
    3: ['top-right', 'center', 'bottom-left'],
    4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
    5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
    6: ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right'],
  };

  const positions = dotPositions[value] || [];
  const colorClasses = color === 'red'
    ? 'bg-gradient-to-br from-red-500 to-red-700 border-red-400'
    : 'bg-gradient-to-br from-blue-500 to-blue-700 border-blue-400';

  return (
    <div className={`relative w-16 h-16 md:w-20 md:h-20 rounded-xl ${colorClasses} border-4 shadow-xl`}>
      {positions.map((pos, idx) => {
        const positionClasses: Record<string, string> = {
          'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
          'top-left': 'top-2 left-2',
          'top-right': 'top-2 right-2',
          'middle-left': 'top-1/2 left-2 -translate-y-1/2',
          'middle-right': 'top-1/2 right-2 -translate-y-1/2',
          'bottom-left': 'bottom-2 left-2',
          'bottom-right': 'bottom-2 right-2',
        };
        return (
          <div
            key={idx}
            className={`absolute w-2.5 h-2.5 md:w-3 md:h-3 bg-white rounded-full shadow-sm ${positionClasses[pos]}`}
          />
        );
      })}
    </div>
  );
};

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
  const [screenShake, setScreenShake] = useState(false);

  // Separate dice for each player
  const [player1Dice, setPlayer1Dice] = useState<number>(1);
  const [player2Dice, setPlayer2Dice] = useState<number>(1);
  const [isDiceRolling, setIsDiceRolling] = useState(false);

  const router = useRouter();
  const { playAttack, playCriticalHit, playVictory, playDefeat } = useSound();
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
      }, 1000);
    } else {
      router.push('/');
    }
  }, [router]);

  useEffect(() => {
    if (winner && battlePhase === 'finished') {
      updatePokemonStats();
    }
  }, [winner, battlePhase, battleCards]);

  const rollDice = () => Math.floor(Math.random() * 6) + 1;

  const getTypeEffectiveness = (attackerTypes: string[], defenderTypes: string[]) => {
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
          return 1.25;
        }
        if (effectiveness[defenderType]?.includes(attackType)) {
          return 0.8;
        }
      }
    }
    return 1.0;
  };

  const performAction = async () => {
    if (!player1Card || !player2Card || isAnimating || battlePhase !== 'fighting') return;

    setIsAnimating(true);
    setIsDiceRolling(true);

    // Animate dice rolling for both players
    let rollCount = 0;
    const rollInterval = setInterval(() => {
      setPlayer1Dice(rollDice());
      setPlayer2Dice(rollDice());
      rollCount++;

      if (rollCount >= 10) {
        clearInterval(rollInterval);

        // Final rolls
        const finalP1Dice = rollDice();
        const finalP2Dice = rollDice();
        setPlayer1Dice(finalP1Dice);
        setPlayer2Dice(finalP2Dice);
        setIsDiceRolling(false);

        // Process battle after dice stop
        setTimeout(() => {
          processBattle(finalP1Dice, finalP2Dice);
        }, 300);
      }
    }, 80);
  };

  const processBattle = (p1Dice: number, p2Dice: number) => {
    const attacker = currentTurn === 'player1' ? player1Card : player2Card;
    const defender = currentTurn === 'player1' ? player2Card : player1Card;
    const attackerDice = currentTurn === 'player1' ? p1Dice : p2Dice;
    const defenderDice = currentTurn === 'player1' ? p2Dice : p1Dice;

    if (!attacker || !defender) return;

    // Higher roll = more damage! Simple and intuitive
    // Attacker's dice adds to damage, defender's dice reduces it
    const baseDamage = Math.floor(attacker.specialMove.damage * 0.15);
    const attackBonus = Math.floor(attacker.attack / 15) + (attackerDice * 3);
    const defenseReduction = Math.floor(defender.defense / 20) + (defenderDice * 2);

    // Critical hit on rolling 6
    const isCritical = attackerDice === 6;
    const typeMultiplier = getTypeEffectiveness(attacker.types, defender.types);

    let totalDamage = baseDamage + attackBonus - defenseReduction;
    totalDamage = Math.floor(totalDamage * typeMultiplier);

    if (isCritical) {
      totalDamage = Math.floor(totalDamage * 1.5);
    }

    // Clamp damage for balanced battles (25-45% of max HP)
    const minDamage = Math.floor(defender.maxHp * 0.25);
    const maxDamage = Math.floor(defender.maxHp * 0.45);
    const finalDamage = Math.max(minDamage, Math.min(maxDamage, totalDamage));

    const newHP = Math.max(0, defender.hp - finalDamage);

    const logEntry: BattleLog = {
      attacker: attacker.name,
      defender: defender.name,
      move: attacker.specialMove.name,
      damage: finalDamage,
      critical: isCritical,
      typeEffectiveness: typeMultiplier,
      attackerDice,
      defenderDice,
    };

    setBattleLog(prev => [...prev, logEntry]);

    // Visual feedback
    setDamageAmount(finalDamage);
    setShowDamageText(true);
    setTimeout(() => setShowDamageText(false), 1500);

    // Auto-scroll battle log
    setTimeout(() => {
      if (battleLogRef.current) {
        battleLogRef.current.scrollTop = battleLogRef.current.scrollHeight;
      }
    }, 100);

    // Sound and particle effects
    const primaryType = attacker.types[0];
    playAttack(primaryType);

    const typeToParticle = (type: string): 'fire' | 'water' | 'electric' | 'grass' | 'psychic' | 'impact' => {
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

    if (isCritical) {
      setTimeout(() => playCriticalHit(), 150);
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 400);
    }

    // Update HP
    if (currentTurn === 'player1') {
      setPlayer2Card(prev => prev ? { ...prev, hp: newHP } : null);
    } else {
      setPlayer1Card(prev => prev ? { ...prev, hp: newHP } : null);
    }

    // Check for winner or switch turns (faster!)
    setTimeout(() => {
      if (newHP <= 0) {
        setWinner(currentTurn);
        setBattlePhase('finished');
        setTimeout(() => {
          playVictory();
          setTimeout(() => playDefeat(), 400);
        }, 200);
      } else {
        setCurrentTurn(currentTurn === 'player1' ? 'player2' : 'player1');
      }
      setIsAnimating(false);
    }, 800);
  };

  const getSpecialMoveStyle = (moveName: string) => {
    const lowerName = moveName.toLowerCase();

    if (lowerName.includes('flame') || lowerName.includes('fire') || lowerName.includes('burn')) {
      return { color: '#ff4500', textShadow: '0 0 8px #ff4500' };
    } else if (lowerName.includes('water') || lowerName.includes('surf') || lowerName.includes('hydro')) {
      return { color: '#1e90ff', textShadow: '0 0 8px #1e90ff' };
    } else if (lowerName.includes('thunder') || lowerName.includes('electric') || lowerName.includes('shock')) {
      return { color: '#ffd700', textShadow: '0 0 8px #ffd700' };
    } else if (lowerName.includes('leaf') || lowerName.includes('vine') || lowerName.includes('solar')) {
      return { color: '#32cd32', textShadow: '0 0 8px #32cd32' };
    } else if (lowerName.includes('psychic') || lowerName.includes('mind') || lowerName.includes('confusion')) {
      return { color: '#da70d6', textShadow: '0 0 8px #da70d6' };
    }
    return { color: '#708090', textShadow: '0 0 8px #708090' };
  };

  const updatePokemonStats = () => {
    if (!winner || !battleCards.length) return;

    const winnerCard = winner === 'player1' ? battleCards[0] : battleCards[1];
    const loserCard = winner === 'player1' ? battleCards[1] : battleCards[0];

    const existingStats = localStorage.getItem('pokemonStats');
    let allPokemonStats: Record<number, {wins: number, losses: number}> = {};

    if (existingStats) {
      try {
        allPokemonStats = JSON.parse(existingStats);
      } catch {
        // Ignore parse errors
      }
    }

    if (!allPokemonStats[winnerCard.id]) {
      allPokemonStats[winnerCard.id] = { wins: 0, losses: 0 };
    }
    if (!allPokemonStats[loserCard.id]) {
      allPokemonStats[loserCard.id] = { wins: 0, losses: 0 };
    }

    allPokemonStats[winnerCard.id].wins += 1;
    allPokemonStats[loserCard.id].losses += 1;

    localStorage.setItem('pokemonStats', JSON.stringify(allPokemonStats));
  };

  const returnToSelection = () => {
    localStorage.removeItem('battleCards');
    window.location.href = '/';
  };

  if (!player1Card || !player2Card) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-2xl text-white">Loading battle...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative p-2 md:p-4 ${screenShake ? 'animate-screen-shake' : ''}`} style={{
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
    }}>
      {/* Arena Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-amber-900 via-amber-800 to-transparent"></div>
      </div>

      {isAnimating && (
        <div className="absolute inset-0 bg-red-500 opacity-5 animate-pulse"></div>
      )}

      {winner && (
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-orange-500/10"></div>
      )}

      <div className="max-w-6xl mx-auto relative z-10">
        <h1 className="text-2xl md:text-4xl font-bold text-center mb-4 md:mb-6 text-white drop-shadow-lg">
          ⚔️ Battle Arena ⚔️
        </h1>

        <div className="flex flex-col md:flex-row justify-between items-center mb-6 relative z-10 gap-4 md:gap-0">
          {/* Player 1 Card + Red Dice */}
          <div className={`transform transition-all duration-700 ${battlePhase === 'setup' ? 'animate-slide-in-left' : ''} ${isAnimating && currentTurn === 'player1' ? 'scale-105' : ''} ${winner === 'player2' ? 'opacity-50 grayscale' : ''} ${winner === 'player1' ? 'scale-110' : ''}`}>
            <div className="bg-white rounded-lg p-3 md:p-4 shadow-lg border-4 border-blue-500 w-full max-w-xs mx-auto">
              <div className="text-center mb-2">
                <h3 className="font-bold text-xl text-gray-800">{player1Card.name}</h3>
                <div className="bg-blue-500 text-white px-2 py-1 rounded text-sm">Player 1</div>
                <div className="mt-2 text-xs font-bold" style={getSpecialMoveStyle(player1Card.specialMove.name)}>
                  {player1Card.specialMove.name}
                </div>
              </div>
              <Image src={player1Card.image} alt={player1Card.name} width={100} height={100} className="mx-auto pixelated md:w-[120px] md:h-[120px]" />
              <div className="mt-2">
                <div className="bg-gray-300 rounded-full h-4 mb-1 overflow-hidden">
                  <div
                    className={`h-4 rounded-full transition-all duration-500 ${
                      player1Card.hp / player1Card.maxHp > 0.6 ? 'bg-green-500' :
                      player1Card.hp / player1Card.maxHp > 0.3 ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'
                    }`}
                    style={{ width: `${(player1Card.hp / player1Card.maxHp) * 100}%` }}
                  ></div>
                </div>
                <div className="text-center text-sm font-bold">HP: {player1Card.hp}/{player1Card.maxHp}</div>
              </div>

              {/* Player 1 RED Dice */}
              <div className="flex justify-center mt-3">
                <div className={`transition-transform ${isDiceRolling ? 'animate-bounce' : ''}`}>
                  <DiceFace value={player1Dice} color="red" />
                </div>
              </div>
              <div className="text-center text-sm font-bold text-red-600 mt-1">
                Roll: {player1Dice}
              </div>
            </div>
          </div>

          {/* Center - VS and Roll Button */}
          <div className="text-center order-first md:order-none">
            {battlePhase === 'fighting' && (
              <div className="space-y-3">
                <div className="text-lg md:text-2xl font-bold text-white drop-shadow-lg">
                  {currentTurn === 'player1' ? player1Card.name : player2Card.name}&apos;s Turn
                </div>

                <button
                  onClick={performAction}
                  disabled={isAnimating}
                  className={`px-8 py-4 text-xl font-bold rounded-xl shadow-xl transform transition-all ${
                    isAnimating
                      ? 'bg-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:scale-110 hover:shadow-2xl'
                  } text-white border-4 border-yellow-300`}
                >
                  {isDiceRolling ? '🎲 Rolling...' : '🎲 Roll Dice!'}
                </button>

                <div className="text-sm text-gray-300">
                  Higher roll = More damage!
                </div>
              </div>
            )}

            {battlePhase === 'finished' && (
              <div className="space-y-4">
                <div className="text-2xl md:text-3xl font-bold text-green-400 drop-shadow-lg animate-pulse">
                  🏆 {winner === 'player1' ? player1Card.name : player2Card.name} Wins! 🏆
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

          {/* Player 2 Card + Blue Dice */}
          <div className={`transform transition-all duration-700 ${battlePhase === 'setup' ? 'animate-slide-in-right' : ''} ${isAnimating && currentTurn === 'player2' ? 'scale-105' : ''} ${winner === 'player1' ? 'opacity-50 grayscale' : ''} ${winner === 'player2' ? 'scale-110' : ''}`}>
            <div className="bg-white rounded-lg p-3 md:p-4 shadow-lg border-4 border-red-500 w-full max-w-xs mx-auto">
              <div className="text-center mb-2">
                <h3 className="font-bold text-xl text-gray-800">{player2Card.name}</h3>
                <div className="bg-red-500 text-white px-2 py-1 rounded text-sm">Player 2</div>
                <div className="mt-2 text-xs font-bold" style={getSpecialMoveStyle(player2Card.specialMove.name)}>
                  {player2Card.specialMove.name}
                </div>
              </div>
              <Image src={player2Card.image} alt={player2Card.name} width={100} height={100} className="mx-auto pixelated md:w-[120px] md:h-[120px]" />
              <div className="mt-2">
                <div className="bg-gray-300 rounded-full h-4 mb-1 overflow-hidden">
                  <div
                    className={`h-4 rounded-full transition-all duration-500 ${
                      player2Card.hp / player2Card.maxHp > 0.6 ? 'bg-green-500' :
                      player2Card.hp / player2Card.maxHp > 0.3 ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'
                    }`}
                    style={{ width: `${(player2Card.hp / player2Card.maxHp) * 100}%` }}
                  ></div>
                </div>
                <div className="text-center text-sm font-bold">HP: {player2Card.hp}/{player2Card.maxHp}</div>
              </div>

              {/* Player 2 BLUE Dice */}
              <div className="flex justify-center mt-3">
                <div className={`transition-transform ${isDiceRolling ? 'animate-bounce' : ''}`}>
                  <DiceFace value={player2Dice} color="blue" />
                </div>
              </div>
              <div className="text-center text-sm font-bold text-blue-600 mt-1">
                Roll: {player2Dice}
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
            <div className="text-6xl font-bold text-red-500 drop-shadow-lg animate-bounce">
              -{damageAmount}
            </div>
          </div>
        )}

        {/* Battle Log */}
        <div className="bg-white rounded-lg p-3 md:p-4 shadow-lg max-h-40 md:max-h-56 overflow-y-auto relative z-10" ref={battleLogRef}>
          <h3 className="font-bold text-base md:text-lg mb-2">Battle Log</h3>
          <div className="space-y-2">
            {battleLog.map((log, index) => (
              <div key={index} className={`text-sm p-2 rounded ${
                log.critical ? 'bg-red-50 border-l-4 border-red-500' : 'bg-gray-50'
              }`}>
                <div>
                  <span className="font-semibold text-purple-600">{log.attacker}</span>
                  {' '}used <span className="font-semibold text-red-600">{log.move}</span>
                  {' '}on <span className="font-semibold text-purple-600">{log.defender}</span>
                  {' '}for <span className={`font-bold ${log.critical ? 'text-red-600' : 'text-orange-600'}`}>{log.damage} damage</span>
                  {log.critical && <span className="text-red-600 font-bold"> ⚡ CRITICAL!</span>}
                  {log.typeEffectiveness > 1.0 && <span className="text-green-600 font-bold"> 🎯 Super Effective!</span>}
                  {log.typeEffectiveness < 1.0 && <span className="text-gray-500"> Not very effective...</span>}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  🎲 Attack: {log.attackerDice} | 🛡️ Defense: {log.defenderDice}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
