import QuesitoWheel from './QuesitoWheel.jsx';

// Marcador de jugador. Muestra nombre, color y la rueda de quesitos
// con los huecos rellenos según el progreso del jugador.
export default function PlayerMarker({
  name,
  color,
  quesitos = [],
  slots = 6,
  isCurrentTurn = false,
  corner = 'top-left'
}) {
  return (
    <div
      className={`player-marker corner-${corner} ${isCurrentTurn ? 'is-active' : ''}`}
      style={{ borderColor: color, color, '--player-color': color }}
    >
      <div className="player-marker__head" style={{ background: color }}>
        <span className="player-marker__name">{name}</span>
      </div>
      <div className="player-marker__wheel">
        <QuesitoWheel size={72} slots={slots} earned={quesitos} rimColor={color} />
      </div>
    </div>
  );
}
