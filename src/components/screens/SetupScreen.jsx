import { useState } from 'react';
import { GAME_MODES, MAX_PLAYERS, MIN_PLAYERS, PLAYER_COLORS } from '../../constants/gameConfig.js';

// Pantalla de configuración inicial: nombres + modo.
export default function SetupScreen({ onStart }) {
  const [names, setNames] = useState(Array(MAX_PLAYERS).fill(''));
  const [active, setActive] = useState(MAX_PLAYERS);
  const [mode, setMode] = useState(GAME_MODES.CLASSIC.id);

  const updateName = (i, value) => {
    setNames((prev) => prev.map((n, idx) => (idx === i ? value : n)));
  };

  const handleStart = () => {
    const list = names.slice(0, active);
    onStart?.(list, mode);
  };

  return (
    <main className="setup">
      <h1 className="setup__title">Trivial Pursuit</h1>

      <section className="setup__block">
        <h2>Equipos ({active})</h2>
        <div className="setup__count">
          {[MIN_PLAYERS, 3, MAX_PLAYERS].map((n) => (
            <button
              key={n}
              type="button"
              className={`btn ${active === n ? 'btn--primary' : ''}`}
              onClick={() => setActive(n)}
            >
              {n}
            </button>
          ))}
        </div>

        <ul className="setup__players">
          {Array.from({ length: active }).map((_, i) => (
            <li key={i} className="setup__player">
              <span className="setup__color" style={{ background: PLAYER_COLORS[i].value }} />
              <input
                type="text"
                placeholder={`Equipo ${PLAYER_COLORS[i].label}`}
                value={names[i]}
                onChange={(e) => updateName(i, e.target.value)}
                maxLength={20}
              />
            </li>
          ))}
        </ul>
      </section>

      <section className="setup__block">
        <h2>Modo de juego</h2>
        <div className="setup__modes">
          {Object.values(GAME_MODES).map((m) => (
            <button
              key={m.id}
              type="button"
              className={`btn ${mode === m.id ? 'btn--primary' : ''}`}
              onClick={() => setMode(m.id)}
            >
              {m.label} ({m.quesitosToWin})
            </button>
          ))}
        </div>
      </section>

      <button type="button" className="btn btn--big btn--primary" onClick={handleStart}>
        Empezar partida
      </button>
    </main>
  );
}
