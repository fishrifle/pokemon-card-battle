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

// Type color mappings
const typeColors: Record<string, { bg: string; border: string; glow: string }> = {
  Fire: { bg: 'from-orange-600 via-red-600 to-orange-700', border: '#f97316', glow: 'shadow-orange-500/50' },
  Water: { bg: 'from-blue-500 via-blue-600 to-cyan-600', border: '#3b82f6', glow: 'shadow-blue-500/50' },
  Grass: { bg: 'from-green-500 via-emerald-600 to-green-700', border: '#22c55e', glow: 'shadow-green-500/50' },
  Electric: { bg: 'from-yellow-400 via-yellow-500 to-amber-500', border: '#eab308', glow: 'shadow-yellow-400/50' },
  Psychic: { bg: 'from-pink-500 via-purple-500 to-fuchsia-600', border: '#d946ef', glow: 'shadow-purple-500/50' },
  Fighting: { bg: 'from-orange-700 via-red-700 to-amber-800', border: '#c2410c', glow: 'shadow-orange-600/50' },
  Rock: { bg: 'from-stone-500 via-amber-700 to-stone-600', border: '#a8a29e', glow: 'shadow-stone-500/50' },
  Ground: { bg: 'from-amber-600 via-yellow-700 to-orange-800', border: '#d97706', glow: 'shadow-amber-500/50' },
  Flying: { bg: 'from-sky-400 via-indigo-400 to-blue-500', border: '#7dd3fc', glow: 'shadow-sky-400/50' },
  Bug: { bg: 'from-lime-500 via-green-600 to-lime-700', border: '#84cc16', glow: 'shadow-lime-500/50' },
  Poison: { bg: 'from-purple-600 via-violet-700 to-purple-800', border: '#9333ea', glow: 'shadow-purple-600/50' },
  Ghost: { bg: 'from-purple-800 via-indigo-900 to-slate-900', border: '#6b21a8', glow: 'shadow-purple-800/50' },
  Dragon: { bg: 'from-indigo-600 via-purple-700 to-blue-800', border: '#4f46e5', glow: 'shadow-indigo-500/50' },
  Ice: { bg: 'from-cyan-300 via-sky-400 to-blue-400', border: '#67e8f9', glow: 'shadow-cyan-400/50' },
  Steel: { bg: 'from-slate-400 via-gray-500 to-zinc-500', border: '#94a3b8', glow: 'shadow-slate-400/50' },
  Dark: { bg: 'from-gray-800 via-slate-900 to-black', border: '#374151', glow: 'shadow-gray-700/50' },
  Fairy: { bg: 'from-pink-400 via-rose-400 to-pink-500', border: '#f472b6', glow: 'shadow-pink-400/50' },
  Normal: { bg: 'from-gray-400 via-stone-500 to-gray-500', border: '#9ca3af', glow: 'shadow-gray-400/50' },
};

// Rarity border effects
const rarityStyles: Record<string, string> = {
  common: 'border-2',
  uncommon: 'border-2 shadow-lg',
  rare: 'border-3 shadow-xl',
  legendary: 'border-4 shadow-2xl',
};

