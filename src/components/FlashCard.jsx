import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import './FlashCard.css';

const SWIPE_THRESHOLD = 120;
const SWIPE_OUT_DURATION = 260;

export default function FlashCard({ question, flipped, onFlip, onNext }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const startPointRef = useRef(null);
  const shouldBlockClick = useRef(false);
  const exitTimerRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(
    () => () => {
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
      }
    },
    []
  );

  const resetState = () => {
    startPointRef.current = null;
    shouldBlockClick.current = false;
    setOffset({ x: 0, y: 0 });
    setIsDragging(false);
    setIsExiting(false);
  };

  const beginDrag = (clientX, clientY) => {
    if (isExiting) return;
    startPointRef.current = { x: clientX, y: clientY };
    shouldBlockClick.current = false;
    setIsDragging(true);
  };

  const updateDrag = (clientX, clientY) => {
    if (!startPointRef.current || isExiting) {
      return;
    }

    const deltaX = clientX - startPointRef.current.x;
    const deltaY = clientY - startPointRef.current.y;
    const distance = Math.hypot(deltaX, deltaY);

    if (distance > 6) {
      shouldBlockClick.current = true;
    }

    setOffset({ x: deltaX, y: deltaY });
  };

  const completeDrag = (clientX, clientY) => {
    if (!startPointRef.current || isExiting) {
      resetState();
      return;
    }

    const deltaX = clientX - startPointRef.current.x;
    const deltaY = clientY - startPointRef.current.y;
    const absX = Math.abs(deltaX);

    if (absX > SWIPE_THRESHOLD) {
      const direction = deltaX > 0 ? 1 : -1;
      startPointRef.current = null;
      triggerSwipe(direction, deltaY);
    } else {
      setIsDragging(false);
      setOffset({ x: 0, y: 0 });
      shouldBlockClick.current = false;
      startPointRef.current = null;
    }
  };

  const triggerSwipe = (direction, deltaY = 0) => {
    if (isExiting) return;

    const travel = (cardRef.current?.offsetWidth ?? 320) * 1.5 * direction;
    setIsExiting(true);
    setIsDragging(false);
    shouldBlockClick.current = true;
    setOffset({ x: travel, y: deltaY });

    exitTimerRef.current = setTimeout(() => {
      exitTimerRef.current = null;
      onNext();
      resetState();
    }, SWIPE_OUT_DURATION);
  };

  const pointerProps = {
    onMouseDown: (event) => beginDrag(event.clientX, event.clientY),
    onMouseMove: (event) => {
      if (isDragging) {
        updateDrag(event.clientX, event.clientY);
      }
    },
    onMouseUp: (event) => completeDrag(event.clientX, event.clientY),
    onMouseLeave: () => {
      if (!isDragging) return;
      setIsDragging(false);
      setOffset({ x: 0, y: 0 });
      startPointRef.current = null;
      shouldBlockClick.current = false;
    },
    onTouchStart: (event) => beginDrag(event.touches[0].clientX, event.touches[0].clientY),
    onTouchMove: (event) => {
      if (!isDragging) return;
      const touch = event.touches[0];
      if (touch) {
        event.preventDefault();
        updateDrag(touch.clientX, touch.clientY);
      }
    },
    onTouchEnd: (event) => {
      const touch = event.changedTouches[0];
      if (touch) {
        completeDrag(touch.clientX, touch.clientY);
      }
    }
  };

  const handleCardClick = () => {
    if (isExiting) return;
    if (shouldBlockClick.current) {
      shouldBlockClick.current = false;
      return;
    }
    onFlip();
  };

  const rotation = offset.x * 0.06;
  const motionStyle = {
    transform: `translate3d(${offset.x}px, ${offset.y}px, 0) rotate(${rotation}deg)`
  };

  if (!question) {
    return null;
  }

  return (
    <div className="flashcard-wrapper">
      <div
        className={`flashcard-motion ${isDragging ? 'dragging' : ''} ${isExiting ? 'exiting' : ''}`.trim()}
        style={motionStyle}
        {...pointerProps}
      >
        <div
          ref={cardRef}
          className={`flashcard ${flipped ? 'flipped' : ''}`}
          role="button"
          tabIndex={0}
          onClick={handleCardClick}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onFlip();
            }
            if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
              onNext();
            }
          }}
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
