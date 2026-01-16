'use client';

import { useState, useEffect, useRef } from "react";
import { PokemonCard as PokemonCardType } from '@/types/pokemon';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSound } from '@/hooks/useSound';
import ParticleEffect from '@/components/ParticleEffect';

interface BattleLog {
  id: number;
  attacker: string;
  damage: number;
  critical: boolean;
  roll: number;
}

// Clickable Dice
const Dice = ({ value, color, rolling, canClick, onClick }: {
  value: number; color: 'red' | 'blue'; rolling: boolean; canClick: boolean; onClick: () => void
}) => {
  const dots: Record<number, string[]> = {
    1: ['center'],
    2: ['top-right', 'bottom-left'],
    3: ['top-right', 'center', 'bottom-left'],
    4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
    5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
    6: ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right'],
  };
  const pos: Record<string, string> = {
    'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    'top-left': 'top-1 left-1', 'top-right': 'top-1 right-1',
    'middle-left': 'top-1/2 left-1 -translate-y-1/2', 'middle-right': 'top-1/2 right-1 -translate-y-1/2',
    'bottom-left': 'bottom-1 left-1', 'bottom-right': 'bottom-1 right-1',
  };
  const bg = color === 'red' ? 'from-red-600 to-red-800' : 'from-blue-600 to-blue-800';

  return (
    <div
      onClick={canClick ? onClick : undefined}
      className={`relative w-12 h-12 rounded-lg bg-gradient-to-br ${bg} border-2 shadow-xl transition-all duration-200 ${
        rolling ? 'animate-spin' : ''
      } ${canClick ? 'cursor-pointer hover:scale-110 border-yellow-400 ring-2 ring-yellow-400/50 animate-pulse' : 'border-white/30'}`}
    >
      {(dots[value] || []).map((p, i) => (
        <div key={i} className={`absolute w-2 h-2 bg-white rounded-full ${pos[p]}`} />
      ))}
    </div>
  );
};

