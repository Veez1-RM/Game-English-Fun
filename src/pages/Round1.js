import React, { useContext, useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import round1Pool from '../data/round1.json';
import { shuffleArray } from '../utils/shuffle';
import { GameContext } from '../context/GameContext';
import { useNavigate } from 'react-router-dom';
import './Round1.css';

const QUESTIONS_PER_TEAM = 2;
const POINTS = 10;
const TIME_LIMIT = 15;

export default function Round1() {
    const { teams, addScore, setCurrentRound } = useContext(GameContext);
    const navigate = useNavigate();

    const [questions, setQuestions] = useState([]);
    const [index, setIndex] = useState(0);
    const [scrambled, setScrambled] = useState([]);
    const [answer, setAnswer] = useState([]);
    const [feedback, setFeedback] = useState('');
    const tickSoundRef = useRef(null);
    const correctSoundRef = useRef(null);
    const wrongSoundRef = useRef(null);
    const bgMusicRef = useRef(null);


    useEffect(() => {
    bgMusicRef.current = new Audio('/audio/bg-music.mp3');
    bgMusicRef.current.loop = true; // Biar musiknya muter terus
    bgMusicRef.current.volume = 0.8; // Volume bisa kamu atur
}, []);

    useEffect(() => {
        tickSoundRef.current = new Audio('/audio/timer.mp3');
        correctSoundRef.current = new Audio('/audio/correct-answer.mp3');
        wrongSoundRef.current = new Audio('/audio/error.mp3');
    }, []);

    useEffect(() => {
        const pool = shuffleArray(round1Pool);
        const total = Math.min(pool.length, QUESTIONS_PER_TEAM * 2);
        setQuestions(pool.slice(0, total));
        setIndex(0);
    }, []);

    useEffect(() => {
        if (questions.length > 0) {
            const word = questions[index];
            setScrambled(shuffleArray(word.split('')));
            setAnswer([]);
            setFeedback('');

            // 🎵 Mainkan musik saat pertanyaan pertama
            if (bgMusicRef.current && bgMusicRef.current.paused) {
                bgMusicRef.current.play().catch(err => console.warn("BGM error:", err));
            }
        }
    }, [index, questions]);


    const moveToNextQuestion = () => {
        const next = index + 1;
        if (next >= questions.length) {
            // 🔇 Hentikan BGM
            if (bgMusicRef.current) {
                bgMusicRef.current.pause();
                bgMusicRef.current.currentTime = 0;
            }

            setCurrentRound(2);
            navigate('/scoreboard');
        } else {
            setIndex(next);
        }
    };


    const handleTimeUp = () => {
        if (feedback) return;

        setFeedback(`timeout|${questions[index]}`);

        // ✅ Mainkan sound salah karena waktu habis
        if (wrongSoundRef.current) {
            wrongSoundRef.current.currentTime = 0;
            wrongSoundRef.current.play().catch(err => console.warn("Sound error:", err));
        }

        setTimeout(moveToNextQuestion, 2000);
    };



    const handleLetterClick = (letter, idx) => {
        if (feedback) return;
        setAnswer(prev => [...prev, { letter, idx }]);
        setScrambled(prev => prev.map((ch, i) => (i === idx ? null : ch)));
    };

    const handleUndo = () => {
        if (answer.length === 0 || feedback) return;
        const last = answer[answer.length - 1];
        setScrambled(prev => prev.map((ch, i) => (i === last.idx ? last.letter : ch)));
        setAnswer(prev => prev.slice(0, -1));
    };

    const handleSubmit = () => {
        if (feedback) return;

        const userAnswer = answer.map(a => a.letter).join('').toLowerCase();
        const correct = questions[index].toLowerCase();
        const currentTeamKey = index % 2 === 0 ? 'team1' : 'team2';

        if (userAnswer === correct) {
            addScore(currentTeamKey, POINTS, 1);
            setFeedback('correct');

            // ✅ play correct sound
            correctSoundRef.current?.play().catch(err => console.warn("Sound error:", err));
        } else {
            setFeedback(`wrong|${questions[index]}`);

            // ❌ play wrong sound
            wrongSoundRef.current?.play().catch(err => console.warn("Sound error:", err));
        }

        setTimeout(moveToNextQuestion, 2000);
    };


    if (!questions.length) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p className="loading-text">Loading...</p>
            </div>
        );
    }

    const currentTeamKey = index % 2 === 0 ? 'team1' : 'team2';
    const currentTeamName = currentTeamKey === 'team1' ? teams.team1 : teams.team2;

    const isCorrect = feedback === 'correct';
    const isTimeout = feedback.startsWith('timeout');
    const isWrong = feedback.startsWith('wrong') && !isTimeout;
    const wrongAnswer = (isWrong || isTimeout) ? feedback.split('|')[1] : '';

    return (
        <div className="round1-container">
            <div className="round1-header">
                <motion.h2
                    className="round1-title"
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    🎮 Ronde 1 — Susun Kata
                </motion.h2>

                <div className="round1-info">
                    <motion.div
                        className="info-badge"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        Soal: <strong>{index + 1}</strong> / {questions.length}
                    </motion.div>
                    <motion.div
                        className="info-badge"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
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
                />
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    className="game-board"
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                    transition={{ duration: 0.4 }}
                >
                    {/* Answer Area */}
                    <div className="answer-area">
                        {scrambled.map((_, i) => (
                            <motion.div
                                key={i}
                                className={`answer-slot ${answer[i] ? 'filled' : ''}`}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.3, delay: i * 0.05 }}
                            >
                                <AnimatePresence mode="wait">
                                    {answer[i] && (
                                        <motion.span
                                            key={answer[i].letter + i}
                                            initial={{ y: -40, scale: 0, opacity: 0 }}
                                            animate={{ y: 0, scale: 1, opacity: 1 }}
                                            exit={{ y: 20, scale: 0.5, opacity: 0 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 18 }}
                                        >
                                            {answer[i].letter}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>

                    {/* Letter Buttons */}
                    <div className="letters-area">
                        {scrambled.map((ch, idx) =>
                            ch ? (
                                <motion.button
                                    key={idx}
                                    onClick={() => handleLetterClick(ch, idx)}
                                    className="letter-btn"
                                    disabled={!!feedback}
                                    whileHover={!feedback ? { scale: 1.1 } : {}}
                                    whileTap={!feedback ? { scale: 0.85, rotate: -8 } : {}}
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 260,
                                        damping: 20,
                                        delay: idx * 0.03
                                    }}
                                    style={{
                                        cursor: feedback ? 'not-allowed' : 'pointer',
                                        opacity: feedback ? 0.6 : 1
                                    }}
                                >
                                    {ch}
                                </motion.button>
                            ) : (
                                <button
                                    key={idx}
                                    disabled
                                    className="letter-btn"
                                    style={{ opacity: 0.3 }}
                                />
                            )
                        )}
                    </div>

                    {/* Control Buttons */}
                    <div className="controls">
                        <motion.button
                            className="control-btn undo-btn"
                            whileHover={!feedback ? { scale: 1.05 } : {}}
                            whileTap={!feedback ? { scale: 0.95 } : {}}
                            onClick={handleUndo}
                            disabled={answer.length === 0 || !!feedback}
                        >
                            ⬅️ Undo
                        </motion.button>
                        <motion.button
                            className="control-btn submit-btn"
                            whileHover={!feedback ? { scale: 1.05 } : {}}
                            whileTap={!feedback ? { scale: 0.95 } : {}}
                            onClick={handleSubmit}
                            disabled={answer.length === 0 || !!feedback}
                        >
                            ✅ Submit
                        </motion.button>
                    </div>

                    {/* Feedback */}
                    <AnimatePresence mode="wait">
                        {feedback && (
                            <motion.div
                                key={feedback}
                                className={`feedback-message ${isCorrect ? 'feedback-success' :
                                    isTimeout ? 'feedback-timeout' :
                                        'feedback-error'
                                    }`}
                                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -20, scale: 0.8 }}
                                transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                            >
                                {isCorrect && (
                                    <>✅ Benar! +{POINTS} untuk {currentTeamName}</>
                                )}
                                {isTimeout && (
                                    <>⏰ Waktu Habis! Jawaban: {wrongAnswer}</>
                                )}
                                {isWrong && (
                                    <>❌ Salah. Jawaban: {wrongAnswer}</>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

// Separate Timer Component for clean isolation
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
                className={`timer-circle-r1 ${isWarning ? 'warning' : ''} ${isCritical ? 'critical' : ''}`}
                animate={isCritical ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.5, repeat: isCritical ? Infinity : 0 }}
            >
                <div className="timer-number-r1">{timeLeft}</div>
                <div className="timer-label-r1">detik</div>
            </motion.div>

            <div className="timer-bar-wrapper-r1">
                <motion.div
                    className="timer-bar-r1"
                    animate={{
                        width: `${timerPercentage}%`,
                        backgroundColor: isCritical ? '#dc3545' : isWarning ? '#ffc107' : '#00cec9'
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
