import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PokemonBattle from '../PokemonBattle';

// Mock axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

import axios from 'axios';

const mockPokemonData = {
  data: {
    results: [
      { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
      { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/' },
    ],
  },
};

const mockPokemonDetail = (id, name) => ({
  data: {
    id,
    name,
    sprites: { front_default: `https://example.com/${name}.png` },
    stats: [
      { base_stat: 45 },
      { base_stat: 49 },
      { base_stat: 49 },
      { base_stat: 45 },
      { base_stat: 65 },
      { base_stat: 45 },
    ],
    types: [{ type: { name: 'grass' } }],
  },
});

describe('PokemonBattle', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders loading state initially', () => {
    axios.get.mockImplementation(() => new Promise(() => {}));

    render(
      <BrowserRouter>
        <PokemonBattle />
      </BrowserRouter>
    );

    expect(screen.getByText('Loading Pokemon...')).toBeInTheDocument();
  });

  it('renders Pokemon cards after loading', async () => {
    axios.get
      .mockResolvedValueOnce(mockPokemonData)
      .mockResolvedValueOnce(mockPokemonDetail(1, 'bulbasaur'))
      .mockResolvedValueOnce(mockPokemonDetail(4, 'charmander'))
      .mockResolvedValueOnce({ data: [] }); // battlestats

    render(
      <BrowserRouter>
        <PokemonBattle />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('bulbasaur')).toBeInTheDocument();
      expect(screen.getByText('charmander')).toBeInTheDocument();
    });
  });

  it('shows error message when API fails', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network error'));

    render(
      <BrowserRouter>
        <PokemonBattle />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load Pokemon data. Please refresh the page.')).toBeInTheDocument();
    });
  });

  it('disables battle button when less than 2 Pokemon selected', async () => {
    axios.get
      .mockResolvedValueOnce(mockPokemonData)
      .mockResolvedValueOnce(mockPokemonDetail(1, 'bulbasaur'))
      .mockResolvedValueOnce(mockPokemonDetail(4, 'charmander'))
      .mockResolvedValueOnce({ data: [] });

    render(
      <BrowserRouter>
        <PokemonBattle />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('bulbasaur')).toBeInTheDocument();
    });

    const battleButton = screen.getByText('Start Battle');
    expect(battleButton).toBeDisabled();
  });

  it('uses cached data when available', async () => {
    const cachedData = [
      {
        _id: 1,
        name: 'pikachu',
        sprites: { front_default: 'https://example.com/pikachu.png' },
        stats: { hp: 35, attack: 55, defense: 40, speed: 90 },
        type: ['electric'],
        battles: [],
        battleStats: { wins: 0, loses: 0 },
      },
    ];

    localStorage.setItem('pokemon_data_cache', JSON.stringify(cachedData));
    localStorage.setItem('pokemon_data_cache_expiry', String(Date.now() + 1000000));

    axios.get.mockResolvedValueOnce({ data: [] }); // battlestats only

    render(
      <BrowserRouter>
        <PokemonBattle />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('pikachu')).toBeInTheDocument();
    });

    // Should only call for battlestats, not Pokemon data
    expect(axios.get).toHaveBeenCalledTimes(1);
  });
});
