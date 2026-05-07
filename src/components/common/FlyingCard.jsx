// Carta que "vuela" desde su stack. Tiene 3 fases visuales:
//   1. Entra (sube + flip 180º) y muestra la pregunta
//   2. Al revelar, la cara cambia a respuesta + tick/cruz
//   3. Al pulsar tick/cruz, se desmonta (animación opcional vía CSS)
//
// Props:
//   - color, icon, label: estilo de la categoría
//   - question: { question, answer }
//   - revealed: boolean
//   - onReveal, onCorrect, onWrong: callbacks
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
    <div className="flying-card" style={{ '--cat-color': color }}>
      <div className={`flying-card__inner ${revealed ? 'is-answer' : 'is-question'}`}>
        <header className="flying-card__head">
          <span className="flying-card__icon">{icon}</span>
          <span className="flying-card__label">{label}</span>
        </header>

        <div className="flying-card__body">
          <p className="flying-card__text">
            {revealed ? question.answer : question.question}
          </p>
          {revealed && (
            <span className="flying-card__answer-tag">RESPUESTA</span>
          )}
        </div>

        <footer className="flying-card__foot">
          {!revealed ? (
            <button type="button" className="btn btn--primary" onClick={onReveal}>
              Revelar respuesta
            </button>
          ) : (
            <div className="flying-card__choices">
              <button type="button" className="btn btn--ok" onClick={onCorrect}>
                ✓ Acierto
              </button>
              <button type="button" className="btn btn--ko" onClick={onWrong}>
                ✗ Fallo
              </button>
            </div>
          )}
        </footer>
      </div>
    </div>
  );
}
