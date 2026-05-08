import PlayerMarker from '../common/PlayerMarker.jsx';
import { GAME_MODES } from '../../constants/gameConfig.js';

// HUD de las cuatro esquinas con un PlayerMarker por jugador.
const CORNERS = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

export default function GameHUD({
  players = [],
  currentPlayerId,
  quesitos = {},
  mode = 'classic',
  waitingPlayers = {}
}) {
  const modeDef = GAME_MODES[mode.toUpperCase()] ?? GAME_MODES.CLASSIC;
  const slots = modeDef.quesitosToWin;

  return (
    <div className="game-hud">
      {players.map((p, i) => (
        <PlayerMarker
          key={p.id}
          name={p.name}
          color={p.color}
          slots={slots}
          quesitos={quesitos[p.id] ?? []}
          isCurrentTurn={p.id === currentPlayerId}
          isWaitingFinal={Boolean(waitingPlayers[p.id])}
          corner={CORNERS[i] ?? 'top-left'}
        />
      ))}
    </div>
  );
}
