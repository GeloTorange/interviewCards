import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import './FlashCard.css';

const SWIPE_THRESHOLD = 50;

export default function FlashCard({ question, flipped, onFlip, onNext }) {
  const [startX, setStartX] = useState(null);
  const cardRef = useRef(null);

  const handlePointerDown = (clientX) => {
    setStartX(clientX);
  };

  const handlePointerUp = (clientX) => {
    if (startX === null) return;
    const delta = clientX - startX;
    if (Math.abs(delta) > SWIPE_THRESHOLD) {
      onNext();
    }
    setStartX(null);
  };

  const pointerProps = {
    onMouseDown: (event) => handlePointerDown(event.clientX),
    onMouseUp: (event) => handlePointerUp(event.clientX),
    onMouseLeave: () => setStartX(null),
    onTouchStart: (event) => handlePointerDown(event.touches[0].clientX),
    onTouchEnd: (event) => handlePointerUp(event.changedTouches[0].clientX)
  };

  if (!question) {
    return null;
  }

  return (
    <div className="flashcard-wrapper">
      <div
        ref={cardRef}
        className={`flashcard ${flipped ? 'flipped' : ''}`}
        onClick={onFlip}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onFlip();
          }
          if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            onNext();
          }
        }}
        {...pointerProps}
      >
        <div className="flashcard-face flashcard-front">
          <span className="badge">{question.topic}</span>
          <p>{question.question}</p>
          <span className="hint">Нажмите, чтобы увидеть ответ</span>
        </div>
        <div className="flashcard-face flashcard-back">
          <p>{question.answer}</p>
          <span className="hint">Свайпните, чтобы перейти дальше</span>
        </div>
      </div>
    </div>
  );
}

FlashCard.propTypes = {
  question: PropTypes.shape({
    id: PropTypes.string.isRequired,
    topic: PropTypes.string.isRequired,
    question: PropTypes.string.isRequired,
    answer: PropTypes.string.isRequired
  }).isRequired,
  flipped: PropTypes.bool,
  onFlip: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired
};

FlashCard.defaultProps = {
  flipped: false
};
