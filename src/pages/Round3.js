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
  const [imageError, setImageError] = useState(false);
  const correctSoundRef = useRef(null);
  const wrongSoundRef = useRef(null);


  useEffect(() => {
    setQuestions(shuffleArray(pool));
    setIndex(0);

    // Inisialisasi audio
    correctSoundRef.current = new Audio("/audio/correct-answer.mp3");
    wrongSoundRef.current = new Audio("/audio/error.mp3");

    correctSoundRef.current.volume = 0.9;
    wrongSoundRef.current.volume = 0.9;
  }, []);


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
    setSelectedOption(optIdx);
    setShowPopup(true);
  };

  const handleAssign = (teamKey) => {
    setShowPopup(false);

    const correct = selectedOption === q.answer;
    const teamName = teamKey === 'team1' ? teams.team1 : teams.team2;
    const answerText = q.options[q.answer];

    setCorrectAnswer(answerText);

    if (correct) {
      addScore(teamKey, POINTS, 3);
      setFeedback(`correct|${teamName}`);
      if (correctSoundRef.current) {
        correctSoundRef.current.currentTime = 0;
        correctSoundRef.current.play().catch(err => console.warn("Correct sound error:", err));
      }
    } else {
      setFeedback(`wrong|${teamName}|${String.fromCharCode(65 + q.answer)}`);
      if (wrongSoundRef.current) {
        wrongSoundRef.current.currentTime = 0;
        wrongSoundRef.current.play().catch(err => console.warn("Wrong sound error:", err));
      }
    }

    setShowReveal(true);
  };


  const handleNextQuestion = () => {
    setShowReveal(false);
    const next = index + 1;
    if (next >= questions.length) {
      setCurrentRound(null);
      navigate('/scoreboard');
    } else {
      setIndex(next);
      setFeedback('');
      setSelectedOption(null);
    }
  };

  const isCorrect = feedback.startsWith('correct');
  const isWrong = feedback.startsWith('wrong');
  const feedbackParts = feedback.split('|');
  const teamName = feedbackParts[1] || '';
  const wrongAnswerLetter = feedbackParts[2] || '';

  // Assume full image has '-full' suffix or is in a 'full' folder
  const fullImagePath = q.imageFull || q.image; // Use imageFull if available, otherwise use same image

  return (
    <div className="round3-container">
      {/* Background Shapes */}
      <div className="bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      {/* Header */}
      <div className="round3-header">
        <motion.h2
          className="round3-title"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1,
            type: "spring",
            stiffness: 100
          }}
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
            />
            {!feedback && (
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
                disabled={feedback !== ''}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 0.4 + (idx * 0.1),
                  type: "spring",
                  stiffness: 150
                }}
                whileHover={feedback === '' ? {
                  scale: 1.02,
                  y: -8
                } : {}}
                whileTap={feedback === '' ? { scale: 0.98 } : {}}
                style={{
                  cursor: feedback !== '' ? 'not-allowed' : 'pointer',
                  opacity: feedback !== '' ? 0.6 : 1
                }}
              >
                <motion.div
                  className="option-badge"
                  animate={selectedOption === idx ? {
                    scale: [1, 1.3, 1],
                    rotate: [0, 360, 360]
                  } : {}}
                  transition={{ duration: 0.6 }}
                >
                  {String.fromCharCode(65 + idx)}
                </motion.div>
                <span className="option-label">{opt}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Feedback
        <AnimatePresence mode="wait">
          {feedback && (
            <motion.div
              className={`round3-feedback ${isCorrect ? 'feedback-success' : 'feedback-error'}`}
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -30 }}
              transition={{
                duration: 0.5,
                type: "spring",
                stiffness: 200
              }}
            >
              <span>
                {isCorrect ? (
                  <>🎉 {teamName} benar! +{POINTS} poin</>
                ) : (
                  <>❌ Salah untuk {teamName}. Jawaban benar: {wrongAnswerLetter}</>
                )}
              </span>
            </motion.div>
          )}
        </AnimatePresence> */}
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
              <motion.img
                src={process.env.PUBLIC_URL + '/' + fullImagePath}
                alt="revealed"
                className="revealed-image"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                onError={(e) => {
                  console.log('Error loading full image, using puzzle image');
                  e.target.src = process.env.PUBLIC_URL + '/' + q.image;
                }}
              />
              <motion.div
                className={`popup-feedback ${isCorrect ? 'popup-feedback-correct' : 'popup-feedback-wrong'}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                {isCorrect ? (
                  <p>🎉 <strong>{teamName}</strong> benar! +{POINTS} poin</p>
                ) : (
                  <p>❌ Salah untuk <strong>{teamName}</strong>. Jawaban benar: <strong>{wrongAnswerLetter}</strong></p>
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
        onClose={() => setShowPopup(false)}
        teams={teams}
        onSelect={(teamKey) => handleAssign(teamKey)}
      />
    </div>
  );
}