// Tablero clásico del Trivial: anillo exterior con 42 casillas.
// 6 sedes (una por categoría) repartidas equiespaciadamente cada 7 casillas.
// El centro es el espacio donde se decide el ganador.
//
// Cada casilla:
//   - index: posición en el anillo (0..41)
//   - category: categoría asignada a esa casilla
//   - isHQ: true si es sede de esa categoría (donde se gana quesito)

import { CATEGORY_IDS } from './categories.js';

const RING_SIZE = 42;
const SPOKES = 6;
const SPOKE_GAP = RING_SIZE / SPOKES; // 7

// Categorías rotando alrededor del anillo
function categoryForIndex(index) {
  return CATEGORY_IDS[index % CATEGORY_IDS.length];
}

// Sedes: una por categoría, en posiciones múltiplos de 7
function isSedeIndex(index) {
  return index % SPOKE_GAP === 0;
}

export const BOARD_POSITIONS = Array.from({ length: RING_SIZE }, (_, i) => {
  const isHQ = isSedeIndex(i);
  // Las 6 sedes están en 0, 7, 14, 21, 28, 35 — una por categoría
  const category = isHQ
    ? CATEGORY_IDS[i / SPOKE_GAP]
    : categoryForIndex(i);
  return { index: i, category, isHQ };
});

export const CENTER_INDEX = -1; // valor especial para el centro
export const RING_LENGTH = RING_SIZE;

// Dado: 1..6
export const DICE_MIN = 1;
export const DICE_MAX = 6;
