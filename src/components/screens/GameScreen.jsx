import { useEffect, useState } from 'react';
import Board from '../game/Board.jsx';
import GameHUD from '../game/GameHUD.jsx';
import CardStackArea from '../game/CardStackArea.jsx';
import Dice from '../common/Dice.jsx';
import QuesitoWheel from '../common/QuesitoWheel.jsx';
import { CENTER_INDEX, BOARD_POSITIONS } from '../../constants/board.js';
import { CATEGORY_IDS } from '../../constants/categories.js';
import { GAME_MODES } from '../../constants/gameConfig.js';
import { useBoard } from '../../hooks/useBoard.js';
import { useQuestion } from '../../hooks/useQuestion.js';
import {
  canEarnQuesito,
  getCategoryAtPosition,
  isSedePosition,
  missingCategories
} from '../../utils/index.js';

// Pantalla principal del juego.
//
// Subfases internas (step):
//   - 'awaiting-dice'           : tirar dado (jugador en anillo)
//   - 'awaiting-cell'           : elegir casilla tras tirar
//   - 'awaiting-question'       : pregunta tras movimiento normal
//   - 'awaiting-bonus-sede'     : racha de 3 → elegir sede para bonus
//   - 'awaiting-final-question' : jugador en el centro con todos los
//                                 quesitos; pregunta aleatoria final
const STREAK_TRIGGER = 3;

export default function GameScreen({ game }) {
  const {
    players,
    currentPlayer,
    positions,
    quesitos,
    streaks,
    usedQuestionIds,
    lastDice,
    rollDiceAction,
    moveCurrentPlayerTo,
    moveCurrentPlayerToCenter,
    markQuestionUsed,
    grantQuesitoToCurrent,
    incrementStreak,
    resetStreak,
    declareVictory,
    isWinnerCandidate,
    passTurn,
    mode
  } = game;

  const currentPos = currentPlayer ? positions[currentPlayer.id] ?? 0 : 0;
  const isAtCenter = currentPos === CENTER_INDEX;
  const { reachable } = useBoard(currentPos, lastDice);
  const question = useQuestion();

  const [step, setStep] = useState('awaiting-dice');

  const modeDef = GAME_MODES[mode.toUpperCase()] ?? GAME_MODES.CLASSIC;
  const slots = modeDef.quesitosToWin;

  // Si el jugador actual está en el centro y le toca → pregunta final
  // automática (categoría aleatoria).
  useEffect(() => {
    if (!currentPlayer) return;
    if (isAtCenter && !question.activeQuestion && step !== 'awaiting-final-question') {
      const randomCat = CATEGORY_IDS[Math.floor(Math.random() * CATEGORY_IDS.length)];
      const q = question.draw(randomCat, usedQuestionIds);
      if (q) markQuestionUsed(q.id);
      setStep('awaiting-final-question');
    } else if (!isAtCenter && step === 'awaiting-final-question') {
      setStep('awaiting-dice');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlayer?.id, isAtCenter]);

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

  // Selección de sede al activarse la racha bonus
  const handleBonusSedePick = (catId) => {
    if (step !== 'awaiting-bonus-sede') return;
    const playerId = currentPlayer?.id;
    const owned = quesitos[playerId] ?? [];
    if (owned.includes(catId)) return;

    const sedeIndex = BOARD_POSITIONS.findIndex(
      (c) => c.isHQ && c.category === catId
    );
    if (sedeIndex < 0) return;
    moveCurrentPlayerTo(sedeIndex);
    const q = question.draw(catId, usedQuestionIds);
    if (q) markQuestionUsed(q.id);
    setStep('awaiting-question');
  };

  const handleCorrect = () => {
    const cat = question.activeCategory;
    const playerId = currentPlayer?.id;
    question.clear();

    // 1) Pregunta final en el centro → victoria
    if (step === 'awaiting-final-question') {
      declareVictory(playerId);
      return;
    }

    const owned = quesitos[playerId] ?? [];
    const onSede = isSedePosition(currentPos);

    // 2) En SEDE: nunca activa la racha bonus. Siempre resetea el contador
    //    (gane o no quesito). El bonus solo se activa con aciertos en
    //    casillas normales.
    if (onSede) {
      if (canEarnQuesito(owned, cat, mode)) {
        // Gana quesito → grantQuesitoToCurrent ya resetea racha por dentro
        grantQuesitoToCurrent(cat);
        const willHaveAll =
          new Set([...owned, cat]).size >= modeDef.quesitosToWin;
        if (willHaveAll) {
          moveCurrentPlayerToCenter();
          passTurn();
          setStep('awaiting-dice');
          return;
        }
        passTurn();
      } else {
        // Sede con quesito ya conseguido: acierto sin premio, racha reset.
        resetStreak(playerId);
      }
      setStep('awaiting-dice');
      return;
    }

    // 3) Casilla NORMAL: incrementa la racha y puede disparar el bonus.
    const newStreak = (streaks[playerId] ?? 0) + 1;
    incrementStreak(playerId);
    if (newStreak >= STREAK_TRIGGER) {
      setStep('awaiting-bonus-sede');
      return;
    }
    setStep('awaiting-dice');
  };

  const handleWrong = () => {
    const playerId = currentPlayer?.id;
    question.clear();
    resetStreak(playerId);
    passTurn();
    setStep('awaiting-dice');
  };

  const ownedCurrent = quesitos[currentPlayer?.id] ?? [];
  const stacksClickable =
    step === 'awaiting-bonus-sede' ? missingCategories(ownedCurrent) : [];

  const renderToken = (player) => (
    <QuesitoWheel
      size={32}
      slots={slots}
      earned={quesitos[player.id] ?? []}
      rimColor={player.color}
      asSvg
    />
  );

  // Lista de jugadores con flag "esperando ronda final"
  const waitingPlayers = players.reduce((acc, p) => {
    acc[p.id] = positions[p.id] === CENTER_INDEX && isWinnerCandidate(p.id);
    return acc;
  }, {});

  const currentStreak = streaks[currentPlayer?.id] ?? 0;

  return (
    <main className="game">
      <section className="game__board">
        <GameHUD
          players={players}
          currentPlayerId={currentPlayer?.id}
          quesitos={quesitos}
          mode={mode}
          waitingPlayers={waitingPlayers}
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
            onPickCategory={handleBonusSedePick}
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
          {step === 'awaiting-bonus-sede' && (
            <p className="game__hint game__hint--bonus">
              ¡Racha de {STREAK_TRIGGER}! Elige una sede para ir directamente.
            </p>
          )}
          {step === 'awaiting-final-question' && (
            <p className="game__hint game__hint--final">
              ¡Pregunta final! Acierta para ganar la partida.
            </p>
          )}
          {step === 'awaiting-dice' && !isAtCenter && (
            <p className="game__hint">
              {currentStreak > 0
                ? `¡Racha ${currentStreak}/${STREAK_TRIGGER}! Tira el dado.`
                : '¡Tira el dado!'}
            </p>
          )}
        </div>
      </aside>
    </main>
  );
}
