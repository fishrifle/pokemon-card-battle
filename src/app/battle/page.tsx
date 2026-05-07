'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { PokemonCard as PokemonCardType, EnergyType, StatusCondition, TCGAttack } from '@/types/pokemon';
import { useRouter } from 'next/navigation';
import { useSound } from '@/hooks/useSound';
import { ENERGY_CONFIG } from '@/components/EnergyIcon';
import PokemonCard from '@/components/PokemonCard';
import { Arena, ARENAS } from '@/app/page';
import { getPokemonCards } from '@/data/pokemonData';
import { GAME_TYPE_TO_ENERGY } from '@/data/tcgUtils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BattleCard extends PokemonCardType {
  currentHp: number;
  prizesWorth: number;
}

interface LogEntry {
  id: number;
  text: string;
  type: 'attack' | 'status' | 'prize' | 'system' | 'ai';
  color: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cloneCard(c: BattleCard): BattleCard {
  return { ...c, energyAttached: [...c.energyAttached] };
}

function getArenaMultiplier(arena: Arena, attackerTypes: string[]): number {
  if (!arena.modifier) return 1;
  const energyTypes = attackerTypes.map(t => GAME_TYPE_TO_ENERGY[t] || 'Colorless');
  if (energyTypes.includes(arena.modifier.type as EnergyType)) return arena.modifier.bonus;
  if (arena.modifier.penalty && energyTypes.includes(arena.modifier.penalty.type as EnergyType))
    return arena.modifier.penalty.amount;
  return 1;
}

function calcDamage(
  attacker: BattleCard,
  defender: BattleCard,
  attack: TCGAttack,
  arena: Arena
): { damage: number; effectiveness: 'super' | 'weak' | 'normal'; isCrit: boolean } {
  if (attack.damage === 0) return { damage: 0, effectiveness: 'normal', isCrit: false };

  let dmg = attack.damage;

  // Weakness ×2
  const effectiveness: 'super' | 'weak' | 'normal' = (() => {
    if (defender.weakness) {
      const atkEnergy = GAME_TYPE_TO_ENERGY[attacker.types[0]] || 'Colorless';
      if (atkEnergy === defender.weakness.type || attacker.types[0] === defender.weakness.type) {
        dmg *= defender.weakness.multiplier;
        return 'super';
      }
    }
    if (defender.resistance) {
      const atkEnergy = GAME_TYPE_TO_ENERGY[attacker.types[0]] || 'Colorless';
      if (atkEnergy === defender.resistance.type || attacker.types[0] === defender.resistance.type) {
        dmg -= defender.resistance.reduction;
        return 'weak';
      }
    }
    return 'normal';
  })();

  // Arena modifier
  dmg = Math.floor(dmg * getArenaMultiplier(arena, attacker.types));

  // Coin flip attacks (50% chance to do full damage, 50% for reduced)
  const isCrit = attack.coinFlip ? Math.random() < 0.5 : false;
  if (attack.coinFlip && !isCrit) dmg = Math.max(0, dmg - 30);

  return { damage: Math.max(0, dmg), effectiveness, isCrit };
}

function canUseAttack(card: BattleCard, attack: TCGAttack): boolean {
  if (attack.damage === 0) return card.energyAttached.length >= attack.energyCost.length;
  const energyNeeded: Partial<Record<EnergyType, number>> = {};
  for (const e of attack.energyCost) {
    energyNeeded[e] = (energyNeeded[e] || 0) + 1;
  }
  const energyHave: Partial<Record<EnergyType, number>> = {};
  for (const e of card.energyAttached) {
    energyHave[e] = (energyHave[e] || 0) + 1;
  }
  let colorlessNeeded = energyNeeded['Colorless'] || 0;
  for (const [type, count] of Object.entries(energyNeeded) as [EnergyType, number][]) {
    if (type === 'Colorless') continue;
    const have = energyHave[type] || 0;
    if (have < count) {
      const diff = count - have;
      colorlessNeeded += diff;
    }
  }
  return card.energyAttached.length >= (attack.energyCost.length - (energyNeeded['Colorless'] || 0)) + colorlessNeeded;
}

function applyStatusDamage(card: BattleCard): { card: BattleCard; text: string | null } {
  let updated = cloneCard(card);
  let text: string | null = null;
  if (card.statusCondition === 'poison') {
    updated.currentHp = Math.max(0, updated.currentHp - 10);
    text = `${card.name} is poisoned and took 10 damage!`;
  } else if (card.statusCondition === 'burn') {
    updated.currentHp = Math.max(0, updated.currentHp - 20);
    const healFlip = Math.random() < 0.5;
    if (healFlip) { updated.statusCondition = null; text = `${card.name} is burned (20 dmg) and the burn healed!`; }
    else { text = `${card.name} is burned and took 20 damage!`; }
  } else if (card.statusCondition === 'paralyze') {
    updated.statusCondition = null;
    text = `${card.name}'s paralysis wore off.`;
  } else if (card.statusCondition === 'sleep') {
    const wakeFlip = Math.random() < 0.5;
    if (wakeFlip) { updated.statusCondition = null; text = `${card.name} woke up!`; }
    else { text = `${card.name} is asleep.`; }
  }
  return { card: updated, text };
}

function toBattleCard(card: PokemonCardType): BattleCard {
  return {
    ...card,
    energyAttached: [],
    statusCondition: null,
    currentHp: card.maxHp,
    prizesWorth: card.rarity === 'legendary' ? 2 : 1,
  };
}

function pickAIAttack(ai: BattleCard, player: BattleCard): number {
  const available = ai.attacks
    .map((atk, i) => ({ atk, i }))
    .filter(({ atk }) => canUseAttack(ai, atk));
  if (available.length === 0) return -1;
  // prefer highest damage
  available.sort((a, b) => {
    const scoreB = b.atk.damage * (player.weakness?.type === (GAME_TYPE_TO_ENERGY[ai.types[0]] || '') ? 2 : 1);
    const scoreA = a.atk.damage * (player.weakness?.type === (GAME_TYPE_TO_ENERGY[ai.types[0]] || '') ? 2 : 1);
    return scoreB - scoreA;
  });
  return available[0].i;
}

// ─── Component ────────────────────────────────────────────────────────────────

const STATUS_ICONS: Record<string, string> = {
  poison: '☠', burn: '🔥', paralyze: '⚡', sleep: '💤', confuse: '😵',
};

export default function BattlePage() {
  const router = useRouter();
  const { playAttack, playCriticalHit, playVictory, playDefeat } = useSound();

  const [arena, setArena] = useState<Arena>(ARENAS[0]);
  const [playerActive, setPlayerActive] = useState<BattleCard | null>(null);
  const [playerBench, setPlayerBench] = useState<BattleCard[]>([]);
  const [playerPrizes, setPlayerPrizes] = useState(3);
  const [playerEnergyPlayed, setPlayerEnergyPlayed] = useState(false);
  const [playerAttacked, setPlayerAttacked] = useState(false);
  const [playerCanParalyze, setPlayerCanParalyze] = useState(true);

  const [aiActive, setAiActive] = useState<BattleCard | null>(null);
  const [aiBench, setAiBench] = useState<BattleCard[]>([]);
  const [aiPrizes, setAiPrizes] = useState(3);

  const [currentTurn, setCurrentTurn] = useState<'player' | 'ai'>('player');
  const [phase, setPhase] = useState<'battle' | 'finished'>('battle');
  const [winner, setWinner] = useState<'player' | 'ai' | null>(null);

  const [log, setLog] = useState<LogEntry[]>([]);
  const [animatingAttack, setAnimatingAttack] = useState<'player' | 'ai' | null>(null);
  const [animatingHit, setAnimatingHit] = useState<'player' | 'ai' | null>(null);
  const [floatingDmg, setFloatingDmg] = useState<{ val: number; side: 'player' | 'ai'; crit: boolean } | null>(null);
  const [effectMsg, setEffectMsg] = useState<{ text: string; color: string } | null>(null);
  const [screenShake, setScreenShake] = useState(false);
  const [selectingBench, setSelectingBench] = useState<'retreat' | 'sendUp' | null>(null);
  const [aiThinking, setAiThinking] = useState(false);

  const logIdRef = useRef(0);
  const logEndRef = useRef<HTMLDivElement>(null);
  const aiTurnPendingRef = useRef(false);

  const addLog = useCallback((text: string, type: LogEntry['type'] = 'system', color = 'text-gray-300') => {
    logIdRef.current++;
    setLog(prev => [...prev.slice(-20), { id: logIdRef.current, text, type, color }]);
  }, []);

  // ── Setup ──
  useEffect(() => {
    const savedCards = localStorage.getItem('battleCards');
    const savedArena = localStorage.getItem('selectedArena');
    if (!savedCards) { router.push('/'); return; }

    const playerCards: PokemonCardType[] = JSON.parse(savedCards);
    if (savedArena) setArena(JSON.parse(savedArena));

    setPlayerActive(toBattleCard(playerCards[0]));
    setPlayerBench(playerCards.slice(1).map(toBattleCard));

    // AI gets random Pokemon from pool
    const allCards = getPokemonCards();
    const shuffled = [...allCards].sort(() => Math.random() - 0.5);
    const aiTeam = shuffled.slice(0, 3);
    setAiActive(toBattleCard(aiTeam[0]));
    setAiBench(aiTeam.slice(1).map(toBattleCard));

    addLog('Battle started! Player goes first.', 'system', 'text-yellow-400');
  }, [router, addLog]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log]);

