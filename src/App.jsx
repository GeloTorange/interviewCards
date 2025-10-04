import { useMemo, useState } from 'react';
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
  const total = useMemo(() => QUESTIONS.length, []);

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
          <CardSession questions={QUESTIONS} key={QUESTIONS.length} />
        )}
      </main>
    </div>
  );
}
