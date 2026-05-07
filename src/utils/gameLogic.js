// Lógica central del juego. Funciones puras.

import { CATEGORY_IDS } from '../constants/categories.js';
import { GAME_MODES } from '../constants/gameConfig.js';
import { DICE_MIN, DICE_MAX } from '../constants/board.js';

// Tirada simulada del dado
export function rollDice() {
  return Math.floor(Math.random() * (DICE_MAX - DICE_MIN + 1)) + DICE_MIN;
}

// ¿El jugador tiene todos los quesitos del modo elegido?
export function hasAllQuesitos(playerQuesitos, modeId) {
  const mode = GAME_MODES[modeId.toUpperCase()] ?? GAME_MODES.CLASSIC;
  // Si el modo necesita 6 quesitos: todos los IDs.
  // Si el modo necesita 4 quesitos: cualquier subconjunto de 4 únicos vale.
  const unique = new Set(playerQuesitos);
  return unique.size >= mode.quesitosToWin;
}

// Comprueba si algún jugador ha cumplido la condición de victoria
export function checkVictory(playersQuesitos, modeId) {
  for (const [playerId, quesitos] of Object.entries(playersQuesitos)) {
    if (hasAllQuesitos(quesitos, modeId)) return playerId;
  }
  return null;
}

// Lista de categorías que aún le faltan al jugador (orden de CATEGORY_IDS)
export function missingCategories(playerQuesitos) {
  const owned = new Set(playerQuesitos);
  return CATEGORY_IDS.filter((id) => !owned.has(id));
}

// ¿La categoría es válida para ganar quesito según modo?
// En modo Rápido bastan 4 distintos cualesquiera; en Clásico hacen falta los 6.
export function canEarnQuesito(playerQuesitos, categoryId, modeId) {
  if (playerQuesitos.includes(categoryId)) return false;
  const mode = GAME_MODES[modeId.toUpperCase()] ?? GAME_MODES.CLASSIC;
  return new Set(playerQuesitos).size < mode.quesitosToWin;
}

// Avanza al siguiente jugador en una rotación cíclica
export function nextPlayerIndex(currentIndex, totalPlayers) {
  return (currentIndex + 1) % totalPlayers;
}
