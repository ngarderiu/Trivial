import QuesitoWheel from './QuesitoWheel.jsx';

// Marcador de jugador. Muestra nombre, color y la rueda de quesitos.
// `isWaitingFinal` indica que ya tiene todos los quesitos y está esperando
// la pregunta final en el centro: añade un indicador visual.
export default function PlayerMarker({
  name,
  color,
  quesitos = [],
  slots = 6,
  isCurrentTurn = false,
  isWaitingFinal = false,
  corner = 'top-left'
}) {
  return (
    <div
      className={[
        'player-marker',
        `corner-${corner}`,
        isCurrentTurn ? 'is-active' : '',
        isWaitingFinal ? 'is-waiting' : ''
      ].filter(Boolean).join(' ')}
      style={{ borderColor: color, color, '--player-color': color }}
    >
      <div className="player-marker__head" style={{ background: color }}>
        <span className="player-marker__name">{name}</span>
        {isWaitingFinal && (
          <span className="player-marker__badge" title="Esperando pregunta final">
            ★
          </span>
        )}
      </div>
      <div className="player-marker__wheel">
        <QuesitoWheel size={72} slots={slots} earned={quesitos} rimColor={color} />
      </div>
    </div>
  );
}
