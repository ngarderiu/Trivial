import QuesitoWheel from '../common/QuesitoWheel.jsx';

// Podio simple del ganador y resto de jugadores.
export default function MiniPodio({ winner, players = [], quesitos = {}, slots = 6 }) {
  const others = players.filter((p) => p.id !== winner?.id);
  return (
    <div className="podio">
      {winner && (
        <div className="podio__winner" style={{ borderColor: winner.color }}>
          <div className="podio__crown">👑</div>
          <div className="podio__name" style={{ background: winner.color }}>
            {winner.name}
          </div>
          <div className="podio__wheel">
            <QuesitoWheel
              size={120}
              slots={slots}
              earned={quesitos[winner.id] ?? []}
              rimColor={winner.color}
            />
          </div>
        </div>
      )}
      <div className="podio__others">
        {others.map((p) => (
          <div key={p.id} className="podio__other" style={{ borderColor: p.color }}>
            <span className="podio__other-name" style={{ background: p.color }}>{p.name}</span>
            <QuesitoWheel
              size={56}
              slots={slots}
              earned={quesitos[p.id] ?? []}
              rimColor={p.color}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
