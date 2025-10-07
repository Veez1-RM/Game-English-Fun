import React, { useContext, useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import pool from '../data/round2.json';
import { shuffleArray } from '../utils/shuffle';
import { GameContext } from '../context/GameContext';
import { useNavigate } from 'react-router-dom';
import './Round2.css';

const QUESTIONS_PER_TEAM = 10;
const POINTS = 15;
const TIME_LIMIT = 20;

export default function Round2() {
  const { teams, addScore, setCurrentRound } = useContext(GameContext);
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);

  // Audio refs
  const tickSoundRef = useRef(null);
  const correctSoundRef = useRef(null);
  const wrongSoundRef = useRef(null);
  const bgMusicRef = useRef(null);

  // Load audio on mount
  useEffect(() => {
    tickSoundRef.current = new Audio('/audio/timer.mp3');
    tickSoundRef.current.loop = false; // jangan loop terus
    correctSoundRef.current = new Audio('/audio/correct-answer.mp3');
    wrongSoundRef.current = new Audio('/audio/error.mp3');

    bgMusicRef.current = new Audio('/audio/bg-music.mp3');
    bgMusicRef.current.loop = true;
    bgMusicRef.current.volume = 0.8;
  }, []);

  // Shuffle and prepare questions on mount
  useEffect(() => {
    const poolShuffled = shuffleArray(pool);
    const total = Math.min(poolShuffled.length, QUESTIONS_PER_TEAM * 2);
    
    const processed = poolShuffled.slice(0, total).map((q) => {
      const correctAnswerText = q.options[q.answer];
      const shuffledOptions = shuffleArray([...q.options]);
      const newAnswerIndex = shuffledOptions.findIndex(opt => opt === correctAnswerText);
      
      return {
        ...q,
        options: shuffledOptions,
        answer: newAnswerIndex
      };
    });
    
    setQuestions(processed);
  }, []);

  // Setup question change: reset feedback, selected option and play BGM on first question
  useEffect(() => {
    if (questions.length > 0) {
      setFeedback('');
      setSelectedOption(null);
      if (bgMusicRef.current && bgMusicRef.current.paused) {
        bgMusicRef.current.play().catch(err => console.warn('BGM error:', err));
      }
    }
  }, [index, questions]);

  const moveToNextQuestion = () => {
    const next = index + 1;
    if (next >= questions.length) {
      // Stop bg music before moving to scoreboard
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current.currentTime = 0;
      }
      setCurrentRound(3);
      navigate('/scoreboard');
    } else {
      setIndex(next);
      setFeedback('');
      setSelectedOption(null);
    }
  };

  const handleTimeUp = () => {
    if (feedback) return; // Prevent multiple calls
    setFeedback(`timeout|${String.fromCharCode(65 + questions[index].answer)}`);

    // play wrong sound on timeout
    if (wrongSoundRef.current) {
      wrongSoundRef.current.currentTime = 0;
      wrongSoundRef.current.play().catch(err => console.warn('Sound error:', err));
    }

    setTimeout(moveToNextQuestion, 2000);
  };

  const handleOption = (optIndex) => {
    if (feedback) return;
    
    setSelectedOption(optIndex);
    
    const currentTeamKey = index % 2 === 0 ? 'team1' : 'team2';
    const q = questions[index];
    
    if (optIndex === q.answer) {
      addScore(currentTeamKey, POINTS, 2);
      setFeedback('correct');

      // play correct sound
      correctSoundRef.current?.play().catch(err => console.warn('Sound error:', err));
    } else {
      setFeedback(`wrong|${String.fromCharCode(65 + q.answer)}`);

      // play wrong sound
      wrongSoundRef.current?.play().catch(err => console.warn('Sound error:', err));
    }

    setTimeout(moveToNextQuestion, 2000);
  };

  if (!questions.length) {
    return (
      <div className="loading-quiz">
        <div className="loading-spinner"></div>
        <p className="loading-quiz-text">Loading questions...</p>
      </div>
    );
  }

  const currentTeamKey = index % 2 === 0 ? 'team1' : 'team2';
  const currentTeamName = teams[currentTeamKey];
  const q = questions[index];

  const isCorrect = feedback === 'correct';
  const isTimeout = feedback.startsWith('timeout');
  const isWrong = feedback.startsWith('wrong') && !isTimeout;
  const correctAnswer = (isWrong || isTimeout) ? feedback.split('|')[1] : '';

  const optionClasses = ['option-a', 'option-b', 'option-c', 'option-d'];

  return (
    <div className="round2-container">
      <div className="particles">
        {[...Array(6)].map((_, i) => <div className="particle" key={i} />)}
      </div>

      <div className="round2-header">
        <motion.h2 
          className="round2-title"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
        >
          Ronde 2 — Quiz ABCD
        </motion.h2>
        
        <div className="round2-info">
          <motion.div 
            className="info-card"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Soal: <strong>{index + 1}</strong> / {questions.length}
          </motion.div>
          <motion.div 
            className="info-card"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Giliran: <strong>{currentTeamName}</strong>
          </motion.div>
        </div>

        {/* Timer Component - key forces remount */}
        <TimerComponent 
          key={`timer-${index}`}
          timeLimit={TIME_LIMIT}
          onTimeUp={handleTimeUp}
          isActive={!feedback}
          tickSoundRef={tickSoundRef}
        />
      </div>

      <motion.div 
        className="quiz-board"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        key={index}
      >
        <motion.div 
          className="question-section"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="question-text">
            <span className="question-icon">❓</span>
            {q.question}
          </h3>
        </motion.div>

        <div className="options-grid">
          {q.options.map((opt, i) => (
            <motion.button
              key={i}
              className={`option-btn ${optionClasses[i]}`}
              onClick={() => handleOption(i)}
              disabled={!!feedback}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.4, type: "spring", stiffness: 200 }}
              whileHover={{ scale: !feedback ? 1.03 : 1, transition: { duration: 0.2 } }}
              whileTap={{ scale: !feedback ? 0.95 : 1 }}
              style={{
                cursor: feedback ? 'not-allowed' : 'pointer',
                opacity: feedback && selectedOption !== i ? 0.6 : 1
              }}
            >
              <motion.div 
                className="option-letter"
                animate={selectedOption === i ? {
                  rotate: [0, -10, 10, -10, 0],
                  scale: [1, 1.2, 1.2, 1.2, 1]
                } : {}}
                transition={{ duration: 0.5 }}
              >
                {String.fromCharCode(65 + i)}
              </motion.div>
              <span className="option-text">{opt}</span>
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {feedback && (
            <motion.div
              className={`feedback-container ${
                isCorrect ? 'feedback-correct' : 
                isTimeout ? 'feedback-timeout' : 
                'feedback-wrong'
              }`}
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -30 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
            >
              {isCorrect && `Benar! +${POINTS} untuk ${currentTeamName}`}
              {isTimeout && `⏰ Waktu Habis! Jawaban benar: ${correctAnswer}`}
              {isWrong && `Salah. Jawaban benar: ${correctAnswer}`}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// Timer component with ticking sound at last 5 seconds
function TimerComponent({ timeLimit, onTimeUp, isActive }) {
    const [timeLeft, setTimeLeft] = useState(timeLimit);
    const tickRef = useRef(null);

    useEffect(() => {
        tickRef.current = new Audio('/audio/timer.mp3');
        tickRef.current.loop = false; // pastikan tidak terus menerus
    }, []);

    useEffect(() => {
        if (!isActive) {
            tickRef.current?.pause();
            tickRef.current.currentTime = 0;
            return;
        }

        if (timeLeft <= 0) {
            tickRef.current?.pause();
            tickRef.current.currentTime = 0;
            onTimeUp();
            return;
        }

        if (timeLeft <= 5 && tickRef.current) {
            // ✅ Hanya mainkan kalau belum sedang diputar
            if (!isAudioPlaying(tickRef.current)) {
                tickRef.current.currentTime = 0;
                tickRef.current.play().catch(err => console.warn("Tick sound error:", err));
            }
        }

        const timer = setTimeout(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [timeLeft, isActive, onTimeUp]);


    useEffect(() => {
        // Reset timeLeft when component remounts (karena key timer berubah setiap soal)
        setTimeLeft(timeLimit);
        if (tickRef.current) {
            tickRef.current.pause();
            tickRef.current.currentTime = 0;
        }
    }, [timeLimit]);

    const timerPercentage = (timeLeft / timeLimit) * 100;
    const isWarning = timeLeft <= 5;
    const isCritical = timeLeft <= 3;

    return (
        <motion.div
            className="timer-display"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
        >
            <motion.div
                className={`timer-circle ${isWarning ? 'warning' : ''} ${isCritical ? 'critical' : ''}`}
                animate={isCritical ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.5, repeat: isCritical ? Infinity : 0 }}
            >
                <div className="timer-number">{timeLeft}</div>
                <div className="timer-label">detik</div>
            </motion.div>

            <div className="timer-bar-wrapper">
                <motion.div
                    className="timer-bar"
                    animate={{
                        width: `${timerPercentage}%`,
                        backgroundColor: isCritical ? '#dc3545' : isWarning ? '#ffc107' : '#a500ceff'
                    }}
                    transition={{ duration: 0.3 }}
                />
            </div>
        </motion.div>
    );
}

function isAudioPlaying(audio) {
    return audio && !audio.paused && !audio.ended && audio.currentTime > 0;
}
