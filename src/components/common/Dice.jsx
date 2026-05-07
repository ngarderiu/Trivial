import { useEffect, useRef, useState } from 'react';

// Dado siempre visible. Al hacer click:
//   1. Vuela hacia la izquierda (sobre el tablero), girando y rebotando
//   2. Se queda flotando ahí mientras los números cambian rápido
//   3. Detiene el ticker, queda mostrando el resultado ~1 s
//   4. Vuelve a su posición y se desactiva hasta el siguiente turno
//
// Total: ~2,8 s de animación.
//
// Props:
//   - disabled, value, onRoll() (igual que antes)
const FLIGHT_MS = 700;
const HOVER_MS = 1100;
const RETURN_MS = 700;
const TOTAL_MS = FLIGHT_MS + HOVER_MS + RETURN_MS;

export default function Dice({ disabled = false, onRoll, value = null }) {
  const [rolling, setRolling] = useState(false);
  const [face, setFace] = useState(value);
  const tickerRef = useRef(null);

  useEffect(() => {
    if (!rolling) setFace(value);
  }, [value, rolling]);

  useEffect(() => () => clearInterval(tickerRef.current), []);

  const handleClick = () => {
    if (disabled || rolling) return;
    setRolling(true);

    // Ticker rápido durante el vuelo + flotación, se detiene antes del retorno
    tickerRef.current = setInterval(() => {
      setFace(Math.floor(Math.random() * 6) + 1);
    }, 70);
    setTimeout(() => clearInterval(tickerRef.current), FLIGHT_MS + HOVER_MS - 200);

    // Al final, notifica al juego (que decidirá el valor real)
    setTimeout(() => {
      setRolling(false);
      onRoll?.();
    }, TOTAL_MS);
  };

  return (
    <div className="dice-wrap">
      <button
        type="button"
        className={`dice ${rolling ? 'is-flying' : ''} ${disabled ? 'is-disabled' : ''}`}
        onClick={handleClick}
        aria-label="Tirar dado"
        disabled={disabled || rolling}
      >
        <span className="dice-face">{face ?? '🎲'}</span>
      </button>
      <p className="dice-hint">
        {rolling ? 'Tirando…' : disabled ? 'Espera tu turno' : '¡Pulsa para tirar!'}
      </p>
    </div>
  );
}
