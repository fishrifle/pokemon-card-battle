import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BattleArena from '../BattleArena';

// Mock axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import axios from 'axios';

const mockPokemon = [
  {
    _id: 1,
    name: 'bulbasaur',
    sprites: { front_default: 'https://example.com/bulbasaur.png' },
    stats: { hp: 45, attack: 49, defense: 49, speed: 45 },
    type: ['grass'],
  },
  {
    _id: 4,
    name: 'charmander',
    sprites: { front_default: 'https://example.com/charmander.png' },
    stats: { hp: 39, attack: 52, defense: 43, speed: 65 },
    type: ['fire'],
  },
];

describe('BattleArena', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    axios.post.mockResolvedValue({ data: { message: 'Battle results saved' } });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders battle arena with selected Pokemon', () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/battle', state: { selectedPokemon: mockPokemon } }]}>
        <BattleArena />
      </MemoryRouter>
    );

    expect(screen.getByText('Battle Arena')).toBeInTheDocument();
    expect(screen.getByText('bulbasaur')).toBeInTheDocument();
    expect(screen.getByText('charmander')).toBeInTheDocument();
  });

  it('shows VS text and roll button initially', () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/battle', state: { selectedPokemon: mockPokemon } }]}>
        <BattleArena />
      </MemoryRouter>
    );

    expect(screen.getByText('VS')).toBeInTheDocument();
    expect(screen.getByText('Roll Dice!')).toBeInTheDocument();
  });

  it('shows rolling state when dice are clicked', async () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/battle', state: { selectedPokemon: mockPokemon } }]}>
        <BattleArena />
      </MemoryRouter>
    );

    const rollButton = screen.getByText('Roll Dice!');
    fireEvent.click(rollButton);

    expect(screen.getByText('Rolling...')).toBeInTheDocument();
  });

  it('displays winner after dice animation completes', async () => {
    // Mock Math.random to ensure different rolls (no tie)
    const mockMath = vi.spyOn(Math, 'random');
    // First 10 calls are for animation, then 2 final rolls
    for (let i = 0; i < 10; i++) {
      mockMath.mockReturnValueOnce(0.5); // Animation frames
    }
    mockMath.mockReturnValueOnce(0.99); // Final roll 1 = 6
    mockMath.mockReturnValueOnce(0.1);  // Final roll 2 = 1

    render(
      <MemoryRouter initialEntries={[{ pathname: '/battle', state: { selectedPokemon: mockPokemon } }]}>
        <BattleArena />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Roll Dice!'));

    // Fast-forward through animation (10 frames * 100ms)
    vi.advanceTimersByTime(1100);

    await waitFor(() => {
      expect(screen.getByText('bulbasaur Wins!')).toBeInTheDocument();
    });

    mockMath.mockRestore();
  });

  it('sends battle result to API when winner is determined', async () => {
    const mockMath = vi.spyOn(Math, 'random');
    for (let i = 0; i < 10; i++) {
      mockMath.mockReturnValueOnce(0.5);
    }
    mockMath.mockReturnValueOnce(0.99); // Roll 6
    mockMath.mockReturnValueOnce(0.1);  // Roll 1

    render(
      <MemoryRouter initialEntries={[{ pathname: '/battle', state: { selectedPokemon: mockPokemon } }]}>
        <BattleArena />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Roll Dice!'));
    vi.advanceTimersByTime(1100);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/battleresults'),
        expect.objectContaining({
          selectedPokemon: mockPokemon,
          battleResult: 'bulbasaur wins!',
        })
      );
    });

    mockMath.mockRestore();
  });

  it('shows error message when API fails', async () => {
    axios.post.mockRejectedValueOnce(new Error('Network error'));

    const mockMath = vi.spyOn(Math, 'random');
    for (let i = 0; i < 10; i++) {
      mockMath.mockReturnValueOnce(0.5);
    }
    mockMath.mockReturnValueOnce(0.99);
    mockMath.mockReturnValueOnce(0.1);

    render(
      <MemoryRouter initialEntries={[{ pathname: '/battle', state: { selectedPokemon: mockPokemon } }]}>
        <BattleArena />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Roll Dice!'));
    vi.advanceTimersByTime(1100);

    await waitFor(() => {
      expect(screen.getByText('Failed to save battle result.')).toBeInTheDocument();
    });

    mockMath.mockRestore();
  });

  it('each player has their own colored dice', async () => {
    const mockMath = vi.spyOn(Math, 'random');
    for (let i = 0; i < 12; i++) {
      mockMath.mockReturnValueOnce(0.5);
    }
    mockMath.mockReturnValueOnce(0.99);
    mockMath.mockReturnValueOnce(0.1);

    render(
      <MemoryRouter initialEntries={[{ pathname: '/battle', state: { selectedPokemon: mockPokemon } }]}>
        <BattleArena />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Roll Dice!'));
    vi.advanceTimersByTime(200); // After first animation frame

    // Check that dice with colors are rendered
    const redDice = document.querySelector('.dice-red');
    const blueDice = document.querySelector('.dice-blue');

    expect(redDice).toBeInTheDocument();
    expect(blueDice).toBeInTheDocument();

    mockMath.mockRestore();
  });
});
