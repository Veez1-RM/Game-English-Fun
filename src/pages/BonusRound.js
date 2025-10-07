import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameContext } from '../context/GameContext';
import { useNavigate } from 'react-router-dom';
import './BonusRound.css';

// Bonus questions pool - quick simple questions
const BONUS_QUESTIONS = [
  { question: "What is the capital of France?", options: ["Paris", "London", "Berlin", "Rome"], answer: 0 },
  { question: "How many days in a week?", options: ["5", "6", "7", "8"], answer: 2 },
  { question: "What color is the sky?", options: ["Green", "Blue", "Red", "Yellow"], answer: 1 },
  { question: "How many legs does a spider have?", options: ["6", "8", "10", "4"], answer: 1 },
  { question: "What is 5 + 5?", options: ["8", "9", "10", "11"], answer: 2 },
  { question: "Which animal says 'meow'?", options: ["Dog", "Cat", "Cow", "Duck"], answer: 1 },
  { question: "What is the opposite of 'hot'?", options: ["Cold", "Warm", "Cool", "Wet"], answer: 0 },
  { question: "How many months in a year?", options: ["10", "11", "12", "13"], answer: 2 },
  { question: "What do bees make?", options: ["Milk", "Honey", "Butter", "Cheese"], answer: 1 },
  { question: "Which is the largest ocean?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], answer: 3 },
];

const TIME_LIMIT = 10; // seconds per question
const BONUS_POINTS = 50;

export default function BonusRound() {
  const { teams, addScore, setCurrentRound, setBonusRound } = useContext(GameContext);
  const navigate = useNavigate();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [waiting, setWaiting] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [winner, setWinner] = useState(null);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    // Shuffle and pick 3 random questions
    const shuffled = [...BONUS_QUESTIONS].sort(() => Math.random() - 0.5);
    setQuestions(shuffled.slice(0, 3));

    // Countdown before start
    const countdown = setTimeout(() => {
      setWaiting(false);
    }, 3000);

    return () => clearTimeout(countdown);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (waiting || showResult || !questions.length) return;

    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, waiting, showResult, questions]);

  const endBonusRound = () => {
    setBonusRound(false);
    navigate('/scoreboard');
  };

  const handleTimeout = () => {
    setShowResult(true);
    setTimeout(() => {
      moveToNext();
    }, 2000);
  };

  const handleAnswer = (answerIdx, teamKey) => {
    if (selectedAnswer !== null) return; // Already answered

    setSelectedAnswer({ team: teamKey, answer: answerIdx });
    const correct = answerIdx === questions[currentQuestion].answer;

    if (correct) {
      addScore(teamKey, BONUS_POINTS, 'bonus');
      setWinner(teamKey);
      setShowResult(true);

      setTimeout(() => {
        endBonusRound();
      }, 3000);

    } else {
      setShowResult(true);
      setTimeout(() => {
        moveToNext();
      }, 2000);
    }
  };

  const moveToNext = () => {
    const next = currentQuestion + 1;
    if (next < questions.length) {
      setCurrentQuestion(next);
      setTimeLeft(TIME_LIMIT);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // All questions done, no winner - random winner
      const randomWinner = Math.random() > 0.5 ? 'team1' : 'team2';
      addScore(randomWinner, BONUS_POINTS, 'bonus');
      setWinner(randomWinner);
      setShowResult(true);

      setTimeout(() => {
        endBonusRound();
      }, 3000);
    }
  };

  if (waiting) {
    return (
      <div className="bonus-container">
        <motion.div
          className="bonus-countdown"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <motion.h1
            className="bonus-countdown-title"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            ⚡ SUDDEN DEATH ⚡
          </motion.h1>
          <p className="bonus-countdown-text">Speed Quiz - First correct answer wins!</p>
          <motion.div
            className="bonus-countdown-number"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            READY?
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (!questions.length) return null;

  const q = questions[currentQuestion];
  const timerPercentage = (timeLeft / TIME_LIMIT) * 100;
  const isCritical = timeLeft <= 3;

  return (
    <div className="bonus-container">
      {/* Header */}
      <div className="bonus-header">
        <motion.h2
          className="bonus-title"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          ⚡ SUDDEN DEATH ROUND ⚡
        </motion.h2>
        <div className="bonus-progress">
          Question {currentQuestion + 1} / {questions.length}
        </div>
      </div>

      {/* Timer */}
      <motion.div
        className={`bonus-timer ${isCritical ? 'critical' : ''}`}
        animate={isCritical ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.5, repeat: isCritical ? Infinity : 0 }}
      >
        <div className="bonus-timer-number">{timeLeft}</div>
        <div className="bonus-timer-bar">
          <motion.div
            className="bonus-timer-fill"
            animate={{
              width: `${timerPercentage}%`,
              backgroundColor: isCritical ? '#ef4444' : '#a855f7'
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </motion.div>

      {/* Question */}
      <motion.div
        className="bonus-question-card"
        key={currentQuestion}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="bonus-question-text">{q.question}</h3>

        {/* Team Buttons */}
        <div className="bonus-teams-container">
          {/* Team 1 */}
          <div className="bonus-team-section">
            <div className="bonus-team-label team1-label">{teams.team1}</div>
            <div className="bonus-options-grid">
              {q.options.map((opt, idx) => (
                <motion.button
                  key={idx}
                  className="bonus-option team1-option"
                  onClick={() => handleAnswer(idx, 'team1')}
                  disabled={selectedAnswer !== null || showResult}
                  whileHover={{ scale: selectedAnswer === null ? 1.05 : 1 }}
                  whileTap={{ scale: selectedAnswer === null ? 0.95 : 1 }}
                  style={{
                    opacity: selectedAnswer && selectedAnswer.team === 'team1' && selectedAnswer.answer === idx ? 1 : 
                            selectedAnswer ? 0.5 : 1
                  }}
                >
                  {opt}
                </motion.button>
              ))}
            </div>
          </div>

          {/* VS Divider */}
          <div className="bonus-vs">VS</div>

          {/* Team 2 */}
          <div className="bonus-team-section">
            <div className="bonus-team-label team2-label">{teams.team2}</div>
            <div className="bonus-options-grid">
              {q.options.map((opt, idx) => (
                <motion.button
                  key={idx}
                  className="bonus-option team2-option"
                  onClick={() => handleAnswer(idx, 'team2')}
                  disabled={selectedAnswer !== null || showResult}
                  whileHover={{ scale: selectedAnswer === null ? 1.05 : 1 }}
                  whileTap={{ scale: selectedAnswer === null ? 0.95 : 1 }}
                  style={{
                    opacity: selectedAnswer && selectedAnswer.team === 'team2' && selectedAnswer.answer === idx ? 1 : 
                            selectedAnswer ? 0.5 : 1
                  }}
                >
                  {opt}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Result Overlay */}
      <AnimatePresence>
        {showResult && winner && (
          <motion.div
            className="bonus-result-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bonus-result-content"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <motion.div
                className="bonus-trophy"
                animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
              >
                🏆
              </motion.div>
              <h2 className="bonus-winner-title">WINNER!</h2>
              <h1 className="bonus-winner-name">{teams[winner]}</h1>
              <p className="bonus-winner-points">+{BONUS_POINTS} Bonus Points!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
