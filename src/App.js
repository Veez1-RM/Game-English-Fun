import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import StartPage from './pages/StartPage';
import Round1 from './pages/Round1';
import Round2 from './pages/Round2';
import Round3 from './pages/Round3';
import Scoreboard from './pages/Scoreboard';

function App(){
  return (
    <GameProvider>
      <Router>
        <Routes>
          <Route path="/" element={<StartPage />} />
          <Route path="/round1" element={<Round1 />} />
          <Route path="/round2" element={<Round2 />} />
          <Route path="/round3" element={<Round3 />} />
          <Route path="/scoreboard" element={<Scoreboard />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </GameProvider>
  );
}

export default App;
