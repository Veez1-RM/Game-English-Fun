import React, { useContext, useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import pool from '../data/round3.json';
import { shuffleArray } from '../utils/shuffle';
import { GameContext } from '../context/GameContext';
import { useNavigate } from 'react-router-dom';
import PopupSelectTeam from '../components/PopupSelectTeam';
import './Round3.css';

const POINTS = 20;

export default function Round3() {
  const { teams, addScore, setCurrentRound } = useContext(GameContext);
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [showReveal, setShowReveal] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [answeredTeams, setAnsweredTeams] = useState([]); // Track teams that answered
  const [isQuestionAnswered, setIsQuestionAnswered] = useState(false); // Track if question correctly answered
  
  const correctSoundRef = useRef(null);
  const wrongSoundRef = useRef(null);

  useEffect(() => {
    setQuestions(shuffleArray(pool));
    setIndex(0);

    // Initialize audio
    correctSoundRef.current = new Audio("/audio/correct-answer.mp3");
    wrongSoundRef.current = new Audio("/audio/error.mp3");
    correctSoundRef.current.volume = 0.9;
    wrongSoundRef.current.volume = 0.9;
  }, []);

  // Reset state when question changes
  useEffect(() => {
    setAnsweredTeams([]);
    setIsQuestionAnswered(false);
    setFeedback('');
    setSelectedOption(null);
  }, [index]);

  if (!questions.length) {
    return (
      <div className="loading-round3">
        <div className="loading-spinner-round3"></div>
        <p className="loading-text-round3">Loading images...</p>
      </div>
    );
  }

  const q = questions[index];

  const handleOptionClick = (optIdx) => {
    if (shouldDisableOptions) return; // Extra safety
    setSelectedOption(optIdx);
    setShowPopup(true);
  };

  const handleAssign = (teamKey) => {
    setShowPopup(false);

    // Check if team already answered
    if (answeredTeams.includes(teamKey)) {
      alert(`${teams[teamKey]} sudah menjawab soal ini!`);
      setSelectedOption(null);
      return;
    }

    const correct = selectedOption === q.answer;
    const teamName = teams[teamKey];
    const answerText = q.options[q.answer];

    setCorrectAnswer(answerText);
    setAnsweredTeams(prev => [...prev, teamKey]);

    if (correct) {
      addScore(teamKey, POINTS, 3);
      setFeedback(`correct|${teamName}`);
      setIsQuestionAnswered(true);
      if (correctSoundRef.current) {
        correctSoundRef.current.currentTime = 0;
        correctSoundRef.current.play().catch(err => console.warn("Sound error:", err));
      }
      setShowReveal(true);
    } else {
      setFeedback(`wrong|${teamName}|${String.fromCharCode(65 + q.answer)}`);
      if (wrongSoundRef.current) {
        wrongSoundRef.current.currentTime = 0;
        wrongSoundRef.current.play().catch(err => console.warn("Sound error:", err));
      }
      
      // Check if both teams answered wrong
      if (answeredTeams.length + 1 >= 2) {
        setShowReveal(true);
      } else {
        // Reset for next team to answer
        setTimeout(() => {
          setFeedback('');
          setSelectedOption(null);
        }, 2000);
      }
    }
  };

  const handleNextQuestion = () => {
    setShowReveal(false);
    const next = index + 1;
    if (next >= questions.length) {
      setCurrentRound(null);
      navigate('/scoreboard');
    } else {
      setIndex(next);
    }
  };

  const isCorrect = feedback.startsWith('correct');
  const isWrong = feedback.startsWith('wrong');
  const feedbackParts = feedback.split('|');
  const teamName = feedbackParts[1] || '';
  const wrongAnswerLetter = feedbackParts[2] || '';

  const fullImagePath = q.imageFull || q.image;

  // Check if options should be disabled
  const shouldDisableOptions = isQuestionAnswered || answeredTeams.length >= 2;

  return (
    <div className="round3-container">
      {/* Background Shapes */}
      <div className="bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
      </div>

      {/* Header */}
      <div className="round3-header">
        <motion.h2
          className="round3-title"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, type: "spring", stiffness: 100 }}
        >
          🎨 Ronde 3 — Tebak Gambar
        </motion.h2>
        <motion.p
          className="round3-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Berebut! Siapa cepat dia dapat!
        </motion.p>
        <motion.div
          className="round3-progress"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          Soal: <strong>{index + 1}</strong> / {questions.length}
        </motion.div>
      </div>

      {/* Main Board */}
      <motion.div
        className="round3-board"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        key={index}
      >
        {/* Image Section */}
        <motion.div
          className="image-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="image-container">
            <motion.img
              src={process.env.PUBLIC_URL + '/' + q.image}
              alt="puzzle"
              className="puzzle-image"
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            {!shouldDisableOptions && (
              <motion.div
                className="magnifying-icon"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                🔍
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Options */}
        <div className="options-section">
          <motion.h3
            className="options-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Pilih Jawaban yang Tepat:
          </motion.h3>
          <div className="options-list">
            {q.options.map((opt, idx) => (
              <motion.button
                key={idx}
                className="round3-option"
                onClick={() => handleOptionClick(idx)}
                disabled={shouldDisableOptions}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 0.4 + (idx * 0.1),
                  type: "spring",
                  stiffness: 150
                }}
                whileHover={!shouldDisableOptions ? { scale: 1.02, y: -8 } : {}}
                whileTap={!shouldDisableOptions ? { scale: 0.98 } : {}}
                style={{
                  cursor: shouldDisableOptions ? 'not-allowed' : 'pointer',
                  opacity: shouldDisableOptions ? 0.5 : 1
                }}
              >
                <motion.div
                  className="option-badge"
                  animate={selectedOption === idx && !shouldDisableOptions ? {
                    scale: [1, 1.2, 1],
                  } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {String.fromCharCode(65 + idx)}
                </motion.div>
                <span className="option-label">{opt}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Inline Feedback for wrong answers */}
        <AnimatePresence mode="wait">
          {feedback && !showReveal && isWrong && (
            <motion.div
              style={{
                marginTop: '20px',
                padding: '15px 20px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%)',
                color: '#fca5a5',
                border: '2px solid #ef4444',
                textAlign: 'center',
                fontWeight: '700',
                fontSize: '1rem',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)'
              }}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              ❌ Salah untuk <strong>{teamName}</strong>. 
              {answeredTeams.length < 2 && ' Tim lain silakan coba!'}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Image Reveal Modal */}
      <AnimatePresence>
        {showReveal && (
          <motion.div
            className="reveal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className="reveal-content"
              initial={{ scale: 0.5, opacity: 0, rotateY: 90 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotateY: -90 }}
              transition={{
                duration: 0.6,
                type: "spring",
                stiffness: 200
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.h3
                className="reveal-title"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                🎯 Gambar Lengkap!
              </motion.h3>
              
              {fullImagePath && (
                <motion.img
                  src={process.env.PUBLIC_URL + '/' + fullImagePath}
                  alt="revealed"
                  className="revealed-image"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  onError={(e) => {
                    e.target.src = process.env.PUBLIC_URL + '/' + q.image;
                  }}
                />
              )}
              
              <motion.div
                className={`popup-feedback ${isCorrect ? 'popup-feedback-correct' : 'popup-feedback-wrong'}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                {isCorrect ? (
                  <p>🎉 <strong>{teamName}</strong> benar! +{POINTS} poin</p>
                ) : (
                  <p>❌ Tidak ada yang benar. Jawaban: <strong>{String.fromCharCode(65 + q.answer)}</strong></p>
                )}
              </motion.div>

              <motion.p
                className="reveal-caption"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Jawabannya: <strong>{correctAnswer}</strong>
              </motion.p>
              
              <motion.button
                className="close-reveal-btn"
                onClick={handleNextQuestion}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {index + 1 >= questions.length ? '🏁 Lihat Skor Akhir' : '➡️ Soal Selanjutnya'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Team Selection Popup */}
      <PopupSelectTeam
        show={showPopup}
        onClose={() => {
          setShowPopup(false);
          setSelectedOption(null);
        }}
        teams={teams}
        onSelect={(teamKey) => handleAssign(teamKey)}
      />
    </div>
  );
}