  // ── Save stats on finish ──
  useEffect(() => {
    if (phase === 'finished' && winner) {
      if (winner === 'player') playVictory(); else playDefeat();
      const stats = JSON.parse(localStorage.getItem('pokemonStats') || '{}');
      const savedCards: PokemonCardType[] = JSON.parse(localStorage.getItem('battleCards') || '[]');
      savedCards.forEach(c => {
        if (!stats[c.id]) stats[c.id] = { wins: 0, losses: 0 };
        if (winner === 'player') stats[c.id].wins++; else stats[c.id].losses++;
      });
      localStorage.setItem('pokemonStats', JSON.stringify(stats));
    }
  }, [phase, winner, playVictory, playDefeat]);

  // ── AI turn trigger ──
  useEffect(() => {
    if (currentTurn !== 'ai' || phase !== 'battle' || aiTurnPendingRef.current) return;
    aiTurnPendingRef.current = true;
    setAiThinking(true);

    setTimeout(() => {
      setAiThinking(false);
      runAiTurn();
      aiTurnPendingRef.current = false;
    }, 1200);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTurn, phase]);

  // ─── Player actions ───────────────────────────────────────────────────────

  const handleAttachEnergy = () => {
    if (!playerActive || playerEnergyPlayed || currentTurn !== 'player') return;
    const energyToAttach = playerActive.energyType;
    setPlayerActive(prev => prev ? { ...prev, energyAttached: [...prev.energyAttached, energyToAttach] } : prev);
    setPlayerEnergyPlayed(true);
    addLog(`Attached ${energyToAttach} energy to ${playerActive.name}.`, 'system', 'text-cyan-400');
  };

