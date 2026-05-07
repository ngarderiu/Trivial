import { CATEGORIES } from '../../constants/categories.js';
import CardStack from '../common/CardStack.jsx';
import FlyingCard from '../common/FlyingCard.jsx';

// Área inferior con los 6 stacks de cartas (uno por categoría).
// Si hay una categoría activa, sobre su stack aparece una carta volando con
// la pregunta y los controles de revelar/acierto/fallo.
//
// Props:
//   - clickableCategories: ids de stacks pulsables (modo elegir categoría)
//   - onPickCategory: callback al pulsar un stack pulsable
//   - activeCategory: id con carta activa (null si ninguna)
//   - question, revealed: estado del flying card
//   - onReveal, onCorrect, onWrong: callbacks
export default function CardStackArea({
  clickableCategories = [],
  onPickCategory,
  activeCategory,
  question,
  revealed,
  onReveal,
  onCorrect,
  onWrong
}) {
  const clickable = new Set(clickableCategories);

  return (
    <div className="card-area" role="group" aria-label="Cartas por categoría">
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.id;
        const isClickable = clickable.has(cat.id) && !isActive;
        return (
          <div key={cat.id} className="card-area__slot">
            <CardStack
              category={cat.id}
              label={cat.name}
              icon={cat.icon}
              color={cat.color}
              disabled={!isClickable}
              onClick={() => isClickable && onPickCategory?.(cat.id)}
            />
            {isActive && (
              <FlyingCard
                color={cat.color}
                icon={cat.icon}
                label={cat.name}
                question={question}
                revealed={revealed}
                onReveal={onReveal}
                onCorrect={onCorrect}
                onWrong={onWrong}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
