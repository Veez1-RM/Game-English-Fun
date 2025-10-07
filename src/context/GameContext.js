import React, { createContext, useState, useEffect } from 'react';

export const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [isBonusRound, setIsBonusRound] = useState(false);
  const [teams, setTeams] = useState({ team1: 'Kelompok 1', team2: 'Kelompok 2' });
  const [scores, setScores] = useState({
    team1: 0,
    team2: 0,
    perRound: {
      team1: { 1: 0, 2: 0, 3: 0 },
      team2: { 1: 0, 2: 0, 3: 0 },
    },
  });
  const [currentRound, setCurrentRound] = useState(1);

  // --- helper simpan state ---
  const saveState = (newState = {}) => {
    const state = {
      teams,
      scores,
      currentRound,
      isBonusRound,
      ...newState,
    };
    localStorage.setItem("quiz_game_state", JSON.stringify(state));
  };

  // load saved state sekali di awal
  useEffect(() => {
    const s = localStorage.getItem("quiz_game_state");
    if (s) {
      try {
        const parsed = JSON.parse(s);
        if (parsed.teams) setTeams(parsed.teams);
        if (parsed.scores) setScores(parsed.scores);
        if (
          typeof parsed.currentRound === "number" &&
          parsed.currentRound >= 1 &&
          parsed.currentRound <= 3
        ) {
          setCurrentRound(parsed.currentRound);
        }
        if (typeof parsed.isBonusRound === "boolean") {
          setIsBonusRound(parsed.isBonusRound);
        }
      } catch (err) {
        console.error("Failed to load state:", err);
        setCurrentRound(1);
      }
    }
  }, []);

  // --- actions ---
  const setTeamNames = (t1, t2) => {
    setTeams({ team1: t1, team2: t2 });
    saveState({ teams: { team1: t1, team2: t2 } });
  };

  const addScore = (teamKey, points, round) => {
    setScores(prev => {
      const newScores = {
        ...prev,
        [teamKey]: (prev[teamKey] || 0) + points,
        perRound: {
          ...prev.perRound,
          [teamKey]: {
            ...prev.perRound[teamKey],
            [round]: (prev.perRound[teamKey][round] || 0) + points,
          },
        },
      };
      saveState({ scores: newScores });
      return newScores;
    });
  };

  const updateRound = (round) => {
    setCurrentRound(round);
    saveState({ currentRound: round });
  };

  const toggleBonusRound = (status) => {
    setIsBonusRound(status);
    saveState({ isBonusRound: status });
  };

  const resetGame = () => {
    const defaultTeams = { team1: 'Kelompok 1', team2: 'Kelompok 2' };
    const defaultScores = {
      team1: 0,
      team2: 0,
      perRound: {
        team1: { 1: 0, 2: 0, 3: 0 },
        team2: { 1: 0, 2: 0, 3: 0 },
      },
    };
    setTeams(defaultTeams);
    setScores(defaultScores);
    setCurrentRound(1);
    setIsBonusRound(false);
    localStorage.removeItem("quiz_game_state");
  };

  return (
    <GameContext.Provider
      value={{
        teams,
        setTeamNames,
        scores,
        addScore,
        currentRound,
        setCurrentRound: updateRound,
        isBonusRound,
        setBonusRound: toggleBonusRound,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
