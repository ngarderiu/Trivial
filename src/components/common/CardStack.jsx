// Stack de cartas físicas apiladas (efecto 3D). 3 capas:
//   - fondo (más desplazada, opacidad baja)
//   - media (desplazamiento intermedio)
//   - frente (clickable, con icono y nombre)
//
// La altura del stack la fija el CSS (.card-stack { height: ... }).
export default function CardStack({
  category,
  icon,
  color,
  label,
  onClick,
  disabled = false
}) {
  const handleClick = () => {
    if (disabled) return;
    onClick?.(category);
  };

  return (
    <div
      className={`card-stack ${disabled ? 'is-disabled' : ''}`}
      style={{ '--cat-color': color }}
      role="group"
      aria-label={`Cartas de ${label}`}
    >
      <div className="card-stack__sheet card-stack__sheet--back" />
      <div className="card-stack__sheet card-stack__sheet--mid" />
      <button
        type="button"
        className="card-stack__sheet card-stack__sheet--front"
        onClick={handleClick}
        disabled={disabled}
      >
        <span className="card-stack__icon" aria-hidden="true">{icon}</span>
        <span className="card-stack__label">{label}</span>
      </button>
    </div>
  );
}
