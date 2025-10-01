import React, { useContext, useEffect, useState } from 'react';
import pool from '../data/round2.json';
import { shuffleArray } from '../utils/shuffle';
import { GameContext } from '../context/GameContext';
import { useNavigate } from 'react-router-dom';

const QUESTIONS_PER_TEAM = 2;
const POINTS = 15;

export default function Round2(){
  const { teams, addScore, setCurrentRound } = useContext(GameContext);
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const poolShuffled = shuffleArray(pool);
    const total = Math.min(poolShuffled.length, QUESTIONS_PER_TEAM * 2);
    setQuestions(poolShuffled.slice(0, total));
    setIndex(0);
  }, []);

  if (!questions.length) return <div className="container center"><p>Loading questions...</p></div>;

  const currentTeamKey = index % 2 === 0 ? 'team1' : 'team2';
  const currentTeamName = currentTeamKey === 'team1' ? teams.team1 : teams.team2;
  const q = questions[index];

  const handleOption = (optIndex) => {
    if (optIndex === q.answer) {
      addScore(currentTeamKey, POINTS);
      setFeedback(`Benar! +${POINTS} untuk ${currentTeamName}`);
    } else {
      setFeedback(`Salah. Jawaban benar: ${String.fromCharCode(65 + q.answer)}.`);
    }

    setTimeout(() => {
      const next = index + 1;
      if (next >= questions.length) {
        setCurrentRound(3);
        navigate('/scoreboard');
      } else {
        setIndex(next);
        setFeedback('');
      }
    }, 800);
  };

  return (
    <div className="container">
      <h2>Ronde 2 — Quiz ABCD (Giliran)</h2>
      <p>Soal ke: {index + 1} / {questions.length}</p>
      <p>Giliran: <strong>{currentTeamName}</strong></p>
      <div className="box" style={{ marginTop: 12 }}>
        <h3>{q.question}</h3>
        <div style={{ marginTop: 10 }}>
          {q.options.map((opt, i) => (
            <div key={i} style={{ margin: '6px 0' }}>
              <button onClick={() => handleOption(i)}>{String.fromCharCode(65 + i)}. {opt}</button>
            </div>
          ))}
        </div>
      </div>
      {feedback && <p style={{ marginTop: 12 }}>{feedback}</p>}
    </div>
  );
}
