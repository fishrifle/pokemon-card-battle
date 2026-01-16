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
  attackerRoll: number;
  defenderRoll: number;
  attackerName: string;
  defenderName: string;
}

// Visual Dice Component - Shows dots like a real die
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
    ? 'bg-gradient-to-br from-red-500 to-red-700 border-red-300 shadow-red-500/50'
    : 'bg-gradient-to-br from-blue-500 to-blue-700 border-blue-300 shadow-blue-500/50';

  return (
    <div className={`relative w-20 h-20 md:w-24 md:h-24 rounded-xl ${colorClasses} border-4 shadow-2xl`}>
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
            className={`absolute w-3 h-3 md:w-4 md:h-4 bg-white rounded-full shadow-md ${positionClasses[pos]}`}
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

  // Each player has their own dice
  const [player1Dice, setPlayer1Dice] = useState<number>(1);
  const [player2Dice, setPlayer2Dice] = useState<number>(1);
  const [player1Rolling, setPlayer1Rolling] = useState(false);
  const [player2Rolling, setPlayer2Rolling] = useState(false);

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
    setPlayer1Rolling(true);
    setPlayer2Rolling(true);

    // Animate BOTH dice rolling independently
    let rollCount = 0;
    const rollInterval = setInterval(() => {
      setPlayer1Dice(rollDice());
      setPlayer2Dice(rollDice());
      rollCount++;

      if (rollCount >= 12) {
        clearInterval(rollInterval);

        // Final rolls for each player
        const finalP1 = rollDice();
        const finalP2 = rollDice();
        setPlayer1Dice(finalP1);
        setPlayer2Dice(finalP2);
        setPlayer1Rolling(false);
        setPlayer2Rolling(false);

        // Process battle after dice stop
        setTimeout(() => {
          processBattle(finalP1, finalP2);
        }, 400);
      }
    }, 70);
  };

  const processBattle = (p1Roll: number, p2Roll: number) => {
    const isP1Turn = currentTurn === 'player1';
    const attacker = isP1Turn ? player1Card : player2Card;
    const defender = isP1Turn ? player2Card : player1Card;
    const attackerRoll = isP1Turn ? p1Roll : p2Roll;
    const defenderRoll = isP1Turn ? p2Roll : p1Roll;

    if (!attacker || !defender) return;

    // SIMPLE DAMAGE FORMULA:
    // Base damage from move + attacker's roll bonus - defender's roll reduction
    const baseDamage = Math.floor(attacker.specialMove.damage * 0.2);
    const attackBonus = attackerRoll * 5; // Each pip = 5 damage
    const defenseReduction = defenderRoll * 3; // Each pip = 3 damage blocked

    // Critical hit on rolling 6
    const isCritical = attackerRoll === 6;
    const typeMultiplier = getTypeEffectiveness(attacker.types, defender.types);

    // Calculate damage
    let rawDamage = baseDamage + attackBonus - defenseReduction;
    rawDamage = Math.floor(rawDamage * typeMultiplier);

    if (isCritical) {
      rawDamage = Math.floor(rawDamage * 1.5);
    }

    // Minimum 15% of max HP, maximum 50% of max HP per hit
    const minDamage = Math.floor(defender.maxHp * 0.15);
    const maxDamage = Math.floor(defender.maxHp * 0.50);
    const finalDamage = Math.max(minDamage, Math.min(maxDamage, Math.max(1, rawDamage)));

    const newHP = Math.max(0, defender.hp - finalDamage);

    const logEntry: BattleLog = {
      attacker: attacker.name,
      defender: defender.name,
      move: attacker.specialMove.name,
      damage: finalDamage,
      critical: isCritical,
      typeEffectiveness: typeMultiplier,
      attackerRoll,
      defenderRoll,
      attackerName: isP1Turn ? 'Player 1' : 'Player 2',
      defenderName: isP1Turn ? 'Player 2' : 'Player 1',
    };

    setBattleLog(prev => [...prev, logEntry]);

    // Visual feedback
    setDamageAmount(finalDamage);
    setShowDamageText(true);
    setTimeout(() => setShowDamageText(false), 1200);

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
    if (isP1Turn) {
      setPlayer2Card(prev => prev ? { ...prev, hp: newHP } : null);
    } else {
      setPlayer1Card(prev => prev ? { ...prev, hp: newHP } : null);
    }

    // Check for winner or switch turns
    setTimeout(() => {
      if (newHP <= 0) {
        setWinner(currentTurn);
        setBattlePhase('finished');
        setTimeout(() => {
          playVictory();
          setTimeout(() => playDefeat(), 400);
        }, 200);
      } else {
        setCurrentTurn(isP1Turn ? 'player2' : 'player1');
      }
      setIsAnimating(false);
    }, 700);
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
        <h1 className="text-2xl md:text-4xl font-bold text-center mb-4 text-white drop-shadow-lg">
          ⚔️ Battle Arena ⚔️
        </h1>

        {/* Turn Indicator & Roll Button - TOP CENTER */}
        <div className="text-center mb-4">
          {battlePhase === 'fighting' && (
            <div className="space-y-2">
              <div className="text-xl md:text-2xl font-bold text-white drop-shadow-lg">
                {currentTurn === 'player1' ? (
                  <span className="text-red-400">{player1Card.name}&apos;s Turn (Player 1)</span>
                ) : (
                  <span className="text-blue-400">{player2Card.name}&apos;s Turn (Player 2)</span>
                )}
              </div>

              <button
                onClick={performAction}
                disabled={isAnimating}
                className={`px-10 py-4 text-xl font-bold rounded-xl shadow-xl transform transition-all ${
                  isAnimating
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:scale-110 hover:shadow-2xl'
                } text-white border-4 border-yellow-300`}
              >
                {(player1Rolling || player2Rolling) ? '🎲 Rolling...' : '🎲 ATTACK!'}
              </button>

              <div className="text-sm text-gray-300">
                Higher roll = More damage! Roll 6 = Critical Hit!
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

        {/* Battle Arena - Players on opposite sides */}
        <div className="flex flex-col md:flex-row justify-between items-stretch gap-4 md:gap-8 mb-4">

          {/* PLAYER 1 - Left Side with RED Dice */}
          <div className={`flex-1 transform transition-all duration-500 ${
            battlePhase === 'setup' ? 'animate-slide-in-left' : ''
          } ${isAnimating && currentTurn === 'player1' ? 'scale-105' : ''} ${
            winner === 'player2' ? 'opacity-50 grayscale' : ''
          } ${winner === 'player1' ? 'ring-4 ring-yellow-400' : ''}`}>

            <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl p-4 border-4 border-red-500 shadow-2xl">
              {/* Player Label */}
              <div className="text-center mb-2">
                <span className="bg-red-600 text-white px-4 py-1 rounded-full text-lg font-bold">
                  PLAYER 1
                </span>
              </div>

              {/* Pokemon Card */}
              <div className="bg-white rounded-lg p-3 mb-4">
                <h3 className="font-bold text-xl text-center text-gray-800">{player1Card.name}</h3>
                <div className="text-center text-xs font-bold mb-2" style={getSpecialMoveStyle(player1Card.specialMove.name)}>
                  {player1Card.specialMove.name}
                </div>
                <Image src={player1Card.image} alt={player1Card.name} width={120} height={120} className="mx-auto pixelated" />

                {/* HP Bar */}
                <div className="mt-3">
                  <div className="bg-gray-300 rounded-full h-5 overflow-hidden">
                    <div
                      className={`h-5 rounded-full transition-all duration-500 ${
                        player1Card.hp / player1Card.maxHp > 0.6 ? 'bg-green-500' :
                        player1Card.hp / player1Card.maxHp > 0.3 ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'
                      }`}
                      style={{ width: `${(player1Card.hp / player1Card.maxHp) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-center text-sm font-bold mt-1">HP: {player1Card.hp}/{player1Card.maxHp}</div>
                </div>
              </div>

              {/* Player 1's RED DICE */}
              <div className="flex flex-col items-center">
                <div className="text-white font-bold mb-2 text-lg">🎲 Your Roll</div>
                <div className={`transition-transform ${player1Rolling ? 'animate-spin' : ''}`}>
                  <DiceFace value={player1Dice} color="red" />
                </div>
                <div className="text-3xl font-bold text-red-400 mt-2">
                  {player1Dice}
                </div>
              </div>
            </div>
          </div>

          {/* VS Divider */}
          <div className="flex items-center justify-center">
            <div className="text-4xl md:text-6xl font-bold text-yellow-400 drop-shadow-lg">
              VS
            </div>
          </div>

          {/* PLAYER 2 - Right Side with BLUE Dice */}
          <div className={`flex-1 transform transition-all duration-500 ${
            battlePhase === 'setup' ? 'animate-slide-in-right' : ''
          } ${isAnimating && currentTurn === 'player2' ? 'scale-105' : ''} ${
            winner === 'player1' ? 'opacity-50 grayscale' : ''
          } ${winner === 'player2' ? 'ring-4 ring-yellow-400' : ''}`}>

            <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl p-4 border-4 border-blue-500 shadow-2xl">
              {/* Player Label */}
              <div className="text-center mb-2">
                <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-lg font-bold">
                  PLAYER 2
                </span>
              </div>

              {/* Pokemon Card */}
              <div className="bg-white rounded-lg p-3 mb-4">
                <h3 className="font-bold text-xl text-center text-gray-800">{player2Card.name}</h3>
                <div className="text-center text-xs font-bold mb-2" style={getSpecialMoveStyle(player2Card.specialMove.name)}>
                  {player2Card.specialMove.name}
                </div>
                <Image src={player2Card.image} alt={player2Card.name} width={120} height={120} className="mx-auto pixelated" />

                {/* HP Bar */}
                <div className="mt-3">
                  <div className="bg-gray-300 rounded-full h-5 overflow-hidden">
                    <div
                      className={`h-5 rounded-full transition-all duration-500 ${
                        player2Card.hp / player2Card.maxHp > 0.6 ? 'bg-green-500' :
                        player2Card.hp / player2Card.maxHp > 0.3 ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'
                      }`}
                      style={{ width: `${(player2Card.hp / player2Card.maxHp) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-center text-sm font-bold mt-1">HP: {player2Card.hp}/{player2Card.maxHp}</div>
                </div>
              </div>

              {/* Player 2's BLUE DICE */}
              <div className="flex flex-col items-center">
                <div className="text-white font-bold mb-2 text-lg">🎲 Your Roll</div>
                <div className={`transition-transform ${player2Rolling ? 'animate-spin' : ''}`}>
                  <DiceFace value={player2Dice} color="blue" />
                </div>
                <div className="text-3xl font-bold text-blue-400 mt-2">
                  {player2Dice}
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
            <div className="text-7xl font-bold text-red-500 drop-shadow-lg animate-bounce">
              -{damageAmount}
            </div>
          </div>
        )}

        {/* Battle Log - Shows exactly what happened */}
        <div className="bg-gray-900 rounded-xl p-4 shadow-lg max-h-48 overflow-y-auto border-2 border-gray-700" ref={battleLogRef}>
          <h3 className="font-bold text-lg mb-3 text-white">📜 Battle Log</h3>
          <div className="space-y-3">
            {battleLog.length === 0 && (
              <div className="text-gray-400 text-center py-4">Click ATTACK to begin!</div>
            )}
            {battleLog.map((log, index) => (
              <div key={index} className={`text-sm p-3 rounded-lg ${
                log.critical ? 'bg-red-900/50 border-l-4 border-red-500' : 'bg-gray-800'
              }`}>
                {/* Attack Summary */}
                <div className="text-white">
                  <span className="font-bold text-yellow-400">{log.attacker}</span>
                  {' '}used{' '}
                  <span className="font-bold text-purple-400">{log.move}</span>
                  {' '}on{' '}
                  <span className="font-bold text-yellow-400">{log.defender}</span>
                </div>

                {/* Dice Rolls - Clear breakdown */}
                <div className="mt-2 text-gray-300 flex gap-4 text-xs">
                  <span className="text-red-400">
                    🎲 {log.attackerName} rolled: <strong>{log.attackerRoll}</strong>
                    {log.attackerRoll === 6 && ' ⚡'}
                  </span>
                  <span className="text-blue-400">
                    🛡️ {log.defenderName} rolled: <strong>{log.defenderRoll}</strong>
                  </span>
                </div>

                {/* Damage Result */}
                <div className="mt-2 flex flex-wrap gap-2 items-center">
                  <span className={`font-bold text-lg ${log.critical ? 'text-red-400' : 'text-orange-400'}`}>
                    {log.damage} damage!
                  </span>
                  {log.critical && <span className="text-red-400 font-bold text-xs bg-red-900 px-2 py-1 rounded">⚡ CRITICAL HIT!</span>}
                  {log.typeEffectiveness > 1.0 && <span className="text-green-400 font-bold text-xs bg-green-900 px-2 py-1 rounded">🎯 Super Effective!</span>}
                  {log.typeEffectiveness < 1.0 && <span className="text-gray-400 text-xs bg-gray-700 px-2 py-1 rounded">Not very effective...</span>}
                </div>

                {/* Damage Calculation Explanation */}
                <div className="mt-1 text-xs text-gray-500">
                  Roll {log.attackerRoll} (+{log.attackerRoll * 5} dmg) vs Roll {log.defenderRoll} (-{log.defenderRoll * 3} blocked)
                  {log.typeEffectiveness !== 1.0 && ` × ${log.typeEffectiveness}x type`}
                  {log.critical && ' × 1.5x crit'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
