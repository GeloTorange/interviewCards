import { useEffect, useMemo, useState } from 'react';
import { QUESTIONS } from './data/questions.js';
import QuestionList from './components/QuestionList.jsx';
import CardSession from './components/CardSession.jsx';
import './styles/app.css';

const MODES = {
  LIST: 'list',
  CARDS: 'cards'
};

export default function App() {
  const [mode, setMode] = useState(MODES.LIST);
  const topics = useMemo(() => {
    const unique = Array.from(new Set(QUESTIONS.map((item) => item.topic)));
    return unique.sort((a, b) => a.localeCompare(b, 'ru', { sensitivity: 'base' }));
  }, []);
  const [selectedTopics, setSelectedTopics] = useState(() => [...topics]);
  const [cardCount, setCardCount] = useState(() => Math.min(10, QUESTIONS.length));
  const [filtersVisible, setFiltersVisible] = useState(true);

  const total = useMemo(() => QUESTIONS.length, []);

  const filteredQuestions = useMemo(() => {
    const topicSet = new Set(selectedTopics);
    return QUESTIONS.filter((question) => topicSet.has(question.topic));
  }, [selectedTopics]);

  const availableCount = filteredQuestions.length;

  useEffect(() => {
    if (availableCount === 0) {
      setCardCount(0);
      return;
    }

    setCardCount((prev) => {
      if (!prev) {
        return Math.min(10, availableCount);
      }
      return Math.min(prev, availableCount);
    });
  }, [availableCount]);

  const sessionQuestions = useMemo(() => {
    if (cardCount === 0) {
      return [];
    }
    return filteredQuestions.slice(0, cardCount);
  }, [filteredQuestions, cardCount]);

  const sessionKey = useMemo(() => {
    const normalizedTopics = [...selectedTopics].sort((a, b) => topics.indexOf(a) - topics.indexOf(b));
    return `${normalizedTopics.join('|')}|${cardCount}`;
  }, [selectedTopics, cardCount, topics]);

  const selectionLabel = useMemo(() => {
    if (selectedTopics.length === topics.length) {
      return 'Все темы';
    }
    return selectedTopics.join(', ');
  }, [selectedTopics, topics]);

  const toggleTopic = (topic) => {
    setSelectedTopics((prev) => {
      const exists = prev.includes(topic);
      if (exists) {
        if (prev.length === 1) {
          return prev;
        }
        return prev.filter((item) => item !== topic);
      }
      return [...prev, topic].sort((a, b) => topics.indexOf(a) - topics.indexOf(b));
    });
  };

  const selectAllTopics = () => {
    setSelectedTopics([...topics]);
  };

  const handleCardCountChange = (event) => {
    if (availableCount === 0) {
      setCardCount(0);
      return;
    }

    const value = Number(event.target.value);
    if (Number.isNaN(value)) {
      return;
    }

    const clamped = Math.min(Math.max(value, 1), availableCount);
    setCardCount(clamped);
  };

  const toggleFiltersVisibility = () => {
    setFiltersVisible((prev) => !prev);
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>Interview Cards</h1>
          <p className="subtitle">
            Подборка вопросов для подготовки к собеседованиям ({total}).
          </p>
        </div>
        <nav className="mode-switcher" aria-label="Выбор режима">
          <button
            type="button"
            className={mode === MODES.LIST ? 'active' : ''}
            onClick={() => setMode(MODES.LIST)}
          >
            Список
          </button>
          <button
            type="button"
            className={mode === MODES.CARDS ? 'active' : ''}
            onClick={() => setMode(MODES.CARDS)}
          >
            Карточки
          </button>
        </nav>
      </header>

      <main className="app-main">
        {mode === MODES.LIST ? (
          <QuestionList questions={QUESTIONS} />
        ) : (
          <>
            <section className={`card-settings${filtersVisible ? '' : ' collapsed'}`} aria-label="Настройки интервью-режима">
              <div className="settings-header">
                <h2>Настройки</h2>
                <button
                  type="button"
                  onClick={toggleFiltersVisibility}
                  className="filters-toggle"
                  aria-expanded={filtersVisible}
                  aria-controls="card-settings-content"
                >
                  {filtersVisible ? 'Скрыть фильтры' : 'Показать фильтры'}
                </button>
              </div>

              {filtersVisible && (
                <div className="settings-content" id="card-settings-content">
                  <div className="settings-group">
                    <h3>Темы для интервью</h3>
                    <div className="topic-options" role="group" aria-label="Выбор тем">
                      {topics.map((topic) => (
                        <label key={topic} className="topic-option">
                          <input
                            type="checkbox"
                            checked={selectedTopics.includes(topic)}
                            onChange={() => toggleTopic(topic)}
                          />
                          <span>{topic}</span>
                        </label>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="select-all"
                      onClick={selectAllTopics}
                      disabled={selectedTopics.length === topics.length}
                    >
                      Выбрать все темы
                    </button>
                  </div>

                  <div className="settings-group">
                    <label htmlFor="card-count" className="count-label">
                      Количество карточек
                      <span className="count-value" aria-live="polite">
                        {availableCount === 0 ? 0 : cardCount}
                      </span>
                    </label>
                    <div className="count-control">
                      <input
                        id="card-count"
                        type="range"
                        min={availableCount === 0 ? 0 : 1}
                        max={availableCount}
                        value={availableCount === 0 ? 0 : cardCount}
                        onChange={handleCardCountChange}
                        disabled={availableCount === 0}
                      />
                      <span className="count-hint">Доступно: {availableCount}</span>
                    </div>
                  </div>
                </div>
              )}
            </section>

            <CardSession
              key={sessionKey}
              questions={sessionQuestions}
              poolSize={availableCount}
              selectionLabel={selectionLabel}
            />
          </>
        )}
      </main>
    </div>
  );
}