  const handleAttachEnergyToBench = (benchIdx: number) => {
    if (playerEnergyPlayed || currentTurn !== 'player') return;
    setPlayerBench(prev => {
      const updated = [...prev];
      const card = updated[benchIdx];
      updated[benchIdx] = { ...card, energyAttached: [...card.energyAttached, card.energyType] };
      return updated;
    });
    setPlayerEnergyPlayed(true);
    addLog(`Attached energy to bench Pokémon.`, 'system', 'text-cyan-400');
  };

  const handlePlayerAttack = (attackIdx: number) => {
    if (!playerActive || !aiActive || playerAttacked || currentTurn !== 'player' || phase !== 'battle') return;
    const atk = playerActive.attacks[attackIdx];
    if (!canUseAttack(playerActive, atk)) {
      addLog(`Not enough energy to use ${atk.name}!`, 'system', 'text-red-400');
      return;
    }

    // Check can't attack due to status
    if (playerActive.statusCondition === 'paralyze' || playerActive.statusCondition === 'sleep') {
      addLog(`${playerActive.name} can't attack due to ${playerActive.statusCondition}!`, 'status', 'text-orange-400');
      setPlayerAttacked(true);
      return;
    }
    if (playerActive.statusCondition === 'confuse') {
      const confuseHit = Math.random() < 0.5;
      if (!confuseHit) {
        addLog(`${playerActive.name} is confused and hurt itself for 30 damage!`, 'status', 'text-orange-400');
        setPlayerActive(prev => prev ? { ...prev, currentHp: Math.max(0, prev.currentHp - 30) } : prev);
        setPlayerAttacked(true);
        endPlayerTurn();
        return;
      }
    }

    const { damage, effectiveness, isCrit } = calcDamage(playerActive, aiActive, atk, arena);

    playAttack(playerActive.types[0]);
    if (isCrit) playCriticalHit();

    setAnimatingAttack('player');
    setTimeout(() => setAnimatingAttack(null), 400);

    setTimeout(() => {
      setAnimatingHit('ai');
      setScreenShake(true);
      setFloatingDmg({ val: damage, side: 'ai', crit: isCrit });
      if (effectiveness === 'super') setEffectMsg({ text: 'SUPER EFFECTIVE! ×2', color: 'text-green-400' });
      else if (effectiveness === 'weak') setEffectMsg({ text: 'Not very effective... -30', color: 'text-orange-400' });
      setTimeout(() => { setAnimatingHit(null); setScreenShake(false); setFloatingDmg(null); setEffectMsg(null); }, 800);
    }, 250);

    // Apply damage
    const newHp = Math.max(0, aiActive.currentHp - damage);
    const logMsg = `${playerActive.name} used ${atk.name}! ${damage} damage${isCrit ? ' (CRIT!)' : ''}${effectiveness === 'super' ? ' — Super Effective!' : effectiveness === 'weak' ? ' — Not very effective.' : ''}`;;
    addLog(logMsg, 'attack', effectiveness === 'super' ? 'text-green-400' : 'text-white');

    // Apply status effect
    if (atk.statusEffect && !aiActive.statusCondition) {
      const statusRoll = Math.random() < 0.5;
      if (statusRoll) {
        setAiActive(prev => prev ? { ...prev, currentHp: newHp, statusCondition: atk.statusEffect! } : prev);
        addLog(`${aiActive.name} is now ${atk.statusEffect}ed!`, 'status', 'text-purple-400');
      } else {
        setAiActive(prev => prev ? { ...prev, currentHp: newHp } : prev);
      }
    } else {
      setAiActive(prev => prev ? { ...prev, currentHp: newHp } : prev);
    }

    setPlayerAttacked(true);

    // Check KO
    setTimeout(() => {
      if (newHp <= 0) {
        handleKO('player', aiActive);
      } else {
        endPlayerTurn();
      }
    }, 900);
  };

