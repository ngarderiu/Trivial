// Tablero clásico del Trivial.
//
// Modelo de datos:
//   - 36 casillas en el anillo exterior: 6 sedes + 30 normales
//   - sedes en posiciones múltiplos de 6 (0, 6, 12, 18, 24, 30)
//   - entre cada par de sedes hay exactamente 5 casillas normales
//   - cada brazo radial dibuja 6 casillas decorativas (no transitables)
//
// Visualmente las sedes ocupan el doble de ancho angular que las normales:
//   42 "unidades angulares" totales = 6 sedes × 2 + 30 normales × 1.

import { CATEGORY_IDS } from './categories.js';

const RING_SIZE = 36;
const SPOKES = 6;
const SPOKE_GAP = RING_SIZE / SPOKES; // 6

// Categoría de una casilla normal: la siguiente en secuencia tras la sede previa
function categoryForIndex(i) {
  const sedeBefore = Math.floor(i / SPOKE_GAP); // 0..5
  const offset = i % SPOKE_GAP;                  // 0=sede, 1..5=normales
  if (offset === 0) {
    return CATEGORY_IDS[sedeBefore];
  }
  return CATEGORY_IDS[(sedeBefore + offset) % CATEGORY_IDS.length];
}

function isSedeIndex(i) {
  return i % SPOKE_GAP === 0;
}

export const BOARD_POSITIONS = Array.from({ length: RING_SIZE }, (_, i) => ({
  index: i,
  category: categoryForIndex(i),
  isHQ: isSedeIndex(i)
}));

export const CENTER_INDEX = -1; // valor especial para el centro
export const RING_LENGTH = RING_SIZE;
export const SPOKE_CELLS = 6; // casillas decorativas por brazo

// Dado: 1..6
export const DICE_MIN = 1;
export const DICE_MAX = 6;
