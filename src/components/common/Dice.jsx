import { useState } from 'react';

// Dado interactivo. Muestra el último valor; al pulsar, hace una breve
// animación visual y notifica con onRoll(value).
export default function Dice({ disabled = false, onRoll, value = null }) {
  const [rolling, setRolling] = useState(false);

  const handleClick = () => {
    if (disabled || rolling) return;
    setRolling(true);
    setTimeout(() => {
      setRolling(false);
      onRoll?.();
    }, 450);
  };

  return (
    <button
      type="button"
      className={`dice ${rolling ? 'is-rolling' : ''} ${disabled ? 'is-disabled' : ''}`}
      onClick={handleClick}
      aria-label="Tirar dado"
      disabled={disabled}
    >
      <span className="dice-face">{rolling ? '?' : value ?? '🎲'}</span>
    </button>
  );
}
