import React, { useContext, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import round1Pool from '../data/round1.json';
import { shuffleArray } from '../utils/shuffle';
import { GameContext } from '../context/GameContext';
import { useNavigate } from 'react-router-dom';

const QUESTIONS_PER_TEAM = 2;
const POINTS = 10;

export default function Round1() {
    const { teams, addScore, setCurrentRound } = useContext(GameContext);
    const navigate = useNavigate();

    const [questions, setQuestions] = useState([]);
    const [index, setIndex] = useState(0);
    const [scrambled, setScrambled] = useState([]);
    const [answer, setAnswer] = useState([]);
    const [feedback, setFeedback] = useState('');

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
        }
    }, [index, questions]);

    if (!questions.length) return <div className="container center"><p>Loading...</p></div>;

    const currentTeamKey = index % 2 === 0 ? 'team1' : 'team2';
    const currentTeamName = currentTeamKey === 'team1' ? teams.team1 : teams.team2;
    const correctAnswer = questions[index];

    const handleLetterClick = (letter, idx) => {
        setAnswer(prev => [...prev, { letter, idx }]);
        setScrambled(prev => prev.map((ch, i) => (i === idx ? null : ch)));
    };

    const handleUndo = () => {
        if (answer.length === 0) return;
        const last = answer[answer.length - 1];
        setScrambled(prev => prev.map((ch, i) => (i === last.idx ? last.letter : ch)));
        setAnswer(prev => prev.slice(0, -1));
    };

    const handleSubmit = () => {
        const userAnswer = answer.map(a => a.letter).join('').toLowerCase();
        const correct = correctAnswer.toLowerCase();

        if (userAnswer === correct) {
            addScore(currentTeamKey, POINTS, 1);
            setFeedback(`✅ Benar! +${POINTS} untuk ${currentTeamName}`);
        } else {
            setFeedback(`❌ Salah. Jawaban: ${correctAnswer}`);
        }

        setTimeout(() => {
            const next = index + 1;
            if (next >= questions.length) {
                setCurrentRound(2);
                navigate('/scoreboard');
            } else {
                setIndex(next);
            }
        }, 1500);
    };

    return (
        <div className="container center">
            <h2>Ronde 1 — Susun Kata</h2>
            <p>Soal ke: {index + 1} / {questions.length}</p>
            <p>Giliran: <strong>{currentTeamName}</strong></p>

            {/* Area Jawaban */}
            <div style={{
                display: 'flex',
                gap: 10,
                justifyContent: 'center',
                margin: '20px 0'
            }}>
                {scrambled.map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            width: 55,
                            height: 55,
                            border: '2px solid #aaa',
                            borderRadius: 8,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 26,
                            background: answer[i] ? '#fffbe6' : '#f9f9f9',
                            boxShadow: '2px 2px 6px rgba(0,0,0,0.1)'
                        }}
                    >
                        <AnimatePresence>
                            {answer[i] && (
                                <motion.span
                                    key={answer[i].letter + i}
                                    initial={{ y: -40, scale: 0, opacity: 0 }}
                                    animate={{ y: 0, scale: 1, opacity: 1 }}
                                    exit={{ y: 20, scale: 0.5, opacity: 0 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 18 }}
                                    style={{ fontSize: 28, fontWeight: "bold" }}
                                >
                                    {answer[i].letter}
                                </motion.span>
                            )}
                        </AnimatePresence>

                    </motion.div>
                ))}
            </div>

            {/* Huruf acak */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 14,
                justifyContent: 'center',
                marginBottom: 20
            }}>
                {scrambled.map((ch, idx) =>
                    ch ? (
                        <motion.button
                            key={idx}
                            onClick={() => handleLetterClick(ch, idx)}
                            whileTap={{ scale: 0.7, rotate: -8 }}
                            animate={{ scale: [1, 1.15, 1], transition: { duration: 0.3 } }}
                            style={{
                                width: 55,
                                height: 55,
                                fontSize: 22,
                                fontWeight: 'bold',
                                borderRadius: '50%',
                                border: '2px solid #333',
                                background: '#e6f7ff',
                                cursor: 'pointer',
                                boxShadow: '2px 2px 8px rgba(0,0,0,0.15)',
                            }}
                        >
                            {ch}
                        </motion.button>
                    ) : (
                        <button
                            key={idx}
                            disabled
                            style={{
                                width: 55,
                                height: 55,
                                borderRadius: '50%',
                                border: '2px solid transparent',
                                background: '#eee',
                                opacity: 0.3,
                            }}
                        />
                    )
                )}

            </div>

            {/* Tombol kontrol */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleUndo}
                    disabled={answer.length === 0}
                >
                    ⬅️ Undo
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSubmit}
                    disabled={answer.length === 0}
                    style={{ background: '#4caf50', color: '#fff', fontWeight: 'bold' }}
                >
                    ✅ Submit
                </motion.button>
            </div>

            {/* Feedback */}
            <AnimatePresence>
                {feedback && (
                    <motion.p
                        key={feedback}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4 }}
                        style={{ marginTop: 16, fontSize: 18, fontWeight: 'bold' }}
                    >
                        {feedback}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}
