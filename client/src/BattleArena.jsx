import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';

// Dice face component showing dots
const DiceFace = ({ value, color }) => {
  const dotPositions = {
    1: ['center'],
    2: ['top-right', 'bottom-left'],
    3: ['top-right', 'center', 'bottom-left'],
    4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
    5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
    6: ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right'],
  };

  const positions = dotPositions[value] || [];

  return (
    <div className={`dice dice-${color}`}>
      {positions.map((pos, idx) => (
        <div key={idx} className={`dot ${pos}`} />
      ))}
    </div>
  );
};

const BattleArena = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedPokemon } = location.state || {};
  const [diceRolls, setDiceRolls] = useState([null, null]);
  const [winner, setWinner] = useState(null);
  const [phase, setPhase] = useState('ready'); // ready, rolling, result
  const [error, setError] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [rollCount, setRollCount] = useState(0);

  useEffect(() => {
    if (!selectedPokemon || selectedPokemon.length !== 2) {
      navigate('/');
    }
  }, [selectedPokemon, navigate]);

  const rollDice = () => {
    setIsRolling(true);
    setPhase('rolling');
    setError(null);
    setWinner(null);

    // Animate dice rolling with random values
    let rollAnimation = 0;
    const animationInterval = setInterval(() => {
      setDiceRolls([
        Math.ceil(Math.random() * 6),
        Math.ceil(Math.random() * 6)
      ]);
      rollAnimation++;

      // Stop after 10 animation frames (~1 second)
      if (rollAnimation >= 10) {
        clearInterval(animationInterval);

        // Final roll
        const finalRoll1 = Math.ceil(Math.random() * 6);
        const finalRoll2 = Math.ceil(Math.random() * 6);
        setDiceRolls([finalRoll1, finalRoll2]);
        setIsRolling(false);
        setPhase('result');
      }
    }, 100);
  };

  // Determine winner when dice stop rolling
  useEffect(() => {
    if (phase === 'result' && !isRolling && diceRolls[0] !== null && diceRolls[1] !== null) {
      const [roll1, roll2] = diceRolls;
      const [pokemon1, pokemon2] = selectedPokemon;

      // Tie - auto re-roll after short delay
      if (roll1 === roll2) {
        setRollCount(prev => prev + 1);
        setTimeout(() => {
          if (rollCount < 5) { // Max 5 re-rolls to prevent infinite loop
            rollDice();
          } else {
            // After 5 ties, just pick randomly
            const randomWinner = Math.random() > 0.5 ? pokemon1 : pokemon2;
            setWinner(randomWinner);
            saveBattleResult(randomWinner);
          }
        }, 1000);
        return;
      }

      // Higher roll wins!
      const battleWinner = roll1 > roll2 ? pokemon1 : pokemon2;
      setWinner(battleWinner);
      saveBattleResult(battleWinner);
    }
  }, [phase, isRolling, diceRolls]);

  const saveBattleResult = async (battleWinner) => {
    const [pokemon1, pokemon2] = selectedPokemon;

    const battleResultPayload = {
      selectedPokemon: [pokemon1, pokemon2],
      battleResult: `${battleWinner.name} wins!`
    };

    try {
      await axios.post(`${API_URL}/battleresults`, battleResultPayload);
    } catch (err) {
      setError('Failed to save battle result.');
    }

    // Faster redirect - 3 seconds
    setTimeout(() => navigate('/'), 3000);
  };

  if (!selectedPokemon || selectedPokemon.length !== 2) {
    return <p>Loading...</p>;
  }

  const [roll1, roll2] = diceRolls;
  const pokemon1Wins = winner && winner.name === selectedPokemon[0].name;
  const pokemon2Wins = winner && winner.name === selectedPokemon[1].name;

  return (
    <div className="battle-arena">
      <h1>Battle Arena</h1>
      {error && <div className="error-message">{error}</div>}

      <div className="battle-container">
        {/* Pokemon 1 - Red Dice */}
        <div className={`fighter fighter-left ${pokemon1Wins ? 'winner' : ''} ${pokemon2Wins ? 'loser' : ''}`}>
          <h3>{selectedPokemon[0].name}</h3>
          <img src={selectedPokemon[0].sprites.front_default} alt={selectedPokemon[0].name} />
          <div className="dice-container">
            {roll1 !== null && <DiceFace value={roll1} color="red" />}
          </div>
          {roll1 !== null && <p className="roll-value">Rolled: {roll1}</p>}
        </div>

        {/* Center - VS and Roll Button */}
        <div className="battle-center">
          {phase === 'ready' && (
            <>
              <div className="vs-text">VS</div>
              <button className="roll-button" onClick={rollDice}>
                Roll Dice!
              </button>
            </>
          )}

          {phase === 'rolling' && (
            <div className="rolling-text">Rolling...</div>
          )}

          {phase === 'result' && !winner && roll1 === roll2 && (
            <div className="tie-text">Tie! Re-rolling...</div>
          )}

          {winner && (
            <div className="winner-announcement">
              <h2>{winner.name} Wins!</h2>
              <p className="redirect-notice">Back to selection in 3s...</p>
            </div>
          )}
        </div>

        {/* Pokemon 2 - Blue Dice */}
        <div className={`fighter fighter-right ${pokemon2Wins ? 'winner' : ''} ${pokemon1Wins ? 'loser' : ''}`}>
          <h3>{selectedPokemon[1].name}</h3>
          <img src={selectedPokemon[1].sprites.front_default} alt={selectedPokemon[1].name} />
          <div className="dice-container">
            {roll2 !== null && <DiceFace value={roll2} color="blue" />}
          </div>
          {roll2 !== null && <p className="roll-value">Rolled: {roll2}</p>}
        </div>
      </div>
    </div>
  );
};

export default BattleArena;
