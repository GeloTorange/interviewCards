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

  const goPrev = useCallback(() => {
    setCurrent((prev) => {
      const next = prev - 1;
      if (next < 0) {
        return prev;
      }
      return next;
    });
    setFlipped(false);
  }, []);

  const restart = () => {
    setOrder(shuffle(questions.map((_, idx) => idx)));
    setCurrent(0);
    setFlipped(false);
  };

  const progress = `${order.length === 0 ? 0 : Math.min(current + 1, order.length)} / ${order.length}`;
  const isCompleted = order.length > 0 && current >= order.length - 1 && flipped;
  const canGoPrev = current > 0;
  const canGoNext = current < order.length - 1;

  if (questions.length === 0) {
    return (
      <section className="card-session">
        <header className="session-meta">
          <div className="session-info">
            <h2>Интервью-режим</h2>
            <p>
              Выберите темы и количество карточек выше, чтобы начать тренировку.
            </p>
          </div>
        </header>
        <div className="session-empty" role="status">
          Для текущих фильтров нет карточек. Измените настройки, чтобы продолжить.
        </div>
      </section>
    );
  }

  return (
    <section className="card-session">
      <header className="session-meta">
        <div className="session-info">
          <h2>Интервью-режим</h2>
        </div>
        <div className="session-actions">
          <button type="button" onClick={restart} className="ghost">
            Перемешать
          </button>
          <span className="progress" aria-live="polite">
            {progress}
          </span>
        </div>
      </header>

      <div className="card-stage">
        <div className="card-stage-shadow" aria-hidden="true" />
        <FlashCard
          key={activeQuestion?.id}
          question={activeQuestion}
          flipped={flipped}
          onFlip={() => setFlipped((prev) => !prev)}
          onNext={goNext}
          onPrev={goPrev}
          canGoNext={canGoNext}
          canGoPrev={canGoPrev}
        />
      </div>

      {isCompleted ? (
        <div className="session-complete" role="status">
          <strong>Вы посмотрели все карточки!</strong>
          <button type="button" onClick={restart}>
            Начать заново
          </button>
        </div>
      ) : null}
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
