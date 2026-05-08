// Stack de cartas físicas: 3 capas que simulan un mazo apilado.
// Cada carta es blanca con una franja superior del color de la categoría
// y el icono + nombre centrados.
export default function CardStack({
  category,
  icon,
  color,
  label,
  onClick,
  disabled = false
}) {
  return (
    <div
      className={`card-stack ${disabled ? 'is-disabled' : ''}`}
      style={{ '--cat-color': color }}
      role="group"
      aria-label={`Cartas de ${label}`}
    >
      <div className="card-stack__sheet card-stack__sheet--back" aria-hidden="true" />
      <div className="card-stack__sheet card-stack__sheet--mid" aria-hidden="true" />
      <button
        type="button"
        className="card-stack__sheet card-stack__sheet--front"
        onClick={() => !disabled && onClick?.(category)}
        disabled={disabled}
      >
        <span className="card-stack__body">
          <span className="card-stack__icon" aria-hidden="true">{icon}</span>
          <span className="card-stack__label">{label}</span>
        </span>
      </button>
    </div>
  );
}