// Playing Card sized Pokemon Card
const PlayerCard = ({ card, isActive, isLoser }: { card: PokemonCardType; isActive: boolean; isLoser: boolean }) => {
  const hpPct = (card.hp / card.maxHp) * 100;
  const hpColor = hpPct > 60 ? 'bg-green-500' : hpPct > 30 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className={`relative w-[140px] h-[196px] md:w-[180px] md:h-[252px] rounded-xl overflow-hidden shadow-2xl transition-all duration-300 ${
      isActive ? 'ring-4 ring-yellow-400 scale-105' : ''
    } ${isLoser ? 'opacity-40 grayscale' : ''}`}
    style={{
      background: 'linear-gradient(145deg, #2a2a4a 0%, #1a1a2e 100%)',
      border: '3px solid #4a4a6a'
    }}>
      {/* Card inner border */}
      <div className="absolute inset-1 rounded-lg border border-yellow-600/30" />

      {/* Pokemon image area */}
      <div className="relative h-[55%] flex items-center justify-center overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at center, #3a3a5a 0%, #1a1a2e 100%)' }}>
        <Image
          src={card.image}
          alt={card.name}
          width={100}
          height={100}
          className="pixelated drop-shadow-lg md:w-[130px] md:h-[130px]"
        />
      </div>

      {/* Card info */}
      <div className="p-2 space-y-1">
        <h3 className="font-bold text-sm md:text-base text-white text-center truncate">{card.name}</h3>

        {/* HP Bar */}
        <div className="relative h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
          <div className={`h-full ${hpColor} transition-all duration-500`} style={{ width: `${hpPct}%` }} />
          <span className="absolute inset-0 flex items-center justify-center text-[10px] md:text-xs font-bold text-white drop-shadow">
            {card.hp} / {card.maxHp}
          </span>
        </div>

        {/* Types */}
        <div className="flex justify-center gap-1">
          {card.types.slice(0, 2).map(type => (
            <span key={type} className="text-[8px] md:text-[10px] px-1.5 py-0.5 rounded bg-gray-700 text-gray-300 uppercase">
              {type}
            </span>
          ))}
        </div>
      </div>
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

  const [player1Dice, setPlayer1Dice] = useState<number>(1);
  const [player2Dice, setPlayer2Dice] = useState<number>(1);
  const [isRolling, setIsRolling] = useState(false);
  const logIdRef = useRef(0);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const { playAttack, playCriticalHit, playVictory, playDefeat } = useSound();

  useEffect(() => {
    const savedCards = localStorage.getItem('battleCards');
    if (savedCards) {
      const cards = JSON.parse(savedCards);
      setBattleCards(cards);
      setPlayer1Card({ ...cards[0] });
      setPlayer2Card({ ...cards[1] });
      setTimeout(() => setBattlePhase('fighting'), 500);
    } else {
      router.push('/');
    }
  }, [router]);

  useEffect(() => {
    if (winner && battlePhase === 'finished') {
      updatePokemonStats();
    }
  }, [winner, battlePhase, battleCards]);

  // Auto-scroll battle log
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [battleLog]);

  const rollDice = () => Math.floor(Math.random() * 6) + 1;

  const getTypeEffectiveness = (attackerTypes: string[], defenderTypes: string[]) => {
    const eff: Record<string, string[]> = {
      Fire: ['Grass', 'Bug', 'Steel', 'Ice'], Water: ['Fire', 'Ground', 'Rock'],
      Grass: ['Water', 'Ground', 'Rock'], Electric: ['Water', 'Flying'],
      Psychic: ['Fighting', 'Poison'], Fighting: ['Normal', 'Rock', 'Steel', 'Ice', 'Dark'],
      Ground: ['Fire', 'Electric', 'Poison', 'Rock', 'Steel'], Flying: ['Grass', 'Fighting', 'Bug'],
      Rock: ['Fire', 'Ice', 'Flying', 'Bug'], Ghost: ['Psychic', 'Ghost'],
      Dragon: ['Dragon'], Dark: ['Psychic', 'Ghost'], Steel: ['Ice', 'Rock', 'Fairy'],
      Fairy: ['Fighting', 'Dragon', 'Dark']
    };
    for (const at of attackerTypes) {
      for (const dt of defenderTypes) {
        if (eff[at]?.includes(dt)) return 1.25;
        if (eff[dt]?.includes(at)) return 0.8;
      }
    }
    return 1.0;
  };

  const handleBattleClick = () => {
    if (!player1Card || !player2Card || isAnimating || battlePhase !== 'fighting') return;

    setIsAnimating(true);
    setIsRolling(true);

    let count = 0;
    const interval = setInterval(() => {
      setPlayer1Dice(rollDice());
      setPlayer2Dice(rollDice());
      count++;
      if (count >= 8) {
        clearInterval(interval);
        const p1 = rollDice(), p2 = rollDice();
        setPlayer1Dice(p1);
        setPlayer2Dice(p2);
        setIsRolling(false);
        setTimeout(() => processBattle(p1, p2), 250);
      }
    }, 50);
  };

  const processBattle = (p1Roll: number, p2Roll: number) => {
    const isP1 = currentTurn === 'player1';
    const attacker = isP1 ? player1Card : player2Card;
    const defender = isP1 ? player2Card : player1Card;
    const atkRoll = isP1 ? p1Roll : p2Roll;
    const defRoll = isP1 ? p2Roll : p1Roll;

    if (!attacker || !defender) return;

    const base = Math.floor(attacker.specialMove.damage * 0.2);
    const bonus = atkRoll * 5 - defRoll * 3;
    const crit = atkRoll === 6;
    const typeMult = getTypeEffectiveness(attacker.types, defender.types);

    let dmg = Math.floor((base + bonus) * typeMult);
    if (crit) dmg = Math.floor(dmg * 1.5);
    dmg = Math.max(Math.floor(defender.maxHp * 0.15), Math.min(Math.floor(defender.maxHp * 0.5), Math.max(1, dmg)));

    const newHP = Math.max(0, defender.hp - dmg);

    logIdRef.current++;
    setBattleLog(prev => [...prev.slice(-6), { id: logIdRef.current, attacker: attacker.name, damage: dmg, critical: crit, roll: atkRoll }]);

    playAttack(attacker.types[0]);
    const typeMap: Record<string, 'fire' | 'water' | 'electric' | 'grass' | 'psychic' | 'impact'> = {
      Fire: 'fire', Water: 'water', Electric: 'electric', Grass: 'grass', Psychic: 'psychic'
    };
    setParticleType(typeMap[attacker.types[0]] || 'impact');
    setShowParticles(true);

    if (crit) setTimeout(() => playCriticalHit(), 80);

    if (isP1) setPlayer2Card(prev => prev ? { ...prev, hp: newHP } : null);
    else setPlayer1Card(prev => prev ? { ...prev, hp: newHP } : null);

    setTimeout(() => {
      if (newHP <= 0) {
        setWinner(currentTurn);
        setBattlePhase('finished');
        setTimeout(() => { playVictory(); setTimeout(() => playDefeat(), 200); }, 100);
      } else {
        setCurrentTurn(isP1 ? 'player2' : 'player1');
      }
      setIsAnimating(false);
    }, 500);
  };

  const updatePokemonStats = () => {
    if (!winner || !battleCards.length) return;
    const winnerCard = winner === 'player1' ? battleCards[0] : battleCards[1];
    const loserCard = winner === 'player1' ? battleCards[1] : battleCards[0];
    const stats = JSON.parse(localStorage.getItem('pokemonStats') || '{}');
    if (!stats[winnerCard.id]) stats[winnerCard.id] = { wins: 0, losses: 0 };
    if (!stats[loserCard.id]) stats[loserCard.id] = { wins: 0, losses: 0 };
    stats[winnerCard.id].wins++;
    stats[loserCard.id].losses++;
    localStorage.setItem('pokemonStats', JSON.stringify(stats));
  };

  if (!player1Card || !player2Card) {
    return <div className="h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div className="h-screen w-screen overflow-hidden relative select-none">
      {/* Animated Battle Background */}
      <div className="absolute inset-0 z-0">
        {/* Sky gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900 via-purple-900 to-slate-900" />

        {/* Animated stars */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 60}%`,
                animationDelay: `${Math.random() * 2}s`,
                opacity: Math.random() * 0.7 + 0.3
              }}
            />
          ))}
        </div>

        {/* Battle arena ground */}
        <div className="absolute bottom-0 left-0 right-0 h-[35%]">
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-900 to-transparent" />
          {/* Grid lines for depth */}
          <svg className="absolute inset-0 w-full h-full opacity-20">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#10b981" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Dramatic light beams */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div className="absolute top-0 left-1/4 w-32 h-full bg-gradient-to-b from-yellow-400/20 to-transparent transform -skew-x-12" />
          <div className="absolute top-0 right-1/4 w-32 h-full bg-gradient-to-b from-purple-400/20 to-transparent transform skew-x-12" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-full flex">

        {/* Battle Area - Left/Center */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-end gap-4 md:gap-12">

            {/* Player 1 */}
            <div className="flex flex-col items-center gap-2">
              <Dice
                value={player1Dice}
                color="red"
                rolling={isRolling}
                canClick={currentTurn === 'player1' && battlePhase === 'fighting' && !isAnimating}
                onClick={handleBattleClick}
              />
              <PlayerCard card={player1Card} isActive={currentTurn === 'player1' && battlePhase === 'fighting'} isLoser={winner === 'player2'} />
              <span className="text-red-400 font-bold text-sm">P1</span>
            </div>

            {/* VS */}
            <div className="flex flex-col items-center mb-20">
              {battlePhase === 'fighting' && (
                <div className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 drop-shadow-lg animate-pulse">
                  VS
                </div>
              )}
              {battlePhase === 'finished' && (
                <div className="text-center">
                  <div className="text-2xl md:text-4xl font-black text-yellow-400 mb-2">
                    🏆 {winner === 'player1' ? player1Card.name : player2Card.name}
                  </div>
                  <div className="text-lg text-yellow-300">WINS!</div>
                  <button
                    onClick={(e) => { e.stopPropagation(); localStorage.removeItem('battleCards'); window.location.href = '/'; }}
                    className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg"
                  >
                    Play Again
                  </button>
                </div>
              )}
            </div>

            {/* Player 2 */}
            <div className="flex flex-col items-center gap-2">
              <Dice
                value={player2Dice}
                color="blue"
                rolling={isRolling}
                canClick={currentTurn === 'player2' && battlePhase === 'fighting' && !isAnimating}
                onClick={handleBattleClick}
              />
              <PlayerCard card={player2Card} isActive={currentTurn === 'player2' && battlePhase === 'fighting'} isLoser={winner === 'player1'} />
              <span className="text-blue-400 font-bold text-sm">P2</span>
            </div>
          </div>
        </div>

        {/* Battle Log - Right Side */}
        <div className="w-48 md:w-64 h-full flex flex-col justify-end pb-8 pr-2">
          <div ref={logContainerRef} className="space-y-2 max-h-[60vh] overflow-y-auto scrollbar-hide">
            {battleLog.map((log, idx) => (
              <div
                key={log.id}
                className={`bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 border-l-4 ${
                  log.critical ? 'border-red-500' : 'border-yellow-500'
                } transform transition-all duration-300 animate-slide-in`}
                style={{ opacity: 1 - (battleLog.length - 1 - idx) * 0.15 }}
              >
                <div className="text-white text-sm font-bold">{log.attacker}</div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-orange-400 font-bold">{log.damage} DMG</span>
                  <span className="text-gray-400">🎲{log.roll}</span>
                  {log.critical && <span className="text-red-400 font-bold">⚡CRIT</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tap hint */}
      {battlePhase === 'fighting' && !isAnimating && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
          {currentTurn === 'player1' ? '← Click RED dice to roll' : 'Click BLUE dice to roll →'}
        </div>
      )}

      {/* Turn indicator */}
      {battlePhase === 'fighting' && (
        <div className={`absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full font-bold ${
          currentTurn === 'player1' ? 'bg-red-600' : 'bg-blue-600'
        } text-white shadow-lg`}>
          {currentTurn === 'player1' ? player1Card.name : player2Card.name}&apos;s Turn
        </div>
      )}

      {/* Particles */}
      <ParticleEffect
        type={particleType}
        isActive={showParticles}
        onComplete={() => setShowParticles(false)}
        x={typeof window !== 'undefined' ? window.innerWidth / 2 : 200}
        y={typeof window !== 'undefined' ? window.innerHeight / 2 : 200}
      />

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}
