// Carta vertical en su stack (representación cerrada con icono y nombre).
// Reutilizable como pieza visual y como botón clickable.
export default function CardStack({ category, icon, color, label, onClick, disabled = false }) {
  return (
    <button
      type="button"
      className={`card-stack ${disabled ? 'is-disabled' : ''}`}
      style={{ '--cat-color': color }}
      onClick={() => !disabled && onClick?.(category)}
      aria-label={`Carta de ${label}`}
      disabled={disabled}
    >
      <span className="card-stack__sheet card-stack__sheet--3" />
      <span className="card-stack__sheet card-stack__sheet--2" />
      <span className="card-stack__sheet card-stack__sheet--1">
        <span className="card-stack__icon">{icon}</span>
        <span className="card-stack__label">{label}</span>
      </span>
    </button>
  );
}