  const handleRetreat = () => {
    if (!playerActive || currentTurn !== 'player' || playerBench.length === 0) return;
    if (playerActive.energyAttached.length < playerActive.retreatCost) {
      addLog(`Need ${playerActive.retreatCost} energy to retreat — only have ${playerActive.energyAttached.length}!`, 'system', 'text-red-400');
      return;
    }
    setSelectingBench('retreat');
  };

  const executRetreat = (benchIdx: number) => {
    if (!playerActive) return;
    // Discard retreat cost energy
    const newEnergy = [...playerActive.energyAttached].slice(playerActive.retreatCost);
    const retreating = { ...playerActive, energyAttached: newEnergy };
    const incoming = { ...playerBench[benchIdx] };
    const newBench = [...playerBench];
    newBench[benchIdx] = retreating;
    setPlayerBench(newBench);
    setPlayerActive(incoming);
    setSelectingBench(null);
    addLog(`${playerActive.name} retreated! ${incoming.name} entered the battle.`, 'system', 'text-cyan-400');
    setPlayerAttacked(true);
    endPlayerTurn();
  };

  const handleSendUpBench = (benchIdx: number) => {
    const incoming = { ...playerBench[benchIdx] };
    const newBench = playerBench.filter((_, i) => i !== benchIdx);
    setPlayerBench(newBench);
    setPlayerActive(incoming);
    setSelectingBench(null);
    addLog(`${incoming.name} was sent up to battle!`, 'system', 'text-yellow-400');
    endPlayerTurn();
  };

  const handlePassTurn = () => {
    addLog('Player passed their turn.', 'system', 'text-gray-400');
    endPlayerTurn();
  };

