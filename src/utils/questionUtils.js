// Funciones puras de preguntas. Lectura de JSON y selección aleatoria.

import geografia from '../data/questions/geografia.json';
import entretenimiento from '../data/questions/entretenimiento.json';
import historia from '../data/questions/historia.json';
import arte from '../data/questions/arte.json';
import ciencia from '../data/questions/ciencia.json';
import deporte from '../data/questions/deporte.json';

// Diccionario categoryId → banco de preguntas
const BANKS = {
  geografia,
  entretenimiento,
  historia,
  arte,
  ciencia,
  deporte
};

// Devuelve todas las preguntas de una categoría
export function getQuestionsByCategory(categoryId) {
  return BANKS[categoryId]?.questions ?? [];
}

// Selecciona una pregunta aleatoria de la categoría que NO esté en `usedIds`.
// Si todas están usadas, libera el conjunto y vuelve a empezar.
export function getRandomQuestion(categoryId, usedIds = new Set()) {
  const all = getQuestionsByCategory(categoryId);
  if (all.length === 0) return null;
  const pool = all.filter((q) => !usedIds.has(q.id));
  const candidates = pool.length > 0 ? pool : all;
  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  return pick;
}
