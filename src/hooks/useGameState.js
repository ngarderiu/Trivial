import { useCallback, useMemo, useState } from 'react';
import { DEFAULT_MODE, PLAYER_COLORS } from '../constants/gameConfig.js';
import { CENTER_INDEX } from '../constants/board.js';
import {
  advancePosition,
  canEarnQuesito,
  hasAllQuesitos,
  nextPlayerIndex,
  rollDice
} from '../utils/index.js';

// Hook central del juego.
//
// Estado:
//   - players, currentPlayerIndex, positions, quesitos
//   - usedQuestionIds: para no repetir preguntas
//   - lastDice, phase, winnerId, mode
//   - streaks: { [playerId]: number }  rachas de aciertos consecutivos
//             SIN ganar quesito (se resetean al ganarlo o al fallar).
//
// Importante: la VICTORIA ya no se declara automáticamente al completar
// los quesitos. El jugador completa, va al centro, y en su próximo turno
// debe acertar una pregunta final (declareVictory) para ganar.
export function useGameState() {
  const [mode, setMode] = useState(DEFAULT_MODE);
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [positions, setPositions] = useState({});
  const [quesitos, setQuesitos] = useState({});
  const [streaks, setStreaks] = useState({});
  const [usedQuestionIds, setUsedQuestionIds] = useState(() => new Set());
  const [lastDice, setLastDice] = useState(null);
  const [phase, setPhase] = useState('setup');
  const [winnerId, setWinnerId] = useState(null);

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
    const initialStreaks = Object.fromEntries(list.map((p) => [p.id, 0]));

    setMode(modeId);
    setPlayers(list);
    setCurrentPlayerIndex(0);
    setPositions(initialPositions);
    setQuesitos(initialQuesitos);
    setStreaks(initialStreaks);
    setUsedQuestionIds(new Set());
    setLastDice(null);
    setWinnerId(null);
    setPhase('playing');
  }, []);

  const resetGame = useCallback(() => {
    setPhase('setup');
    setWinnerId(null);
    setLastDice(null);
  }, []);

  const rollDiceAction = useCallback(() => {
    const value = rollDice();
    setLastDice(value);
    return value;
  }, []);

  const moveCurrentPlayerTo = useCallback(
    (newIndex) => {
      const current = players[currentPlayerIndex];
      if (!current) return;
      setPositions((prev) => ({ ...prev, [current.id]: newIndex }));
      setLastDice(null);
    },
    [players, currentPlayerIndex]
  );

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

  const markQuestionUsed = useCallback((questionId) => {
    if (!questionId) return;
    setUsedQuestionIds((prev) => {
      const next = new Set(prev);
      next.add(questionId);
      return next;
    });
  }, []);

  // Otorga un quesito (si procede) y resetea la racha del jugador actual.
  // NO declara victoria automáticamente: ahora la victoria requiere acertar
  // la pregunta final en el centro.
  const grantQuesitoToCurrent = useCallback(
    (categoryId) => {
      const current = players[currentPlayerIndex];
      if (!current) return false;
      const owned = quesitos[current.id] ?? [];
      if (!canEarnQuesito(owned, categoryId, mode)) return false;

      setQuesitos((prev) => ({ ...prev, [current.id]: [...owned, categoryId] }));
      setStreaks((prev) => ({ ...prev, [current.id]: 0 }));
      return true;
    },
    [players, currentPlayerIndex, quesitos, mode]
  );

  const incrementStreak = useCallback((playerId) => {
    if (!playerId) return;
    setStreaks((prev) => ({ ...prev, [playerId]: (prev[playerId] ?? 0) + 1 }));
  }, []);

  const resetStreak = useCallback((playerId) => {
    if (!playerId) return;
    setStreaks((prev) => ({ ...prev, [playerId]: 0 }));
  }, []);

  const declareVictory = useCallback((playerId) => {
    if (!playerId) return;
    setWinnerId(playerId);
    setPhase('victory');
  }, []);

  // ¿Tiene este jugador ya todos los quesitos (candidato a victoria)?
  const isWinnerCandidate = useCallback(
    (playerId) => hasAllQuesitos(quesitos[playerId] ?? [], mode),
    [quesitos, mode]
  );

  const passTurn = useCallback(() => {
    setCurrentPlayerIndex((idx) => nextPlayerIndex(idx, players.length));
    setLastDice(null);
  }, [players.length]);

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
    streaks,
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
    incrementStreak,
    resetStreak,
    declareVictory,
    isWinnerCandidate,
    passTurn,
    setMode
  };
}
