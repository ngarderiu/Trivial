import { CATEGORIES } from '../../constants/categories.js';

// Tarjeta del jugador (esquina del HUD).
// Muestra nombre, color y los quesitos ganados.
export default function PlayerMarker({
  name,
  color,
  quesitos = [],
  isCurrentTurn = false,
  corner = 'top-left'
}) {
  const owned = new Set(quesitos);

  return (
    <div
      className={`player-marker corner-${corner} ${isCurrentTurn ? 'is-active' : ''}`}
      style={{ borderColor: color }}
    >
      <div className="player-marker__head" style={{ background: color }}>
        <span className="player-marker__name">{name}</span>
      </div>
      <ul className="player-marker__quesitos">
        {CATEGORIES.map((cat) => (
          <li
            key={cat.id}
            className={`quesito ${owned.has(cat.id) ? 'is-owned' : ''}`}
            style={{ background: owned.has(cat.id) ? cat.color : 'transparent', borderColor: cat.color }}
            title={cat.name}
          >
            {owned.has(cat.id) ? cat.icon : ''}
          </li>
        ))}
      </ul>
    </div>
  );
}