// Playing Card sized Pokemon Card with type colors and rarity effects
const PlayerCard = ({ card, isActive, isLoser }: { card: PokemonCardType; isActive: boolean; isLoser: boolean }) => {
  const hpPct = (card.hp / card.maxHp) * 100;
  const hpColor = hpPct > 60 ? 'bg-green-500' : hpPct > 30 ? 'bg-yellow-500' : 'bg-red-500';

  const primaryType = card.types[0] || 'Normal';
  const colors = typeColors[primaryType] || typeColors.Normal;
  const rarityClass = rarityStyles[card.rarity] || rarityStyles.common;
  const isLegendary = card.rarity === 'legendary';
  const isRare = card.rarity === 'rare' || isLegendary;

  return (
    <div className={`relative w-[140px] h-[196px] md:w-[180px] md:h-[252px] rounded-xl overflow-hidden transition-all duration-300 ${rarityClass} ${colors.glow} ${
      isActive ? 'ring-4 ring-yellow-400 scale-105' : ''
    } ${isLoser ? 'opacity-40 grayscale' : ''} ${isLegendary ? 'animate-legendary-glow' : ''}`}
    style={{
      borderColor: colors.border,
      boxShadow: isRare ? `0 0 20px ${colors.border}40, 0 0 40px ${colors.border}20` : undefined
    }}>
      {/* Card background gradient based on type */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg}`} />

      {/* Holographic overlay for rare/legendary */}
      {isRare && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10 animate-shimmer" />
      )}
      {isLegendary && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-holo-sweep" />
        </div>
      )}

      {/* Inner border glow */}
      <div className="absolute inset-1 rounded-lg border border-white/20" />

      {/* Pokemon image area - NOW 75% of card */}
      <div className="relative h-[75%] flex items-end justify-center overflow-hidden pb-2">
        {/* Radial glow behind Pokemon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full bg-white/20 blur-xl`} />
        </div>

        {/* Pokemon name at top */}
        <div className="absolute top-1 left-0 right-0 z-10">
          <h3 className="font-bold text-sm md:text-base text-white text-center truncate drop-shadow-lg px-2"
              style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
            {card.name}
          </h3>
        </div>

        {/* Bigger Pokemon image */}
        <Image
          src={card.image}
          alt={card.name}
          width={120}
          height={120}
          className="pixelated drop-shadow-2xl md:w-[150px] md:h-[150px] relative z-10"
          style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }}
        />

        {/* HP Bar overlaid at bottom of image area */}
        <div className="absolute bottom-0 left-2 right-2 z-20">
          <div className="relative h-5 bg-black/60 rounded-full overflow-hidden border-2 border-white/30 backdrop-blur-sm">
            <div className={`h-full ${hpColor} transition-all duration-500`} style={{ width: `${hpPct}%` }} />
            <span className="absolute inset-0 flex items-center justify-center text-[10px] md:text-xs font-bold text-white drop-shadow-lg">
              {card.hp} / {card.maxHp} HP
            </span>
          </div>
        </div>
      </div>

      {/* Card footer with types and rarity */}
      <div className="relative h-[25%] bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center gap-1 px-2">
        {/* Types */}
        <div className="flex justify-center gap-1">
          {card.types.slice(0, 2).map(type => {
            const typeColor = typeColors[type] || typeColors.Normal;
            return (
              <span key={type}
                className="text-[9px] md:text-[11px] px-2 py-0.5 rounded-full font-bold uppercase text-white"
                style={{
                  background: `linear-gradient(135deg, ${typeColor.border}, ${typeColor.border}99)`,
                  boxShadow: `0 2px 4px ${typeColor.border}40`
                }}>
                {type}
              </span>
            );
          })}
        </div>

        {/* Rarity indicator */}
        <div className="flex items-center gap-0.5">
          {card.rarity === 'legendary' && <span className="text-yellow-400 text-xs">&#9733;&#9733;&#9733;</span>}
          {card.rarity === 'rare' && <span className="text-yellow-400 text-xs">&#9733;&#9733;</span>}
          {card.rarity === 'uncommon' && <span className="text-gray-300 text-xs">&#9733;</span>}
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
      {/* Epic Battle Arena Background */}
      <div className="absolute inset-0 z-0">
        {/* Dark dramatic sky */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-indigo-950 to-purple-950" />

        {/* Animated energy waves */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%]">
            <div className="absolute inset-0 border-2 border-purple-500/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
            <div className="absolute inset-[10%] border-2 border-blue-500/20 rounded-full animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }} />
            <div className="absolute inset-[20%] border-2 border-cyan-500/20 rounded-full animate-ping" style={{ animationDuration: '5s', animationDelay: '2s' }} />
          </div>
        </div>

        {/* Stadium lights / spotlights */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 left-1/4 w-40 h-[120%] bg-gradient-to-b from-yellow-400/30 via-yellow-400/5 to-transparent transform -skew-x-12 animate-pulse" style={{ animationDuration: '2s' }} />
          <div className="absolute -top-20 right-1/4 w-40 h-[120%] bg-gradient-to-b from-orange-400/30 via-orange-400/5 to-transparent transform skew-x-12 animate-pulse" style={{ animationDuration: '2.5s' }} />
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-32 h-[120%] bg-gradient-to-b from-white/20 via-white/5 to-transparent" />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`,
                animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 3}s`,
                opacity: 0.4 + Math.random() * 0.4
              }}
            />
          ))}
        </div>

        {/* Battle arena floor - perspective grid */}
        <div className="absolute bottom-0 left-0 right-0 h-[40%]" style={{ perspective: '500px' }}>
          <div
            className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 via-purple-900/60 to-transparent"
            style={{ transform: 'rotateX(60deg)', transformOrigin: 'bottom' }}
          />
          {/* Neon grid */}
          <svg className="absolute inset-0 w-full h-full" style={{ transform: 'rotateX(60deg)', transformOrigin: 'bottom' }}>
            <defs>
              <pattern id="neonGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="url(#gridGradient)" strokeWidth="1" />
              </pattern>
              <linearGradient id="gridGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#neonGrid)" />
          </svg>
          {/* Center battle circle */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 md:w-64 h-16 md:h-20 border-2 border-cyan-500/50 rounded-full bg-cyan-500/10"
               style={{ transform: 'translateX(-50%) rotateX(60deg)' }} />
        </div>

        {/* Side energy bars */}
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-red-500/50 via-red-600/30 to-red-500/50 animate-pulse" />
        <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-b from-blue-500/50 via-blue-600/30 to-blue-500/50 animate-pulse" />

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-red-500/20 to-transparent" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/20 to-transparent" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-500/20 to-transparent" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-cyan-500/20 to-transparent" />

        {/* Vignette */}
        <div className="absolute inset-0 bg-radial-gradient pointer-events-none"
             style={{ background: 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.6) 100%)' }} />
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
        @keyframes shimmer {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        .animate-shimmer { animation: shimmer 2s ease-in-out infinite; }
        @keyframes holo-sweep {
          0% { transform: translateX(-200%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        .animate-holo-sweep { animation: holo-sweep 3s ease-in-out infinite; }
        @keyframes legendary-glow {
          0%, 100% { filter: drop-shadow(0 0 8px currentColor); }
          50% { filter: drop-shadow(0 0 16px currentColor); }
        }
        .animate-legendary-glow { animation: legendary-glow 2s ease-in-out infinite; }
        @keyframes float {
          0%, 100% { transform: translateY(0px); opacity: 0.4; }
          50% { transform: translateY(-20px); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
