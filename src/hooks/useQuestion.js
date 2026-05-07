import { useCallback, useState } from 'react';
import { getRandomQuestion } from '../utils/questionUtils.js';

// Estado de la pregunta actual: cuál se muestra y si está revelada.
export function useQuestion() {
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [revealed, setRevealed] = useState(false);

  // Saca una nueva pregunta de la categoría dada, evitando las usadas
  const draw = useCallback((categoryId, usedIds) => {
    const q = getRandomQuestion(categoryId, usedIds);
    setActiveQuestion(q);
    setActiveCategory(categoryId);
    setRevealed(false);
    return q;
  }, []);

  const reveal = useCallback(() => setRevealed(true), []);

  const clear = useCallback(() => {
    setActiveQuestion(null);
    setActiveCategory(null);
    setRevealed(false);
  }, []);

  return {
    activeQuestion,
    activeCategory,
    revealed,
    draw,
    reveal,
    clear
  };
}
