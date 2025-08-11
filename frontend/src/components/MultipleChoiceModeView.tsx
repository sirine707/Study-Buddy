import React, { useState, useEffect } from "react";
import { formatTime } from "../helpers";

const MultipleChoiceModeView = ({ quizList, handleStartNewQuiz }) => {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [resultsScore, setResultsScore] = useState<number | null>(null);
  const [resultsTime, setResultsTime] = useState<number | null>(null);
  const [time, setTime] = useState(0);
  const [timerRunning, setTimerRunning] = useState(true);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (timerRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning]);

  const handleOptionChange = (questionIdx, selectedOption) => {
    setSelectedAnswers((prevSelectedAnswers) => ({
      ...prevSelectedAnswers,
      [questionIdx]: selectedOption,
    }));
  };

  const handleRetakeQuiz = () => {
    setSelectedAnswers({});
    setResultsScore(null);
    setResultsTime(null);
    setTime(0);
    setTimerRunning(true);
  };

  const handleOpenResultsModal = () => {
    setIsResultsModalOpen(true);

    let score = 0;

    quizList.forEach((quiz, idx) => {
      if (selectedAnswers[idx] === quiz.correct_answer) score++;
    });

    setResultsScore(score);
    setResultsTime(time);
    setTimerRunning(false);
  };

  return (
    <div className="quiz-mode-container">
      <div className="init-message">
        <img
          src={
            "https://res.cloudinary.com/dgihbgsnz/image/upload/v1751841964/clickup-ai-logo-rect_sxofcz.png"
          }
          alt="Assistant Avatar"
        />

        <div className="details">
          <p>
            {quizList.length} Question{quizList.length < 2 ? "" : "s"}
          </p>
          <p>•</p>
          <p>{formatTime(resultsTime || time)}</p>
        </div>

        {resultsScore !== null && (
          <div className="score">
            Score: {resultsScore} / {quizList.length}
          </div>
        )}

        {!isResultsModalOpen && (
          <div className="actions">
            {resultsScore === null ? (
              <div onClick={handleOpenResultsModal}>See Results</div>
            ) : (
              <>
                <div onClick={handleRetakeQuiz}>Retake Quiz</div>
                <div onClick={handleStartNewQuiz}>New Quiz</div>
              </>
            )}
          </div>
        )}
      </div>

      {!isResultsModalOpen && (
        <div className="questions">
          {quizList.map((quiz, idx) => (
            <div key={idx} className="question">
              <p>
                {idx + 1}. {quiz.question}
              </p>

              <div className="options">
                {Object.keys(quiz.options).map((key) => (
                  <div key={key}>
                    <input
                      type="radio"
                      name={`question-${idx}`}
                      value={key}
                      checked={selectedAnswers[idx] === key}
                      onChange={() => handleOptionChange(idx, key)}
                      id={`question-${idx}-option-${key}`}
                      disabled={resultsScore !== null}
                    />

                    <label
                      className={`${
                        resultsScore !== null && key === quiz.correct_answer
                          ? "highlighted"
                          : ""
                      }`}
                      htmlFor={`question-${idx}-option-${key}`}
                    >
                      {quiz.options[key]}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {isResultsModalOpen && (
        <div className="results-modal-container">
          <div>
            <p>
              You scored <span>{resultsScore}</span> out of{" "}
              <span>{quizList.length}</span>
            </p>
            <p>Time: {formatTime(resultsTime)}</p>
            <div onClick={() => setIsResultsModalOpen(false)}>
              See Results
              <img
                src={
                  "https://res.cloudinary.com/dgihbgsnz/image/upload/v1727804456/ensuite/input-arrow_ro6bkp.svg"
                }
                alt="Arrow"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultipleChoiceModeView;

