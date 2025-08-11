import React, { useState, useEffect } from "react";
import { formatTime } from "../helpers";

const FlashcardsModeView = ({ quizList, handleStartNewQuiz }) => {
  const [time, setTime] = useState(0);
  const [selectedFlashcardIdx, setSelectedFlashcardIdx] = useState(0);
  const [isAnswerDisplayed, setIsAnswerDisplayed] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    interval = setInterval(() => {
      setTime((prevTime) => prevTime + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleGoToPrevFlashcard = () => {
    if (selectedFlashcardIdx === 0) return;
    setSelectedFlashcardIdx((prevIdx) => prevIdx - 1);
    setIsAnswerDisplayed(false);
  };

  const handleGoToNextFlashcard = () => {
    if (selectedFlashcardIdx === quizList.length - 1) return;
    setSelectedFlashcardIdx((prevIdx) => prevIdx + 1);
    setIsAnswerDisplayed(false);
  };

  const handleGoToFlashcard = (idx) => {
    setSelectedFlashcardIdx(idx);
    setIsAnswerDisplayed(false);
  };

  const toggleFlashcardAnswer = () => {
    setIsAnswerDisplayed((prevIsAnswerDisplayed) => !prevIsAnswerDisplayed);
  };

  return (
    <div className="flashcards-mode-container">
      <div className="init-message">
        <img
          src={
            "https://res.cloudinary.com/dgihbgsnz/image/upload/v1751841964/clickup-ai-logo-rect_sxofcz.png"
          }
          alt="Assistant Avatar"
        />

        <div className="details">
          <p>
            {quizList.length} Flashcard{quizList.length < 2 ? "" : "s"}
          </p>
          <p>•</p>
          <p>{formatTime(time)}</p>
        </div>

        <div className="actions">
          <div onClick={handleStartNewQuiz}>New Quiz</div>
        </div>
      </div>

      <div className="flashcards-container">
        <div className="flashcard">
          <div
            className={`arrow-container prev ${
              selectedFlashcardIdx === 0 ? "disabled" : ""
            }`}
            onClick={handleGoToPrevFlashcard}
          >
            <img
              src={
                "https://res.cloudinary.com/dgihbgsnz/image/upload/v1727804488/ensuite/left-flashcard-arrow_y6qrzn.svg"
              }
              alt="Left Arrow"
            />
          </div>

          <div
            className={`flip-card ${isAnswerDisplayed ? "flipped" : ""}`}
            onClick={toggleFlashcardAnswer}
          >
            <div className="flip-card-inner">
              <div className="flip-card-front">
                <p className="top-placeholder"></p>
                <p className="question">
                  {quizList[selectedFlashcardIdx].Question}
                </p>
                <p className="bottom-placeholder">
                  Click to{" "}
                  {isAnswerDisplayed ? "see question" : "reveal answer"}
                </p>
              </div>
              <div className="flip-card-back">
                <p className="top-placeholder"></p>
                <p className="answer">
                  {quizList[selectedFlashcardIdx].Answer}
                </p>
                <p className="bottom-placeholder">
                  Click to{" "}
                  {isAnswerDisplayed ? "see question" : "reveal answer"}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`arrow-container next ${
              selectedFlashcardIdx === quizList.length - 1 ? "disabled" : ""
            }`}
            onClick={handleGoToNextFlashcard}
          >
            <img
              src={
                "https://res.cloudinary.com/dgihbgsnz/image/upload/v1727804507/ensuite/right-flashcard-arrow_ew7lmr.svg"
              }
              alt="Right Arrow"
            />
          </div>
        </div>

        <div className="dots">
          {quizList.map((_quiz, idx) => (
            <div
              key={idx}
              className={`${idx === selectedFlashcardIdx ? "selected" : ""}`}
              onClick={() => handleGoToFlashcard(idx)}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FlashcardsModeView;

