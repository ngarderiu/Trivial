import { useMemo } from 'react';
import { BOARD_POSITIONS } from '../constants/board.js';
import { reachablePositions } from '../utils/boardUtils.js';

// Devuelve datos derivados del tablero: lista de casillas y posiciones alcanzables.
export function useBoard(currentPosition, lastDice) {
  const cells = BOARD_POSITIONS;

  const reachable = useMemo(() => {
    if (lastDice == null || currentPosition == null) return [];
    return reachablePositions(currentPosition, lastDice);
  }, [currentPosition, lastDice]);

  return { cells, reachable };
}
