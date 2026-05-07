import { useCallback, useMemo, useState } from 'react';
import { DEFAULT_MODE, PLAYER_COLORS } from '../constants/gameConfig.js';
import { CENTER_INDEX } from '../constants/board.js';
import {
  advancePosition,
  canEarnQuesito,
  checkVictory,
  nextPlayerIndex,
  rollDice
} from '../utils/index.js';

// Hook central del juego. Encapsula todo el estado y las acciones.
//
// Estado:
//   - players: [{ id, name, color }]
//   - currentPlayerIndex: índice del jugador con turno
//   - positions: { [playerId]: number }   posición en el anillo (-1 = centro)
//   - quesitos: { [playerId]: string[] }  ids de categorías ganadas
//   - usedQuestionIds: Set<string>         para no repetir preguntas
//   - lastDice: número del último dado (null si no se ha tirado)
//   - phase: 'setup' | 'playing' | 'victory'
//   - mode: 'classic' | 'rapid'
//   - winnerId: ganador final, si hay
export function useGameState() {
  const [mode, setMode] = useState(DEFAULT_MODE);
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [positions, setPositions] = useState({});
  const [quesitos, setQuesitos] = useState({});
  const [usedQuestionIds, setUsedQuestionIds] = useState(() => new Set());
  const [lastDice, setLastDice] = useState(null);
  const [phase, setPhase] = useState('setup');
  const [winnerId, setWinnerId] = useState(null);

  // Inicia partida con la lista de jugadores y el modo
  const startGame = useCallback((playerNames, modeId = DEFAULT_MODE) => {
    const list = playerNames
      .map((name, i) => ({
        id: PLAYER_COLORS[i].id,
        name: name?.trim() || `Equipo ${PLAYER_COLORS[i].label}`,
        color: PLAYER_COLORS[i].value
      }))
      .filter(Boolean);

    const initialPositions = Object.fromEntries(list.map((p) => [p.id, 0]));
    const initialQuesitos = Object.fromEntries(list.map((p) => [p.id, []]));

    setMode(modeId);
    setPlayers(list);
    setCurrentPlayerIndex(0);
    setPositions(initialPositions);
    setQuesitos(initialQuesitos);
    setUsedQuestionIds(new Set());
    setLastDice(null);
    setWinnerId(null);
    setPhase('playing');
  }, []);

  // Volver a setup
  const resetGame = useCallback(() => {
    setPhase('setup');
    setWinnerId(null);
    setLastDice(null);
  }, []);

  // Tirar dado y guardarlo (no mueve la ficha aún; el jugador elegirá casilla)
  const rollDiceAction = useCallback(() => {
    const value = rollDice();
    setLastDice(value);
    return value;
  }, []);

  // Mover al jugador actual a una posición concreta del anillo
  const moveCurrentPlayerTo = useCallback(
    (newIndex) => {
      const current = players[currentPlayerIndex];
      if (!current) return;
      setPositions((prev) => ({ ...prev, [current.id]: newIndex }));
      setLastDice(null);
    },
    [players, currentPlayerIndex]
  );

  // Avance "automático" (elige hacia delante) — útil si solo permitimos
  // dirección positiva. Mantiene la API simple.
  const moveCurrentPlayerForward = useCallback(
    (steps) => {
      const current = players[currentPlayerIndex];
      if (!current) return;
      const from = positions[current.id] ?? 0;
      const target = advancePosition(from, steps);
      moveCurrentPlayerTo(target);
    },
    [players, currentPlayerIndex, positions, moveCurrentPlayerTo]
  );

  // Marca una pregunta como usada para que no se repita
  const markQuestionUsed = useCallback((questionId) => {
    if (!questionId) return;
    setUsedQuestionIds((prev) => {
      const next = new Set(prev);
      next.add(questionId);
      return next;
    });
  }, []);

  // Otorga un quesito al jugador actual si toca y procede
  const grantQuesitoToCurrent = useCallback(
    (categoryId) => {
      const current = players[currentPlayerIndex];
      if (!current) return false;
      const owned = quesitos[current.id] ?? [];
      if (!canEarnQuesito(owned, categoryId, mode)) return false;

      const updated = { ...quesitos, [current.id]: [...owned, categoryId] };
      setQuesitos(updated);

      const winner = checkVictory(updated, mode);
      if (winner) {
        setWinnerId(winner);
        setPhase('victory');
      }
      return true;
    },
    [players, currentPlayerIndex, quesitos, mode]
  );

  // Pasa el turno al siguiente jugador
  const passTurn = useCallback(() => {
    setCurrentPlayerIndex((idx) => nextPlayerIndex(idx, players.length));
    setLastDice(null);
  }, [players.length]);

  // Mover al jugador actual al centro (cuando ya tiene los quesitos)
  const moveCurrentPlayerToCenter = useCallback(() => {
    const current = players[currentPlayerIndex];
    if (!current) return;
    setPositions((prev) => ({ ...prev, [current.id]: CENTER_INDEX }));
  }, [players, currentPlayerIndex]);

  const currentPlayer = useMemo(
    () => players[currentPlayerIndex] ?? null,
    [players, currentPlayerIndex]
  );

  return {
    // estado
    mode,
    players,
    currentPlayer,
    currentPlayerIndex,
    positions,
    quesitos,
    usedQuestionIds,
    lastDice,
    phase,
    winnerId,
    // acciones
    startGame,
    resetGame,
    rollDiceAction,
    moveCurrentPlayerTo,
    moveCurrentPlayerForward,
    moveCurrentPlayerToCenter,
    markQuestionUsed,
    grantQuesitoToCurrent,
    passTurn,
    setMode
  };
}
