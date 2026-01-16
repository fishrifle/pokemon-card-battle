'use client';

import { useState, useEffect } from "react";
import { PokemonCard as PokemonCardType } from '@/types/pokemon';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSound } from '@/hooks/useSound';
import ParticleEffect from '@/components/ParticleEffect';

interface BattleLog {
  attacker: string;
  defender: string;
  damage: number;
  critical: boolean;
  attackerRoll: number;
  defenderRoll: number;
}

// Compact Dice Component
const DiceFace = ({ value, color, size = 'normal' }: { value: number; color: 'red' | 'blue'; size?: 'normal' | 'small' }) => {
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
    ? 'bg-gradient-to-br from-red-500 to-red-700 border-red-300'
    : 'bg-gradient-to-br from-blue-500 to-blue-700 border-blue-300';

  const sizeClasses = size === 'small' ? 'w-12 h-12' : 'w-14 h-14 md:w-16 md:h-16';
  const dotSize = size === 'small' ? 'w-1.5 h-1.5' : 'w-2 h-2';

  return (
    <div className={`relative ${sizeClasses} rounded-lg ${colorClasses} border-2 shadow-lg`}>
      {positions.map((pos, idx) => {
        const positionClasses: Record<string, string> = {
          'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
          'top-left': 'top-1.5 left-1.5',
          'top-right': 'top-1.5 right-1.5',
          'middle-left': 'top-1/2 left-1.5 -translate-y-1/2',
          'middle-right': 'top-1/2 right-1.5 -translate-y-1/2',
          'bottom-left': 'bottom-1.5 left-1.5',
          'bottom-right': 'bottom-1.5 right-1.5',
        };
        return (
          <div
            key={idx}
            className={`absolute ${dotSize} bg-white rounded-full ${positionClasses[pos]}`}
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
  const [lastAction, setLastAction] = useState<BattleLog | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [particleType, setParticleType] = useState<'fire' | 'water' | 'electric' | 'grass' | 'psychic' | 'impact'>('impact');
  const [screenShake, setScreenShake] = useState(false);

  const [player1Dice, setPlayer1Dice] = useState<number>(1);
  const [player2Dice, setPlayer2Dice] = useState<number>(1);
  const [isRolling, setIsRolling] = useState(false);

  const router = useRouter();
  const { playAttack, playCriticalHit, playVictory, playDefeat } = useSound();

  useEffect(() => {
    const savedCards = localStorage.getItem('battleCards');
    if (savedCards) {
      const cards = JSON.parse(savedCards);
      setBattleCards(cards);
      setPlayer1Card({ ...cards[0] });
      setPlayer2Card({ ...cards[1] });
      setTimeout(() => setBattlePhase('fighting'), 800);
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
      Fighting: ['Normal', 'Rock', 'Steel', 'Ice', 'Dark'],
      Ground: ['Fire', 'Electric', 'Poison', 'Rock', 'Steel'],
      Flying: ['Grass', 'Fighting', 'Bug'],
      Rock: ['Fire', 'Ice', 'Flying', 'Bug'],
      Ghost: ['Psychic', 'Ghost'],
      Dragon: ['Dragon'],
      Dark: ['Psychic', 'Ghost'],
      Steel: ['Ice', 'Rock', 'Fairy'],
      Fairy: ['Fighting', 'Dragon', 'Dark']
    };

    for (const attackType of attackerTypes) {
      for (const defenderType of defenderTypes) {
        if (effectiveness[attackType]?.includes(defenderType)) return 1.25;
        if (effectiveness[defenderType]?.includes(attackType)) return 0.8;
      }
    }
    return 1.0;
  };

  const performAction = async () => {
    if (!player1Card || !player2Card || isAnimating || battlePhase !== 'fighting') return;

    setIsAnimating(true);
    setIsRolling(true);

    let rollCount = 0;
    const rollInterval = setInterval(() => {
      setPlayer1Dice(rollDice());
      setPlayer2Dice(rollDice());
      rollCount++;

      if (rollCount >= 10) {
        clearInterval(rollInterval);
        const finalP1 = rollDice();
        const finalP2 = rollDice();
        setPlayer1Dice(finalP1);
        setPlayer2Dice(finalP2);
        setIsRolling(false);
        setTimeout(() => processBattle(finalP1, finalP2), 300);
      }
    }, 60);
  };

  const processBattle = (p1Roll: number, p2Roll: number) => {
    const isP1Turn = currentTurn === 'player1';
    const attacker = isP1Turn ? player1Card : player2Card;
    const defender = isP1Turn ? player2Card : player1Card;
    const attackerRoll = isP1Turn ? p1Roll : p2Roll;
    const defenderRoll = isP1Turn ? p2Roll : p1Roll;

    if (!attacker || !defender) return;

    const baseDamage = Math.floor(attacker.specialMove.damage * 0.2);
    const attackBonus = attackerRoll * 5;
    const defenseReduction = defenderRoll * 3;
    const isCritical = attackerRoll === 6;
    const typeMultiplier = getTypeEffectiveness(attacker.types, defender.types);

    let rawDamage = baseDamage + attackBonus - defenseReduction;
    rawDamage = Math.floor(rawDamage * typeMultiplier);
    if (isCritical) rawDamage = Math.floor(rawDamage * 1.5);

    const minDamage = Math.floor(defender.maxHp * 0.15);
    const maxDamage = Math.floor(defender.maxHp * 0.50);
    const finalDamage = Math.max(minDamage, Math.min(maxDamage, Math.max(1, rawDamage)));
    const newHP = Math.max(0, defender.hp - finalDamage);

    setLastAction({
      attacker: attacker.name,
      defender: defender.name,
      damage: finalDamage,
      critical: isCritical,
      attackerRoll,
      defenderRoll,
    });

    const primaryType = attacker.types[0];
    playAttack(primaryType);

    const typeMap: Record<string, 'fire' | 'water' | 'electric' | 'grass' | 'psychic' | 'impact'> = {
      Fire: 'fire', Water: 'water', Electric: 'electric', Grass: 'grass', Psychic: 'psychic'
    };
    setParticleType(typeMap[primaryType] || 'impact');
    setShowParticles(true);

    if (isCritical) {
      setTimeout(() => playCriticalHit(), 100);
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 300);
    }

    if (isP1Turn) {
      setPlayer2Card(prev => prev ? { ...prev, hp: newHP } : null);
    } else {
      setPlayer1Card(prev => prev ? { ...prev, hp: newHP } : null);
    }

    setTimeout(() => {
      if (newHP <= 0) {
        setWinner(currentTurn);
        setBattlePhase('finished');
        setTimeout(() => {
          playVictory();
          setTimeout(() => playDefeat(), 300);
        }, 150);
      } else {
        setCurrentTurn(isP1Turn ? 'player2' : 'player1');
      }
      setIsAnimating(false);
    }, 600);
  };

  const updatePokemonStats = () => {
    if (!winner || !battleCards.length) return;
    const winnerCard = winner === 'player1' ? battleCards[0] : battleCards[1];
    const loserCard = winner === 'player1' ? battleCards[1] : battleCards[0];

    const existingStats = localStorage.getItem('pokemonStats');
    let allPokemonStats: Record<number, {wins: number, losses: number}> = {};
    if (existingStats) {
      try { allPokemonStats = JSON.parse(existingStats); } catch { /* ignore */ }
    }

    if (!allPokemonStats[winnerCard.id]) allPokemonStats[winnerCard.id] = { wins: 0, losses: 0 };
    if (!allPokemonStats[loserCard.id]) allPokemonStats[loserCard.id] = { wins: 0, losses: 0 };

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
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-white">Loading...</div>
      </div>
    );
  }

  const hpPercent = (hp: number, max: number) => (hp / max) * 100;
  const hpColor = (hp: number, max: number) => {
    const pct = hp / max;
    if (pct > 0.6) return 'bg-green-500';
    if (pct > 0.3) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div
      className={`h-screen w-screen overflow-hidden flex flex-col ${screenShake ? 'animate-pulse' : ''}`}
      style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}
    >
      {/* Header - Turn indicator */}
      <div className="flex-none p-2 text-center">
        <h1 className="text-lg md:text-2xl font-bold text-white">
          {battlePhase === 'finished' ? (
            <span className="text-yellow-400">
              🏆 {winner === 'player1' ? player1Card.name : player2Card.name} Wins!
            </span>
          ) : (
            <span className={currentTurn === 'player1' ? 'text-red-400' : 'text-blue-400'}>
              {currentTurn === 'player1' ? player1Card.name : player2Card.name}&apos;s Turn
            </span>
          )}
        </h1>
      </div>

      {/* Main Battle Area */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-8 px-2 min-h-0">

        {/* Player 1 */}
        <div className={`flex flex-row md:flex-col items-center gap-2 md:gap-3 ${winner === 'player2' ? 'opacity-40' : ''}`}>
          {/* Card */}
          <div className={`bg-white rounded-lg p-2 shadow-lg border-4 ${currentTurn === 'player1' && battlePhase === 'fighting' ? 'border-yellow-400' : 'border-red-500'}`}>
            <div className="text-center">
              <span className="text-xs font-bold text-red-600">P1</span>
              <h3 className="font-bold text-sm md:text-base text-gray-800 truncate max-w-[80px] md:max-w-[100px]">{player1Card.name}</h3>
            </div>
            <Image
              src={player1Card.image}
              alt={player1Card.name}
              width={70}
              height={70}
              className="mx-auto pixelated md:w-[90px] md:h-[90px]"
            />
            <div className="mt-1">
              <div className="bg-gray-300 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${hpColor(player1Card.hp, player1Card.maxHp)}`}
                  style={{ width: `${hpPercent(player1Card.hp, player1Card.maxHp)}%` }}
                />
              </div>
              <div className="text-center text-xs font-bold">{player1Card.hp}/{player1Card.maxHp}</div>
            </div>
          </div>

          {/* Dice */}
          <div className="flex flex-col items-center">
            <div className={isRolling ? 'animate-bounce' : ''}>
              <DiceFace value={player1Dice} color="red" size="small" />
            </div>
            <span className="text-lg font-bold text-red-400">{player1Dice}</span>
          </div>
        </div>

        {/* Center - VS & Button */}
        <div className="flex flex-col items-center gap-2">
          <div className="text-2xl md:text-4xl font-bold text-yellow-400">VS</div>

          {battlePhase === 'fighting' && (
            <button
              onClick={performAction}
              disabled={isAnimating}
              className={`px-6 py-3 md:px-8 md:py-4 text-base md:text-lg font-bold rounded-xl shadow-lg transition-all ${
                isAnimating
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:scale-105 active:scale-95'
              } text-white border-2 border-yellow-300`}
            >
              {isRolling ? '🎲...' : '⚔️ ATTACK!'}
            </button>
          )}

          {battlePhase === 'finished' && (
            <button
              onClick={returnToSelection}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg"
            >
              Play Again
            </button>
          )}

          {/* Last Action Display */}
          {lastAction && (
            <div className="bg-gray-800/90 rounded-lg px-3 py-2 text-center max-w-[200px] md:max-w-[280px]">
              <div className="text-white text-xs md:text-sm">
                <span className="text-yellow-400 font-bold">{lastAction.attacker}</span>
                {' → '}
                <span className="text-orange-400 font-bold">{lastAction.damage}</span>
                {' dmg'}
                {lastAction.critical && <span className="text-red-400"> ⚡CRIT!</span>}
              </div>
              <div className="text-gray-400 text-xs">
                🎲 {lastAction.attackerRoll} vs 🛡️ {lastAction.defenderRoll}
              </div>
            </div>
          )}
        </div>

        {/* Player 2 */}
        <div className={`flex flex-row-reverse md:flex-col items-center gap-2 md:gap-3 ${winner === 'player1' ? 'opacity-40' : ''}`}>
          {/* Card */}
          <div className={`bg-white rounded-lg p-2 shadow-lg border-4 ${currentTurn === 'player2' && battlePhase === 'fighting' ? 'border-yellow-400' : 'border-blue-500'}`}>
            <div className="text-center">
              <span className="text-xs font-bold text-blue-600">P2</span>
              <h3 className="font-bold text-sm md:text-base text-gray-800 truncate max-w-[80px] md:max-w-[100px]">{player2Card.name}</h3>
            </div>
            <Image
              src={player2Card.image}
              alt={player2Card.name}
              width={70}
              height={70}
              className="mx-auto pixelated md:w-[90px] md:h-[90px]"
            />
            <div className="mt-1">
              <div className="bg-gray-300 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${hpColor(player2Card.hp, player2Card.maxHp)}`}
                  style={{ width: `${hpPercent(player2Card.hp, player2Card.maxHp)}%` }}
                />
              </div>
              <div className="text-center text-xs font-bold">{player2Card.hp}/{player2Card.maxHp}</div>
            </div>
          </div>

          {/* Dice */}
          <div className="flex flex-col items-center">
            <div className={isRolling ? 'animate-bounce' : ''}>
              <DiceFace value={player2Dice} color="blue" size="small" />
            </div>
            <span className="text-lg font-bold text-blue-400">{player2Dice}</span>
          </div>
        </div>
      </div>

      {/* Particle Effects */}
      <ParticleEffect
        type={particleType}
        isActive={showParticles}
        onComplete={() => setShowParticles(false)}
        x={typeof window !== 'undefined' ? window.innerWidth / 2 : 200}
        y={typeof window !== 'undefined' ? window.innerHeight / 2 : 200}
      />

      {/* Tip at bottom */}
      <div className="flex-none p-2 text-center">
        <p className="text-gray-500 text-xs">Higher roll = More damage • Roll 6 = Critical Hit</p>
      </div>
    </div>
  );
}
