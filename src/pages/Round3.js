import React, { useContext, useEffect, useState } from 'react';
import pool from '../data/round3.json';
import { shuffleArray } from '../utils/shuffle';
import { GameContext } from '../context/GameContext';
import { useNavigate } from 'react-router-dom';
import PopupSelectTeam from '../components/PopupSelectTeam';

const POINTS = 20;

export default function Round3() {
  const { teams, addScore, setCurrentRound } = useContext(GameContext);
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    setQuestions(shuffleArray(pool));
    setIndex(0);
  }, []);

  if (!questions.length) {
    return (
      <div className="container center">
        <p>Loading images...</p>
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

    if (correct) {
      addScore(teamKey, POINTS, 3);
      setFeedback(`${teamName} benar! +${POINTS} poin`);
    } else {
      setFeedback(
        `Salah untuk ${teamName}. Jawaban benar: ${String.fromCharCode(
          65 + q.answer
        )}.`
      );
    }

    setTimeout(() => {
      const next = index + 1;
      if (next >= questions.length) {
        setCurrentRound(null); // semua soal ronde 3 selesai
        navigate('/scoreboard');
      } else {
        setIndex(next);
        setFeedback('');
        setSelectedOption(null); // reset jawaban untuk soal berikutnya
      }
    }, 900);
  };

  return (
    <div className="container">
      <h2>Ronde 3 — Tebak Gambar (Berebut)</h2>
      <p>
        Soal ke: {index + 1} / {questions.length}
      </p>

      <div style={{ marginTop: 12 }}>
        <div className="box center">
          <img
            src={process.env.PUBLIC_URL + '/' + q.image}
            alt="soal"
            style={{ maxWidth: '100%', height: 300, objectFit: 'contain' }}
          />
        </div>

        <div style={{ marginTop: 12 }}>
          {q.options.map((opt, idx) => (
            <button
              key={idx}
              style={{ marginRight: 8, marginTop: 8 }}
              onClick={() => handleOptionClick(idx)}
            >
              {String.fromCharCode(65 + idx)}. {opt}
            </button>
          ))}
        </div>

        {feedback && <p style={{ marginTop: 12 }}>{feedback}</p>}
      </div>

      <PopupSelectTeam
        show={showPopup}
        onClose={() => setShowPopup(false)}
        teams={teams}
        onSelect={(teamKey) => handleAssign(teamKey)}
      />
    </div>
  );
}
