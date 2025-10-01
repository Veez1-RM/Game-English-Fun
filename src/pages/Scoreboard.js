import React, { useContext } from 'react';
import { GameContext } from '../context/GameContext';
import ScoreBoardBox from '../components/ScoreboardBox';
import { useNavigate } from 'react-router-dom';

export default function Scoreboard(){
  const { teams, scores, currentRound, setCurrentRound, resetGame } = useContext(GameContext);
  const navigate = useNavigate();

  const goNext = (nextRound) => {
  setCurrentRound(nextRound);
  navigate(`/round${nextRound}`);
};



  const winner = scores.team1 === scores.team2 ? 'DRAW' : (scores.team1 > scores.team2 ? teams.team1 : teams.team2);

  return (
    <div className="container center">
      <h2>Scoreboard</h2>
      <div style={{ display:'flex', gap: 12, justifyContent:'center', marginTop: 12 }}>
        <ScoreBoardBox name={teams.team1} score={scores.team1} />
        <ScoreBoardBox name={teams.team2} score={scores.team2} />
      </div>

      <div style={{ marginTop: 18 }}>
        {currentRound === 1 && (
            <button onClick={() => goNext(2)}>Lanjut ke Ronde 2</button>
            )}
            {currentRound === 2 && (
            <button onClick={() => goNext(3)}>Lanjut ke Ronde 3</button>
            )}
            {currentRound === 3 && (
            <>
                <h3>Hasil Akhir: {winner === 'DRAW' ? 'Seri' : `Pemenang: ${winner}`}</h3>
                <div style={{ marginTop: 10 }}>
                <button onClick={() => { resetGame(); navigate('/'); }}>
                    Main Lagi
                </button>
                </div>
            </>
            )}
        </div>
    </div>
  );
}
