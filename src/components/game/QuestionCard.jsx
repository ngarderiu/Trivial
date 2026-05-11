import { CATEGORIES_BY_ID } from '../../constants/categories.js';
import { resolveImage } from '../../utils/questionUtils.js';

// Muestra una pregunta. Si no está revelada solo se ve enunciado y
// botón Revelar; tras revelar, aparece la respuesta y los botones tick/cruz.
export default function QuestionCard({
  question,
  categoryId,
  revealed,
  onReveal,
  onCorrect,
  onWrong,
  onClose
}) {
  if (!question) return null;
  const cat = CATEGORIES_BY_ID[categoryId] ?? {};

  return (
    <div className="question-card" style={{ '--cat-color': cat.color }}>
      <header className="question-card__header">
        <span className="question-card__icon">{cat.icon}</span>
        <span className="question-card__category">{cat.name}</span>
        {onClose && (
          <button type="button" className="question-card__close" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        )}
      </header>

      <div className="question-card__body">
        {question.image && resolveImage(question.image) && (
          <img
            className="question-card__image"
            src={resolveImage(question.image)}
            alt=""
            style={{
              display: 'block',
              maxHeight: '200px',
              width: 'auto',
              maxWidth: '100%',
              objectFit: 'contain',
              borderRadius: '8px',
              margin: '0 auto 12px'
            }}
          />
        )}
        <p className="question-card__question">{question.question}</p>
        {revealed && (
          <p className="question-card__answer">
            <strong>Respuesta:</strong> {question.answer}
          </p>
        )}
      </div>

      <footer className="question-card__footer">
        {!revealed ? (
          <button type="button" className="btn btn--primary" onClick={onReveal}>
            Revelar respuesta
          </button>
        ) : (
          <div className="question-card__choices">
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
  );
}
