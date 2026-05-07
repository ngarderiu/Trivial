import { CATEGORIES } from '../../constants/categories.js';

// Podio simple del ganador y resto de jugadores.
export default function MiniPodio({ winner, players = [], quesitos = {} }) {
  const others = players.filter((p) => p.id !== winner?.id);
  return (
    <div className="podio">
      {winner && (
        <div className="podio__winner" style={{ borderColor: winner.color }}>
          <div className="podio__crown">👑</div>
          <div className="podio__name" style={{ background: winner.color }}>
            {winner.name}
          </div>
          <ul className="podio__quesitos">
            {CATEGORIES.map((c) => {
              const owned = (quesitos[winner.id] ?? []).includes(c.id);
              return (
                <li
                  key={c.id}
                  className={owned ? 'is-owned' : ''}
                  style={{ background: owned ? c.color : 'transparent', borderColor: c.color }}
                >
                  {owned ? c.icon : ''}
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <div className="podio__others">
        {others.map((p) => (
          <div key={p.id} className="podio__other" style={{ borderColor: p.color }}>
            <span className="podio__other-name" style={{ background: p.color }}>{p.name}</span>
            <span className="podio__other-count">
              {(quesitos[p.id] ?? []).length} quesitos
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
