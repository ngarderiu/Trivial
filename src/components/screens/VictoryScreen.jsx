import MiniPodio from '../game/MiniPodio.jsx';
import { GAME_MODES } from '../../constants/gameConfig.js';

export default function VictoryScreen({ winner, players, quesitos, mode = 'classic', onPlayAgain }) {
  const modeDef = GAME_MODES[mode.toUpperCase()] ?? GAME_MODES.CLASSIC;
  return (
    <main className="victory">
      <h1 className="victory__title">¡Victoria!</h1>
      <MiniPodio winner={winner} players={players} quesitos={quesitos} slots={modeDef.quesitosToWin} />
      <button type="button" className="btn btn--big btn--primary" onClick={onPlayAgain}>
        Jugar otra partida
      </button>
    </main>
  );
}
