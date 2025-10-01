import React, { useContext, useEffect, useState } from 'react';
import round1Pool from '../data/round1.json';
import { shuffleArray, scrambleWord } from '../utils/shuffle';
import { GameContext } from '../context/GameContext';
import { useNavigate } from 'react-router-dom';

const QUESTIONS_PER_TEAM = 2;
const POINTS = 10;

export default function Round1(){
  const { teams, addScore, setCurrentRound } = useContext(GameContext);
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    // shuffle pool and pick enough questions (total = 2 * QUESTIONS_PER_TEAM)
    const pool = shuffleArray(round1Pool);
    const total = Math.min(pool.length, QUESTIONS_PER_TEAM * 2);
    setQuestions(pool.slice(0, total));
    setIndex(0);
  }, []);

  if (!questions.length) return <div className="container center"><p>Loading questions...</p></div>;

  const currentTeamKey = index % 2 === 0 ? 'team1' : 'team2';
  const currentTeamName = currentTeamKey === 'team1' ? teams.team1 : teams.team2;
  const currentAnswer = questions[index];

  const handleSubmit = () => {
    if (!input.trim()) return;
    const normalized = input.trim().toLowerCase();
    const correct = currentAnswer.toLowerCase();
    if (normalized === correct) {
      addScore(currentTeamKey, POINTS);
      setFeedback(`Benar! +${POINTS} untuk ${currentTeamName}`);
    } else {
      setFeedback(`Salah. Jawaban: ${currentAnswer}`);
    }
    setInput('');
    // move to next question after short delay
    setTimeout(() => {
      const next = index + 1;
      if (next >= questions.length) {
        // ronde selesai
        setCurrentRound(2);
        navigate('/scoreboard');
      } else {
        setIndex(next);
        setFeedback('');
      }
    }, 800);
  };

  return (
    <div className="container">
      <h2>Ronde 1 — Susun Kata (Giliran)</h2>
      <div style={{ display:'flex', gap: 12, marginTop: 12 }}>
        <div style={{flex:1}}>
          <p>Soal ke: {index + 1} / {questions.length}</p>
          <p>Giliran: <strong>{currentTeamName}</strong></p>
          <div className="box" style={{ fontSize: 28, letterSpacing: 3 }}>
            {scrambleWord(currentAnswer)}
          </div>

          <div style={{ marginTop: 12 }}>
            <input value={input} onChange={(e)=>setInput(e.target.value)} placeholder="Tulis jawaban disini" />
            <button onClick={handleSubmit} style={{ marginLeft: 8 }}>Submit</button>
          </div>

          {feedback && <p style={{ marginTop: 8 }}>{feedback}</p>}
        </div>
      </div>
    </div>
  );
}
