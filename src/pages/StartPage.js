import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContext } from '../context/GameContext';

export default function StartPage(){
  const { teams, setTeamNames, resetGame, setCurrentRound } = useContext(GameContext);
  const [t1, setT1] = useState(teams.team1);
  const [t2, setT2] = useState(teams.team2);
  const navigate = useNavigate();

  const handleStart = () => {
    resetGame();           // clear previous session
    setTeamNames(t1, t2);
    setCurrentRound(1);
    navigate('/round1');
  };

  return (
    <div className="container center">
      <h1>Quiz Battle — 3 Ronde</h1>
      <div style={{ marginTop: 20 }}>
        <div style={{ marginBottom: 8 }}>
          <label>Nama Kelompok 1</label><br/>
          <input value={t1} onChange={(e) => setT1(e.target.value)} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Nama Kelompok 2</label><br/>
          <input value={t2} onChange={(e) => setT2(e.target.value)} />
        </div>
        <button onClick={handleStart} style={{ marginTop: 12 }}>Mulai Game</button>
      </div>
    </div>
  );
}
