import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

const API_URL = 'https://pokeapi.co/api/v2/pokemon?limit=151';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';
const CACHE_KEY = 'pokemon_data_cache';
const CACHE_EXPIRY_KEY = 'pokemon_data_cache_expiry';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const PokemonBattle = () => {
  const [allPokemon, setAllPokemon] = useState([]);
  const [selectedPokemon, setSelectedPokemon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flippedCards, setFlippedCards] = useState([]);
  const [stats, setStats] = useState([]);
  const [statsError, setStatsError] = useState(null);
  const navigate = useNavigate();

  // Check if cache is valid
  const isCacheValid = () => {
    const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);
    if (!expiry) return false;
    return Date.now() < parseInt(expiry, 10);
  };

  // Get cached Pokemon data
  const getCachedPokemon = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  };

  // Save Pokemon data to cache
  const cachePokemon = (data) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(CACHE_EXPIRY_KEY, String(Date.now() + CACHE_DURATION));
    } catch {
      // Cache storage failed, continue without caching
    }
  };

  // Fetch Pokemon from the API or cache
  useEffect(() => {
    const fetchPokemon = async () => {
      // Check cache first
      if (isCacheValid()) {
        const cached = getCachedPokemon();
        if (cached) {
          setAllPokemon(cached);
          setLoading(false);
          return;
        }
      }

      try {
        const response = await axios.get(API_URL);
        const results = response.data.results;
        const detailed = await Promise.all(
          results.map((pokemon) => axios.get(pokemon.url))
        );
        const enriched = detailed.map((res) => {
          const data = res.data;
          return {
            _id: data.id,
            name: data.name,
            sprites: data.sprites,
            stats: {
              hp: data.stats[0].base_stat,
              attack: data.stats[1].base_stat,
              defense: data.stats[2].base_stat,
              speed: data.stats[5].base_stat
            },
            type: data.types.map((t) => t.type.name),
            battles: [],
            battleStats: { wins: 0, loses: 0 }
          };
        });

        // Cache the data
        cachePokemon(enriched);
        setAllPokemon(enriched);
        setLoading(false);
      } catch (err) {
        setError("Failed to load Pokemon data. Please refresh the page.");
        setLoading(false);
      }
    };

    fetchPokemon();
  }, []);

  // Get battle stats from backend
  useEffect(() => {
    axios.get(`${BACKEND_URL}/battlestats`)
      .then((res) => setStats(res.data))
      .catch(() => setStatsError("Unable to load battle stats"));
  }, []);

  const selectPokemon = (e, pokemon) => {
    if (selectedPokemon.includes(pokemon)) {
      setSelectedPokemon(selectedPokemon.filter((p) => p !== pokemon));
    } else if (selectedPokemon.length < 2) {
      setSelectedPokemon([...selectedPokemon, pokemon]);
    }
  };

  const flipCard = (e, pokemonId) => {
    e.preventDefault();
    setFlippedCards((prev) =>
      prev.includes(pokemonId) ? prev.filter((id) => id !== pokemonId) : [...prev, pokemonId]
    );
  };

  const startBattle = () => {
    if (selectedPokemon.length !== 2) {
      alert("Select two Pokemon to battle!");
      return;
    }
    navigate('/battle', { state: { selectedPokemon } });
  };

  return (
    <div>
      <h1>Let The Best Pokemon Win</h1>
      {statsError && <div className="stats-warning">{statsError}</div>}
      {loading ? (
        <p>Loading Pokemon...</p>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="pokemon-list">
          {allPokemon.map((pokemon) => {
            const isFlipped = flippedCards.includes(pokemon._id);
            const isSelected = selectedPokemon.includes(pokemon);
            const matchingStats = stats.find((p) => p.name === pokemon.name);
            const wins = matchingStats?.battleStats?.wins || 0;
            const loses = matchingStats?.battleStats?.loses || 0;

            return (
              <div
                key={pokemon._id}
                className={`pokemon-card ${isSelected ? 'selected' : ''} ${isFlipped ? 'flipped' : ''} type-${pokemon.type[0].toLowerCase()}`}
                onClick={(e) => selectPokemon(e, pokemon)}
                onContextMenu={(e) => flipCard(e, pokemon._id)}
              >
                <div className="card-inner">
                  <div className="card-front">
                    <h3>{pokemon.name}</h3>
                    <img src={pokemon.sprites.front_default} alt={pokemon.name} />
                    <div className="pokemon-stats">
                      <p>Types: {pokemon.type.join(", ")}</p>
                      <p>HP: {pokemon.stats.hp}</p>
                      <p>Attack: {pokemon.stats.attack}</p>
                      <p>Defense: {pokemon.stats.defense}</p>
                      <p>Speed: {pokemon.stats.speed}</p>
                    </div>
                  </div>
                  <div className="card-back">
                    <p>{`${pokemon.name} has fought ${wins + loses} battles.`}</p>
                    <p>{`Record: ${wins} wins and ${loses} losses.`}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className="battle-controls">
        <button
          className="battle-button"
          onClick={startBattle}
          disabled={selectedPokemon.length !== 2}
        >
          Start Battle
        </button>
      </div>
    </div>
  );
};

export default PokemonBattle;
