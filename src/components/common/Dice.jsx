import { useEffect, useRef, useState } from 'react';

// Dado siempre visible. Al pulsar:
//   1. Se anima (rotación + rebote) y los números cambian rápido
//   2. Al detenerse, queda mostrando el valor real
//   3. Permanece deshabilitado hasta que el padre cambie disabled=false
//
// Props:
//   - disabled: bloquea interacción (p. ej. mientras se elige casilla)
//   - value: número actual visible cuando no está animando
//   - onRoll(): callback cuando termina la animación
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

    // Cambio rápido de números durante la animación
    tickerRef.current = setInterval(() => {
      setFace(Math.floor(Math.random() * 6) + 1);
    }, 70);

    setTimeout(() => {
      clearInterval(tickerRef.current);
      setRolling(false);
      onRoll?.();
    }, 900);
  };

  return (
    <div className="dice-wrap">
      <button
        type="button"
        className={`dice ${rolling ? 'is-rolling' : ''} ${disabled ? 'is-disabled' : ''}`}
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
