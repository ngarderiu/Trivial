// Funciones puras del tablero. Sin estado, sin React.

import { BOARD_POSITIONS, RING_LENGTH, CENTER_INDEX } from '../constants/board.js';

// ¿Es la posición la sede de su categoría?
export function isSedePosition(index) {
  if (index === CENTER_INDEX) return false;
  const cell = BOARD_POSITIONS[index];
  return Boolean(cell?.isHQ);
}

// Categoría asociada a una casilla del anillo
export function getCategoryAtPosition(index) {
  if (index === CENTER_INDEX) return null;
  return BOARD_POSITIONS[index]?.category ?? null;
}

// Categoría de la sede en esa posición (si lo es)
export function getSedeCategory(index) {
  return isSedePosition(index) ? getCategoryAtPosition(index) : null;
}

// Avanzar `steps` casillas desde `from` por el anillo, en sentido positivo.
// Devuelve el nuevo índice (módulo RING_LENGTH).
export function advancePosition(from, steps) {
  if (from === CENTER_INDEX) return from; // el centro no mueve por dado
  const next = (from + steps) % RING_LENGTH;
  return (next + RING_LENGTH) % RING_LENGTH;
}

// Devuelve los índices alcanzables desde `from` con un dado de `steps`.
// En el Trivial clásico se puede ir hacia delante o hacia atrás.
export function reachablePositions(from, steps) {
  if (from === CENTER_INDEX) return [];
  const forward = (from + steps) % RING_LENGTH;
  const backward = (from - steps + RING_LENGTH) % RING_LENGTH;
  return forward === backward ? [forward] : [forward, backward];
}