  const endPlayerTurn = useCallback(() => {
    // Apply status damage at end of player turn
    if (playerActive) {
      const { card, text } = applyStatusDamage(playerActive);
      setPlayerActive(card);
      if (text) addLog(text, 'status', 'text-orange-400');
      if (card.currentHp <= 0) {
        handleKO('ai', card);
        return;
      }
    }
    setCurrentTurn('ai');
    setPlayerEnergyPlayed(false);
    setPlayerAttacked(false);
    setPlayerCanParalyze(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerActive, addLog]);

  // ─── KO handling ─────────────────────────────────────────────────────────

  const handleKO = useCallback((scoringPlayer: 'player' | 'ai', knockedCard: BattleCard) => {
    const prizesEarned = knockedCard.prizesWorth;
    addLog(`${knockedCard.name} was knocked out! ${scoringPlayer === 'player' ? 'Player' : 'AI'} takes ${prizesEarned} prize card${prizesEarned > 1 ? 's' : ''}!`, 'prize', 'text-yellow-400');

    if (scoringPlayer === 'player') {
      const newPrizes = playerPrizes - prizesEarned;
      setPlayerPrizes(newPrizes);
      if (newPrizes <= 0) { setWinner('player'); setPhase('finished'); return; }
      // AI needs to send up bench
      setAiBench(prev => {
        if (prev.length === 0) { setWinner('player'); setPhase('finished'); return prev; }
        const [next, ...rest] = prev;
        setAiActive(next);
        return rest;
      });
    } else {
      const newPrizes = aiPrizes - prizesEarned;
      setAiPrizes(newPrizes);
      if (newPrizes <= 0) { setWinner('ai'); setPhase('finished'); return; }
      // Player needs to send up bench
      if (playerBench.length === 0) { setWinner('ai'); setPhase('finished'); return; }
      setSelectingBench('sendUp');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerPrizes, aiPrizes, playerBench]);

  // ─── AI Turn ─────────────────────────────────────────────────────────────

  const runAiTurn = useCallback(() => {
    setAiActive(currentAi => {
      setPlayerActive(currentPlayer => {
        setAiBench(currentBench => {
          if (!currentAi || !currentPlayer) return currentBench;

          let updatedAi = cloneCard(currentAi);
          let updatedPlayer = cloneCard(currentPlayer);

          // Attach energy
          updatedAi = { ...updatedAi, energyAttached: [...updatedAi.energyAttached, updatedAi.energyType] };
          addLog(`AI attached ${updatedAi.energyType} energy to ${updatedAi.name}.`, 'ai', 'text-blue-300');

          // Status check: can't attack if paralyzed/asleep
          if (updatedAi.statusCondition === 'paralyze' || updatedAi.statusCondition === 'sleep') {
            addLog(`AI's ${updatedAi.name} can't attack!`, 'status', 'text-orange-300');
            if (updatedAi.statusCondition === 'paralyze') updatedAi = { ...updatedAi, statusCondition: null };
            setAiActive(updatedAi);
            setCurrentTurn('player');
            return currentBench;
          }

          // Confusion check
          if (updatedAi.statusCondition === 'confuse') {
            if (Math.random() < 0.5) {
              updatedAi = { ...updatedAi, currentHp: Math.max(0, updatedAi.currentHp - 30) };
              addLog(`AI's ${updatedAi.name} is confused and hurt itself!`, 'status', 'text-orange-300');
              setAiActive(updatedAi);
              setCurrentTurn('player');
              return currentBench;
            }
          }

          // Retreat logic: if very low HP and bench available
          const hpPct = updatedAi.currentHp / updatedAi.maxHp;
          if (hpPct < 0.2 && currentBench.length > 0) {
            const strongest = [...currentBench].sort((a, b) => b.currentHp - a.currentHp)[0];
            const benchIdx = currentBench.findIndex(c => c.id === strongest.id);
            if (updatedAi.energyAttached.length >= updatedAi.retreatCost) {
              const newEnergy = updatedAi.energyAttached.slice(updatedAi.retreatCost);
              const retreating = { ...updatedAi, energyAttached: newEnergy };
              const newBench = [...currentBench];
              newBench[benchIdx] = retreating;
              setAiActive(strongest);
              addLog(`AI retreated ${updatedAi.name} and sent up ${strongest.name}!`, 'ai', 'text-blue-300');
              setCurrentTurn('player');
              return newBench;
            }
          }

          // Pick and use attack
          const atkIdx = pickAIAttack(updatedAi, updatedPlayer);
          if (atkIdx === -1) {
            addLog(`AI's ${updatedAi.name} has no usable attacks. Passing.`, 'ai', 'text-blue-300');
            setAiActive(updatedAi);
            setCurrentTurn('player');
            return currentBench;
          }

          const atk = updatedAi.attacks[atkIdx];
          const { damage, effectiveness, isCrit } = calcDamage(updatedAi, updatedPlayer, atk, arena);

          playAttack(updatedAi.types[0]);
          if (isCrit) playCriticalHit();

          setAnimatingAttack('ai');
          setTimeout(() => setAnimatingAttack(null), 400);
          setTimeout(() => {
            setAnimatingHit('player');
            setScreenShake(true);
            setFloatingDmg({ val: damage, side: 'player', crit: isCrit });
            if (effectiveness === 'super') setEffectMsg({ text: 'SUPER EFFECTIVE! ×2', color: 'text-red-400' });
            else if (effectiveness === 'weak') setEffectMsg({ text: 'Not very effective...', color: 'text-yellow-400' });
            setTimeout(() => { setAnimatingHit(null); setScreenShake(false); setFloatingDmg(null); setEffectMsg(null); }, 800);
          }, 250);

          const newPlayerHp = Math.max(0, updatedPlayer.currentHp - damage);
          addLog(`AI's ${updatedAi.name} used ${atk.name}! ${damage} damage${effectiveness === 'super' ? ' — Super Effective!' : effectiveness === 'weak' ? ' — Not very effective.' : ''}.`, 'ai', 'text-blue-300');

          if (atk.statusEffect && !updatedPlayer.statusCondition && Math.random() < 0.5) {
            updatedPlayer = { ...updatedPlayer, currentHp: newPlayerHp, statusCondition: atk.statusEffect };
            addLog(`Player's ${updatedPlayer.name} is now ${atk.statusEffect}ed!`, 'status', 'text-purple-400');
          } else {
            updatedPlayer = { ...updatedPlayer, currentHp: newPlayerHp };
          }

          // Status damage on AI
          const { card: aiAfterStatus, text: aiStatusText } = applyStatusDamage(updatedAi);
          if (aiStatusText) addLog(aiStatusText, 'status', 'text-orange-300');
          updatedAi = aiAfterStatus;

          setAiActive(updatedAi);
          setPlayerActive(updatedPlayer);

          setTimeout(() => {
            if (newPlayerHp <= 0) {
              handleKO('ai', updatedPlayer);
            } else if (updatedAi.currentHp <= 0) {
              handleKO('player', updatedAi);
            } else {
              setCurrentTurn('player');
            }
          }, 900);

          return currentBench;
        });
        return currentPlayer;
      });
      return currentAi;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arena, addLog, playAttack, playCriticalHit, handleKO]);

  // ─── Derived ──────────────────────────────────────────────────────────────

  const isPlayerTurn = currentTurn === 'player' && phase === 'battle';
  const canAttack0 = playerActive ? canUseAttack(playerActive, playerActive.attacks[0]) : false;
  const canAttack1 = playerActive ? canUseAttack(playerActive, playerActive.attacks[1]) : false;
  const canRetreat = playerActive && playerBench.length > 0 && playerActive.energyAttached.length >= playerActive.retreatCost;

  if (!playerActive || !aiActive) {
    return <div className="h-screen bg-gray-950 flex items-center justify-center text-white text-xl">Loading battle...</div>;
  }

  const playerHpPct = (playerActive.currentHp / playerActive.maxHp) * 100;
  const aiHpPct = (aiActive.currentHp / aiActive.maxHp) * 100;

  return (
    <div className={`h-screen w-screen overflow-hidden select-none flex flex-col ${screenShake ? 'animate-screen-shake' : ''}`}>

      {/* Arena background */}
      <div className={`absolute inset-0 z-0 bg-gradient-to-b ${arena.bg}`}>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.5) 100%)' }} />
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative z-10 flex h-full">

        {/* ── MAIN BATTLE AREA ── */}
        <div className="flex-1 flex flex-col">

          {/* AI SIDE */}
          <div className="flex-1 flex items-start justify-between px-4 pt-3 gap-3">
            {/* AI bench */}
            <div className="flex flex-col gap-1.5">
              <div className="text-white/50 text-[10px] font-bold uppercase tracking-wide">AI Bench</div>
              <div className="flex flex-col gap-2">
                {aiBench.map((card) => (
                  <div key={card.id} className="relative opacity-80">
                    <PokemonCard pokemon={{ ...card, hp: card.currentHp }} size="sm" clickable={false} showEnergy />
                    {card.statusCondition && (
                      <div className="absolute top-0 right-0 text-sm">{STATUS_ICONS[card.statusCondition]}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* AI active + prize display */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="text-[11px] font-bold" style={{ color: arena.accent }}>
                  🤖 AI TRAINER
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i}
                      className="w-4 h-4 rounded-full border"
                      style={{
                        background: i < aiPrizes ? arena.accent : 'transparent',
                        borderColor: arena.accent,
                        opacity: i < aiPrizes ? 1 : 0.3,
                      }}
                    />
                  ))}
                </div>
              </div>

              {aiThinking && (
                <div className="text-yellow-400 text-xs font-bold animate-pulse">AI is thinking...</div>
              )}

              {/* AI Active card */}
              <div className={`relative ${animatingAttack === 'ai' ? 'animate-attack-lunge-right' : ''} ${animatingHit === 'ai' ? 'animate-hit-flash' : ''}`}>
                <PokemonCard pokemon={{ ...aiActive, hp: aiActive.currentHp }} size="lg" clickable={false} showEnergy />
                {aiActive.statusCondition && (
                  <div className="absolute top-1 left-1 text-xl">{STATUS_ICONS[aiActive.statusCondition]}</div>
                )}
              </div>

              {/* AI HP bar */}
              <div className="w-full px-2">
                <div className="h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/20">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${aiHpPct}%`,
                      background: aiHpPct > 60 ? '#22c55e' : aiHpPct > 30 ? '#eab308' : '#ef4444',
                    }}
                  />
                </div>
                <div className="text-center text-white/70 text-[10px] mt-0.5">
                  {aiActive.currentHp} / {aiActive.maxHp} HP
                </div>
              </div>
            </div>

            {/* Battle log */}
            <div className="w-44 flex flex-col gap-1 max-h-[45vh] overflow-y-auto">
              {log.map(entry => (
                <div key={entry.id} className={`text-[9px] ${entry.color} leading-tight py-0.5 border-b border-white/5`}>
                  {entry.text}
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>

          {/* VS divider */}
          <div className="relative flex items-center justify-center py-1">
            <div className="absolute inset-x-0 h-px bg-white/10" />
            <span className="relative px-3 text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 z-10">VS</span>
          </div>

          {/* PLAYER SIDE */}
          <div className="flex-1 flex items-end justify-between px-4 pb-2 gap-3">
            {/* Player active */}
            <div className="flex flex-col items-center gap-2">
              {/* Player HP bar */}
              <div className="w-full px-2">
                <div className="h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/20">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${playerHpPct}%`,
                      background: playerHpPct > 60 ? '#22c55e' : playerHpPct > 30 ? '#eab308' : '#ef4444',
                    }}
                  />
                </div>
                <div className="text-center text-white/70 text-[10px] mt-0.5">
                  {playerActive.currentHp} / {playerActive.maxHp} HP
                </div>
              </div>

              <div className={`relative ${animatingAttack === 'player' ? 'animate-attack-lunge-left' : ''} ${animatingHit === 'player' ? 'animate-hit-flash' : ''}`}>
                <PokemonCard pokemon={{ ...playerActive, hp: playerActive.currentHp }} size="lg" clickable={false} showEnergy />
                {playerActive.statusCondition && (
                  <div className="absolute top-1 left-1 text-xl">{STATUS_ICONS[playerActive.statusCondition]}</div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i}
                      className="w-4 h-4 rounded-full border"
                      style={{
                        background: i < playerPrizes ? '#FFD700' : 'transparent',
                        borderColor: '#FFD700',
                        opacity: i < playerPrizes ? 1 : 0.3,
                      }}
                    />
                  ))}
                </div>
                <div className="text-[11px] font-bold text-yellow-400">YOU</div>
              </div>
            </div>

