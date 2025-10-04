import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import FlashCard from './FlashCard.jsx';
import './CardSession.css';

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function CardSession({ questions }) {
  const [order, setOrder] = useState(() => shuffle(questions.map((_, idx) => idx)));
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    setOrder(shuffle(questions.map((_, idx) => idx)));
    setCurrent(0);
    setFlipped(false);
  }, [questions]);

  const activeQuestion = useMemo(() => {
    const index = order[current];
    return questions[index];
  }, [order, current, questions]);

  const goNext = useCallback(() => {
    setCurrent((prev) => {
      const next = prev + 1;
      if (next >= order.length) {
        return prev;
      }
      return next;
    });
    setFlipped(false);
  }, [order.length]);

  const restart = () => {
    setOrder(shuffle(questions.map((_, idx) => idx)));
    setCurrent(0);
    setFlipped(false);
  };

  const progress = `${Math.min(current + 1, order.length)} / ${order.length}`;
  const isCompleted = current >= order.length - 1 && flipped;

  return (
    <section className="card-session">
      <header className="session-meta">
        <div>
          <h2>Режим карточек</h2>
          <p>Карточки не повторяются в рамках сессии. Нажмите на карточку, чтобы увидеть ответ.</p>
        </div>
        <div className="session-actions">
          <span className="progress" aria-live="polite">
            {progress}
          </span>
          <button type="button" onClick={restart}>
            Перемешать
          </button>
        </div>
      </header>

      <div className="card-stage">
        <FlashCard
          key={activeQuestion?.id}
          question={activeQuestion}
          flipped={flipped}
          onFlip={() => setFlipped((prev) => !prev)}
          onNext={goNext}
        />
      </div>

      {isCompleted ? (
        <div className="session-complete" role="status">
          <strong>Вы посмотрели все карточки!</strong>
          <button type="button" onClick={restart}>
            Начать заново
          </button>
        </div>
      ) : (
        <div className="session-hint">Свайпните в сторону или нажмите кнопку ниже, чтобы перейти дальше.</div>
      )}

      <button type="button" className="next-button" onClick={goNext} disabled={current >= order.length - 1}>
        Следующий вопрос
      </button>
    </section>
  );
}

CardSession.propTypes = {
  questions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      topic: PropTypes.string.isRequired,
      question: PropTypes.string.isRequired,
      answer: PropTypes.string.isRequired
    })
  ).isRequired
};
