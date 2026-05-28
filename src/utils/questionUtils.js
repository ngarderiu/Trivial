// Funciones puras de preguntas. Lectura de JSON y selección aleatoria.

import geografia from '../data/questions/geografia.json';
import cine_series from '../data/questions/cine_series.json';
import historia from '../data/questions/historia.json';
import musica from '../data/questions/musica.json';
import ciencia from '../data/questions/ciencia.json';
import deporte from '../data/questions/deporte.json';
import banco20 from '../data/questions/banco_20.json';

// Normaliza una pregunta del formato banco_20 al formato interno de la app.
// hasPhoto+photoFile → image path; el campo comment se preserva tal cual.
function normalizeBanco20Question(q) {
  const normalized = { id: q.id, question: q.question, answer: q.answer };
  if (q.hasPhoto && q.photoFile) {
    normalized.image = `/questions/${q.photoFile}`;
  }
  if (q.comment) {
    normalized.comment = q.comment;
  }
  return normalized;
}

// Mapeo de claves uppercase del banco_20 a los IDs de categoría de la app
const BANCO20_KEY_MAP = {
  DEPORTE: 'deporte',
  HISTORIA: 'historia',
  CINE_SERIES: 'cine_series',
  MUSICA: 'musica',
  GEOGRAFIA: 'geografia',
  CIENCIA: 'ciencia'
};

// Diccionario categoryId → banco de preguntas (base + banco_20 combinados)
const BANKS = (() => {
  const base = { geografia, cine_series, historia, musica, ciencia, deporte };
  const banks = {};

  for (const [categoryId, data] of Object.entries(base)) {
    banks[categoryId] = { ...data, questions: [...data.questions] };
  }

  for (const [banco20Key, categoryId] of Object.entries(BANCO20_KEY_MAP)) {
    const extra = (banco20.categories[banco20Key] ?? []).map(normalizeBanco20Question);
    if (banks[categoryId]) {
      banks[categoryId].questions.push(...extra);
    }
  }

  return banks;
})();

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
