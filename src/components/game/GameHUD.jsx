import PlayerMarker from '../common/PlayerMarker.jsx';

// HUD de las cuatro esquinas con un PlayerMarker por jugador.
const CORNERS = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

export default function GameHUD({ players = [], currentPlayerId, quesitos = {} }) {
  return (
    <div className="game-hud">
      {players.map((p, i) => (
        <PlayerMarker
          key={p.id}
          name={p.name}
          color={p.color}
          quesitos={quesitos[p.id] ?? []}
          isCurrentTurn={p.id === currentPlayerId}
          corner={CORNERS[i] ?? 'top-left'}
        />
      ))}
    </div>
  );
}