            {/* Player bench */}
            <div className="flex flex-col gap-1.5">
              <div className="text-white/50 text-[10px] font-bold uppercase tracking-wide text-right">Your Bench</div>
              <div className="flex flex-col gap-2">
                {playerBench.map((card, i) => (
                  <div key={card.id} className="relative">
                    <PokemonCard
                      pokemon={{ ...card, hp: card.currentHp }}
                      size="sm"
                      clickable={!!selectingBench}
                      showEnergy
                      onSelect={() => {
                        if (selectingBench === 'retreat') executRetreat(i);
                        else if (selectingBench === 'sendUp') handleSendUpBench(i);
                        else if (isPlayerTurn && !playerEnergyPlayed) handleAttachEnergyToBench(i);
                      }}
                    />
                    {card.statusCondition && (
                      <div className="absolute top-0 right-0 text-sm">{STATUS_ICONS[card.statusCondition]}</div>
                    )}
                    {isPlayerTurn && !playerEnergyPlayed && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] text-cyan-400 whitespace-nowrap">
                        tap to attach ⚡
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ACTION BAR ── */}
      <div className="relative z-20 bg-black/70 backdrop-blur-sm border-t border-white/10 px-4 py-2">
        {phase === 'battle' && (
          <>
            {selectingBench ? (
              <div className="text-center text-yellow-400 font-bold text-sm">
                {selectingBench === 'retreat' ? '← Select a bench Pokémon to send in' : '⬆ You must send up a bench Pokémon!'}
                {selectingBench === 'retreat' && (
                  <button onClick={() => setSelectingBench(null)} className="ml-3 text-white/50 text-xs hover:text-white">Cancel</button>
                )}
              </div>
            ) : currentTurn === 'ai' ? (
              <div className="text-center text-blue-400 font-bold text-sm animate-pulse">
                AI is taking its turn...
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2 justify-center">
                {/* Turn indicator */}
                <div className="text-yellow-400 font-black text-sm mr-2">YOUR TURN</div>

                {/* Attach Energy */}
                <button
                  onClick={handleAttachEnergy}
                  disabled={playerEnergyPlayed}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold border transition-all ${
                    playerEnergyPlayed
                      ? 'opacity-40 cursor-not-allowed border-white/10 text-white/40'
                      : 'border-cyan-400 text-cyan-400 hover:bg-cyan-400/20'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full text-[8px] font-black text-white flex items-center justify-center"
                    style={{ background: ENERGY_CONFIG[playerActive.energyType]?.bg }}
                  >
                    {ENERGY_CONFIG[playerActive.energyType]?.text}
                  </span>
                  {playerEnergyPlayed ? 'Energy Played' : `Attach ${playerActive.energyType}`}
                </button>

                {/* Attacks */}
                {playerActive.attacks.map((atk, i) => {
                  const can = i === 0 ? canAttack0 : canAttack1;
                  const disabled = !isPlayerTurn || playerAttacked || !can ||
                    playerActive.statusCondition === 'paralyze' || playerActive.statusCondition === 'sleep';
                  return (
                    <button
                      key={i}
                      onClick={() => !disabled && handlePlayerAttack(i)}
                      disabled={disabled}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold border transition-all ${
                        disabled
                          ? 'opacity-40 cursor-not-allowed border-white/10 text-white/40'
                          : 'border-orange-400 text-orange-400 hover:bg-orange-400/20'
                      }`}
                    >
                      <div className="flex gap-0.5">
                        {atk.energyCost.map((e, j) => (
                          <span key={j}
                            className="w-3.5 h-3.5 rounded-full text-[7px] font-black text-white flex items-center justify-center"
                            style={{ background: ENERGY_CONFIG[e]?.bg || '#666' }}
                          >
                            {ENERGY_CONFIG[e]?.text}
                          </span>
                        ))}
                      </div>
                      ⚔ {atk.name}
                      {atk.damage > 0 && <span className="text-white/70 text-xs ml-1">{atk.damage}</span>}
                      {!can && <span className="text-red-400 text-[9px] ml-1">no energy</span>}
                    </button>
                  );
                })}

                {/* Retreat */}
                <button
                  onClick={handleRetreat}
                  disabled={!canRetreat || playerAttacked}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold border transition-all ${
                    !canRetreat || playerAttacked
                      ? 'opacity-40 cursor-not-allowed border-white/10 text-white/40'
                      : 'border-purple-400 text-purple-400 hover:bg-purple-400/20'
                  }`}
                >
                  ↩ Retreat ({playerActive.retreatCost})
                </button>

                {/* Pass */}
                <button
                  onClick={handlePassTurn}
                  className="px-3 py-1.5 rounded-lg text-sm font-bold border border-white/20 text-white/50 hover:bg-white/10"
                >
                  Pass
                </button>
              </div>
            )}
          </>
        )}

        {/* Arena name */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-right">
          <div className="text-[10px]" style={{ color: arena.accent }}>{arena.emoji} {arena.name}</div>
          {arena.modifier && (
            <div className="text-[9px] text-white/40">{arena.effect}</div>
          )}
        </div>
      </div>

      {/* ── FLOATING EFFECTS ── */}
      {effectMsg && (
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 font-black text-lg md:text-2xl ${effectMsg.color} pointer-events-none animate-effectiveness`}
          style={{ textShadow: '2px 2px 0 #000, -1px -1px 0 #000' }}>
          {effectMsg.text}
        </div>
      )}

      {floatingDmg && (
        <div
          className="absolute z-50 pointer-events-none animate-damage-float"
          style={{
            left: floatingDmg.side === 'ai' ? '55%' : '35%',
            top: floatingDmg.side === 'ai' ? '30%' : '60%',
          }}
        >
          <div
            className={`font-black text-4xl md:text-5xl ${floatingDmg.crit ? 'text-red-400' : 'text-yellow-300'}`}
            style={{ textShadow: '3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000' }}
          >
            -{floatingDmg.val}{floatingDmg.crit && <span className="text-2xl ml-1">CRIT!</span>}
          </div>
        </div>
      )}

      {/* ── FINISHED OVERLAY ── */}
      {phase === 'finished' && (
        <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl md:text-7xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              {winner === 'player' ? '🏆 YOU WIN!' : '💀 YOU LOSE'}
            </div>
            <div className="text-white/70 text-lg mb-6">
              {winner === 'player' ? 'All prize cards collected!' : 'Better luck next time, trainer.'}
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => { localStorage.removeItem('battleCards'); localStorage.removeItem('selectedArena'); router.push('/'); }}
                className="px-8 py-3 rounded-xl font-bold text-white text-lg bg-blue-600 hover:bg-blue-500 border-2 border-blue-400"
              >
                ← New Team
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-3 rounded-xl font-bold text-white text-lg bg-orange-600 hover:bg-orange-500 border-2 border-orange-400"
              >
                ↺ Rematch
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes screen-shake {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(-6px, 3px); }
          40% { transform: translate(6px, -3px); }
          60% { transform: translate(-4px, 2px); }
          80% { transform: translate(4px, -2px); }
        }
        .animate-screen-shake { animation: screen-shake 0.25s ease-out; }
        @keyframes attack-lunge-left {
          0%, 100% { transform: scale(1) translateX(0); }
          50% { transform: scale(1.08) translateX(16px); }
        }
        .animate-attack-lunge-left { animation: attack-lunge-left 0.35s ease-out; }
        @keyframes attack-lunge-right {
          0%, 100% { transform: scale(1) translateX(0); }
          50% { transform: scale(1.08) translateX(-16px); }
        }
        .animate-attack-lunge-right { animation: attack-lunge-right 0.35s ease-out; }
        @keyframes hit-flash {
          0%, 100% { filter: brightness(1); }
          30%, 70% { filter: brightness(3) saturate(0); }
        }
        .animate-hit-flash { animation: hit-flash 0.25s ease-out; }
        @keyframes damage-float {
          0% { transform: translateY(0) scale(0.6); opacity: 0; }
          20% { transform: translateY(-10px) scale(1.2); opacity: 1; }
          100% { transform: translateY(-70px) scale(1); opacity: 0; }
        }
        .animate-damage-float { animation: damage-float 1s ease-out forwards; }
        @keyframes effectiveness {
          0% { transform: translate(-50%,-50%) scale(0.5); opacity: 0; }
          20% { transform: translate(-50%,-50%) scale(1.2); opacity: 1; }
          70% { transform: translate(-50%,-50%) scale(1); opacity: 1; }
          100% { transform: translate(-50%,-50%) scale(0.9); opacity: 0; }
        }
        .animate-effectiveness { animation: effectiveness 1.5s ease-out forwards; }
      `}</style>
    </div>
  );
}
