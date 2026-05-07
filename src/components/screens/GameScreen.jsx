import { useState } from 'react';
import Board from '../game/Board.jsx';
import GameHUD from '../game/GameHUD.jsx';
import QuestionCard from '../game/QuestionCard.jsx';
import Dice from '../common/Dice.jsx';
import CardStack from '../common/CardStack.jsx';
import { CATEGORIES } from '../../constants/categories.js';
import { CENTER_INDEX } from '../../constants/board.js';
import { useBoard } from '../../hooks/useBoard.js';
import { useQuestion } from '../../hooks/useQuestion.js';
import {
  getCategoryAtPosition,
  isSedePosition,
  missingCategories
} from '../../utils/index.js';

// Pantalla principal del juego. Orquesta dado, tablero, preguntas y turnos.
//
// Fases internas (todas dentro de phase==='playing' del juego global):
//   - 'awaiting-dice'    : esperando que el jugador tire el dado
//   - 'awaiting-cell'    : se ha tirado, hay que elegir casilla
//   - 'awaiting-category': el jugador está en el centro y elige categoría
//   - 'awaiting-question': hay una pregunta activa
export default function GameScreen({ game }) {
  const {
    players,
    currentPlayer,
    positions,
    quesitos,
    usedQuestionIds,
    lastDice,
    rollDiceAction,
    moveCurrentPlayerTo,
    moveCurrentPlayerToCenter,
    markQuestionUsed,
    grantQuesitoToCurrent,
    passTurn,
    mode
  } = game;

  const currentPos = currentPlayer ? positions[currentPlayer.id] ?? 0 : 0;
  const isAtCenter = currentPos === CENTER_INDEX;
  const { reachable } = useBoard(currentPos, lastDice);
  const question = useQuestion();

  // Subfase local
  const [step, setStep] = useState(isAtCenter ? 'awaiting-category' : 'awaiting-dice');

  // Sincroniza si cambia el jugador
  // (al pasar turno reseteamos siempre a awaiting-dice o awaiting-category)
  const ensureStepForCurrent = () => {
    if (isAtCenter && step !== 'awaiting-category' && step !== 'awaiting-question') {
      setStep('awaiting-category');
    } else if (!isAtCenter && step === 'awaiting-category') {
      setStep('awaiting-dice');
    }
  };
  ensureStepForCurrent();

  const handleRoll = () => {
    rollDiceAction();
    setStep('awaiting-cell');
  };

  const handleCellClick = (idx) => {
    if (step !== 'awaiting-cell') return;
    if (!reachable.includes(idx)) return;
    moveCurrentPlayerTo(idx);
    const catId = getCategoryAtPosition(idx);
    if (catId) {
      const q = question.draw(catId, usedQuestionIds);
      if (q) markQuestionUsed(q.id);
      setStep('awaiting-question');
    } else {
      setStep('awaiting-dice');
    }
  };

  const handleCategoryStack = (catId) => {
    if (step !== 'awaiting-category') return;
    // Solo categorías aún no ganadas
    const missing = missingCategories(quesitos[currentPlayer?.id] ?? []);
    if (!missing.includes(catId)) return;
    const q = question.draw(catId, usedQuestionIds);
    if (q) markQuestionUsed(q.id);
    setStep('awaiting-question');
  };

  const handleCorrect = () => {
    const cat = question.activeCategory;
    question.clear();

    if (isAtCenter) {
      // En el centro: solo se gana si acierta la categoría que le falta;
      // si acierta y le quedaba una sola → grantQuesitoToCurrent + victoria.
      grantQuesitoToCurrent(cat);
      // Si tras este acierto aún no ha ganado, sigue eligiendo categoría
      setStep('awaiting-category');
      return;
    }

    // Si era sede: gana quesito (si procede) y vuelve a tirar
    if (isSedePosition(currentPos)) {
      grantQuesitoToCurrent(cat);
    }

    // Si ya tiene todos los quesitos del modo: mover al centro
    const owned = quesitos[currentPlayer?.id] ?? [];
    const willHaveAll = new Set([...owned, cat]).size >= (mode === 'rapid' ? 4 : 6);
    if (willHaveAll && isSedePosition(currentPos)) {
      moveCurrentPlayerToCenter();
      setStep('awaiting-category');
      return;
    }

    // Sigue tirando
    setStep('awaiting-dice');
  };

  const handleWrong = () => {
    question.clear();
    if (isAtCenter) {
      // En el centro, fallo → pasa turno
      passTurn();
      setStep('awaiting-dice');
      return;
    }
    passTurn();
    setStep('awaiting-dice');
  };

  // Categorías clickables como stacks: solo en awaiting-category;
  // las "bloqueadas" (ya conseguidas) salen deshabilitadas.
  const owned = quesitos[currentPlayer?.id] ?? [];

  return (
    <main className="game">
      <GameHUD
        players={players}
        currentPlayerId={currentPlayer?.id}
        quesitos={quesitos}
      />

      <div className="game__center">
        <Board
          players={players}
          playerPositions={positions}
          reachable={step === 'awaiting-cell' ? reachable : []}
          onCellClick={handleCellClick}
        />
      </div>

      <aside className="game__side">
        <div className="game__turn">
          <span>Turno de:</span>{' '}
          <strong style={{ color: currentPlayer?.color }}>{currentPlayer?.name}</strong>
        </div>

        <Dice
          onRoll={handleRoll}
          value={lastDice}
          disabled={step !== 'awaiting-dice'}
        />
        {step === 'awaiting-cell' && (
          <p className="game__hint">Pulsa una casilla resaltada para mover.</p>
        )}

        {step === 'awaiting-category' && (
          <>
            <p className="game__hint">Estás en el centro: elige categoría.</p>
            <div className="card-stacks">
              {CATEGORIES.map((c) => (
                <CardStack
                  key={c.id}
                  category={c.id}
                  label={c.name}
                  icon={c.icon}
                  color={c.color}
                  disabled={owned.includes(c.id)}
                  onClick={handleCategoryStack}
                />
              ))}
            </div>
          </>
        )}

        {step === 'awaiting-question' && question.activeQuestion && (
          <QuestionCard
            question={question.activeQuestion}
            categoryId={question.activeCategory}
            revealed={question.revealed}
            onReveal={question.reveal}
            onCorrect={handleCorrect}
            onWrong={handleWrong}
          />
        )}
      </aside>
    </main>
  );
}
