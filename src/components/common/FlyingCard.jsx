// Carta levantada del stack. Se muestra como overlay centrado.
//   - Animación de entrada: sube desde el panel (translateY + rotación)
//   - Cara A: pregunta
//   - Cara B (tras revelar): respuesta + tick/cruz
//   - El cambio de cara usa un flip 3D (rotateY)
//
// Props:
//   - color, icon, label
//   - question: { question, answer }
//   - revealed: boolean
//   - onReveal, onCorrect, onWrong
export default function FlyingCard({
  color,
  icon,
  label,
  question,
  revealed,
  onReveal,
  onCorrect,
  onWrong
}) {
  if (!question) return null;
  return (
    <div className="flying-card-backdrop">
      <div className="flying-card" style={{ '--cat-color': color }}>
        <div className={`flying-card__inner ${revealed ? 'is-flipped' : ''}`}>
          {/* Cara frontal: pregunta */}
          <div className="flying-card__face flying-card__face--front">
            <header className="flying-card__head">
              <span className="flying-card__icon">{icon}</span>
              <span className="flying-card__label">{label}</span>
            </header>
            <div className="flying-card__body">
              <p className="flying-card__text">{question.question}</p>
            </div>
            <footer className="flying-card__foot">
              <button type="button" className="btn btn--primary" onClick={onReveal}>
                Revelar respuesta
              </button>
            </footer>
          </div>

          {/* Cara trasera: respuesta */}
          <div className="flying-card__face flying-card__face--back">
            <header className="flying-card__head">
              <span className="flying-card__icon">{icon}</span>
              <span className="flying-card__label">{label}</span>
            </header>
            <div className="flying-card__body">
              <span className="flying-card__answer-tag">RESPUESTA</span>
              <p className="flying-card__text">{question.answer}</p>
            </div>
            <footer className="flying-card__foot">
              <div className="flying-card__choices">
                <button type="button" className="btn btn--ok" onClick={onCorrect}>
                  ✓ Acierto
                </button>
                <button type="button" className="btn btn--ko" onClick={onWrong}>
                  ✗ Fallo
                </button>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
