import { useState } from 'react';
import Board from '../game/Board.jsx';
import GameHUD from '../game/GameHUD.jsx';
import CardStackArea from '../game/CardStackArea.jsx';
import Dice from '../common/Dice.jsx';
import QuesitoWheel from '../common/QuesitoWheel.jsx';
import { CENTER_INDEX } from '../../constants/board.js';
import { GAME_MODES } from '../../constants/gameConfig.js';
import { useBoard } from '../../hooks/useBoard.js';
import { useQuestion } from '../../hooks/useQuestion.js';
import {
  getCategoryAtPosition,
  isSedePosition,
  missingCategories
} from '../../utils/index.js';

// Pantalla principal del juego.
// Layout:
//   - izquierda: tablero (65%)
//   - derecha:   dado arriba, cartas verticales en medio, info turno abajo
//
// Subfases internas:
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

  const [step, setStep] = useState(isAtCenter ? 'awaiting-category' : 'awaiting-dice');

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
      grantQuesitoToCurrent(cat);
      setStep('awaiting-category');
      return;
    }

    if (isSedePosition(currentPos)) {
      grantQuesitoToCurrent(cat);
    }

    const owned = quesitos[currentPlayer?.id] ?? [];
    const willHaveAll = new Set([...owned, cat]).size >= (mode === 'rapid' ? 4 : 6);
    if (willHaveAll && isSedePosition(currentPos)) {
      moveCurrentPlayerToCenter();
      setStep('awaiting-category');
      return;
    }
    setStep('awaiting-dice');
  };

  const handleWrong = () => {
    question.clear();
    passTurn();
    setStep('awaiting-dice');
  };

  const owned = quesitos[currentPlayer?.id] ?? [];
  const stacksClickable = step === 'awaiting-category'
    ? missingCategories(owned)
    : [];

  const modeDef = GAME_MODES[mode.toUpperCase()] ?? GAME_MODES.CLASSIC;
  const slots = modeDef.quesitosToWin;

  const renderToken = (player) => (
    <QuesitoWheel
      size={32}
      slots={slots}
      earned={quesitos[player.id] ?? []}
      rimColor={player.color}
      asSvg
    />
  );

  return (
    <main className="game">
      <section className="game__board">
        <GameHUD
          players={players}
          currentPlayerId={currentPlayer?.id}
          quesitos={quesitos}
          mode={mode}
        />
        <div className="game__board-dice">
          <Dice
            onRoll={handleRoll}
            value={lastDice}
            disabled={step !== 'awaiting-dice'}
          />
        </div>
        <Board
          players={players}
          playerPositions={positions}
          reachable={step === 'awaiting-cell' ? reachable : []}
          onCellClick={handleCellClick}
          renderToken={renderToken}
        />
      </section>

      <aside className="game__panel">
        <div className="game__panel-block game__panel-block--cards">
          <CardStackArea
            clickableCategories={stacksClickable}
            onPickCategory={handleCategoryStack}
            activeCategory={question.activeCategory}
            question={question.activeQuestion}
            revealed={question.revealed}
            onReveal={question.reveal}
            onCorrect={handleCorrect}
            onWrong={handleWrong}
          />
        </div>

        <div className="game__panel-block game__panel-block--turn">
          <div className="game__turn">
            <span>Turno de:</span>{' '}
            <strong style={{ color: currentPlayer?.color }}>{currentPlayer?.name}</strong>
          </div>
          {step === 'awaiting-cell' && (
            <p className="game__hint">Elige una casilla resaltada.</p>
          )}
          {step === 'awaiting-category' && (
            <p className="game__hint">Estás en el centro: elige una categoría.</p>
          )}
          {step === 'awaiting-dice' && (
            <p className="game__hint">¡Tira el dado!</p>
          )}
        </div>
      </aside>
    </main>
  );
}
