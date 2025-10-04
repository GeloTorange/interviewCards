import PropTypes from 'prop-types';
import './QuestionList.css';

export default function QuestionList({ questions }) {
  return (
    <section className="question-list">
      {questions.map((item) => (
        <article key={item.id} className="question-item">
          <header>
            <span className="badge">{item.topic}</span>
            <h2>{item.question}</h2>
          </header>
          <p>{item.answer}</p>
        </article>
      ))}
    </section>
  );
}

QuestionList.propTypes = {
  questions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      topic: PropTypes.string.isRequired,
      question: PropTypes.string.isRequired,
      answer: PropTypes.string.isRequired
    })
  ).isRequired
};
