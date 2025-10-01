import React, { createContext, useState, useEffect } from 'react';

export const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [teams, setTeams] = useState({ team1: 'Kelompok 1', team2: 'Kelompok 2' });
  const [scores, setScores] = useState({ team1: 0, team2: 0 });
  const [currentRound, setCurrentRound] = useState(1);

  // load saved
  useEffect(() => {
    const s = localStorage.getItem('quiz_game_state');
    if (s) {
      const parsed = JSON.parse(s);
      if (parsed.teams) setTeams(parsed.teams);
      if (parsed.scores) setScores(parsed.scores);
      if (parsed.currentRound) setCurrentRound(parsed.currentRound);
    }
  }, []);

  // persist
  useEffect(() => {
    localStorage.setItem('quiz_game_state', JSON.stringify({ teams, scores, currentRound }));
  }, [teams, scores, currentRound]);

  const setTeamNames = (t1, t2) => setTeams({ team1: t1, team2: t2 });
  const addScore = (teamKey, points) => {
    setScores(prev => ({ ...prev, [teamKey]: (prev[teamKey] || 0) + points }));
  };
  const resetGame = () => {
    setTeams({ team1: 'Kelompok 1', team2: 'Kelompok 2' });
    setScores({ team1: 0, team2: 0 });
    setCurrentRound(1);
    localStorage.removeItem('quiz_game_state');
  };

  return (
    <GameContext.Provider value={{
      teams, setTeamNames, scores, addScore,
      currentRound, setCurrentRound, resetGame
    }}>
      {children}
    </GameContext.Provider>
  );
};
