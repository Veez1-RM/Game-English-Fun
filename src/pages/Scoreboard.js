import React, { useContext, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameContext } from "../context/GameContext";
import { useNavigate } from "react-router-dom";
import "./Scoreboard.css";

export default function Scoreboard() {
  const { teams, scores, currentRound } = useContext(GameContext);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  const isFinal = currentRound === null;
  const isDraw = scores.team1 === scores.team2;
  const winnerKey =
    scores.team1 > scores.team2 ? "team1" : scores.team2 > scores.team1 ? "team2" : null;

  const nextSoundRef = useRef(null);

  const winnerSoundRef = useRef(null);

  useEffect(() => {
    winnerSoundRef.current = new Audio("/audio/winner.mp3");
    winnerSoundRef.current.volume = 0.9;
  }, []);

  const handleShowWinnerPopup = () => {
    if (isDraw) {
      // Kalau seri, langsung ke ronde bonus
      if (nextSoundRef.current) {
        nextSoundRef.current.currentTime = 0;
        nextSoundRef.current.play().catch(err => console.warn("Audio error:", err));
      }

      setTimeout(() => {
        navigate("/bonus");
      }, 300);
    } else {
      // Kalau tidak seri, tampilkan popup pemenang
      if (winnerSoundRef.current) {
        winnerSoundRef.current.currentTime = 0;
        winnerSoundRef.current.play().catch(err => console.warn("Winner sound error:", err));
      }
      setShowPopup(true);
    }
  };




  useEffect(() => {
    nextSoundRef.current = new Audio("/audio/next-round.mp3");
    nextSoundRef.current.volume = 0.8; // atau sesuai kebutuhan
  }, []);


  const renderBreakdown = (teamKey) => {
    if (!scores.perRound) return null;
    return (
      <ul className="breakdown-list">
        <li>
          <span>Round 1:</span>
          <strong>{scores.perRound[teamKey][1]} point</strong>
        </li>
        <li>
          <span>Round 2:</span>
          <strong>{scores.perRound[teamKey][2]} point</strong>
        </li>
        <li>
          <span>Round 3:</span>
          <strong>{scores.perRound[teamKey][3]} point</strong>
        </li>
      </ul>
    );
  };

  const handleNextRound = () => {
    if (nextSoundRef.current) {
      nextSoundRef.current.currentTime = 0;
      nextSoundRef.current.play().catch((err) => console.warn("Audio error:", err));
    }

    setTimeout(() => {
      navigate(`/round${currentRound}`);
    }, 300); // delay sedikit agar suara sempat terdengar
  };


  return (
    <div className="scoreboard-container">
      <motion.div
        className="scoreboard-header"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="scoreboard-title">
          {isFinal ? "🏆 FINAL RESULT 🏆" : "SCOREBOARD"}
        </h2>
        {!isFinal && (
          <p className="scoreboard-subtitle">
            Prepare For Round {currentRound}!
          </p>
        )}
      </motion.div>

      <motion.div
        className="score-board"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="teams-grid">
          {/* Team 1 */}
          <motion.div
            className={`team-card ${isFinal && !isDraw && winnerKey === "team1" ? "winner" : ""
              }`}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="team-name">
              {isFinal && !isDraw && winnerKey === "team1" && "👑 "}
              {teams.team1}
            </div>
            <div className="team-score">{scores.team1}</div>
            <div style={{ fontSize: "0.9rem", color: "#a78bfa" }}>point</div>
            {renderBreakdown("team1")}
          </motion.div>

          {/* Team 2 */}
          <motion.div
            className={`team-card ${isFinal && !isDraw && winnerKey === "team2" ? "winner" : ""
              }`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="team-name">
              {isFinal && !isDraw && winnerKey === "team2" && "👑 "}
              {teams.team2}
            </div>
            <div className="team-score">{scores.team2}</div>
            <div style={{ fontSize: "0.9rem", color: "#a78bfa" }}>point</div>
            {renderBreakdown("team2")}
          </motion.div>
        </div>
      </motion.div>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        {isFinal ? (
          isDraw ? (
            <button
              className="scoreboard-button button-continue"
              onClick={() => navigate("/bonus")}
            >
              Play Extra Round 🎯
            </button>
          ) : (
            <button
              className="scoreboard-button button-finish"
              onClick={handleShowWinnerPopup}
            >
              Finish
            </button>
          )
        ) : (
          <button
            className="scoreboard-button button-continue"
            onClick={handleNextRound}
          >
            Next Round {currentRound} ▶
          </button>
        )}
      </motion.div>


      {/* Winner Popup */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            className="winner-popup-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setShowPopup(false)}
          >
            <motion.div
              className="winner-popup"
              initial={{ scale: 0.5, opacity: 0, rotateY: -30 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotateY: 30 }}
              transition={{
                duration: 0.6,
                type: "spring",
                stiffness: 200
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {isDraw ? (
                <>
                  <motion.h2
                    className="trophy-emoji"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                  >
                    🤝
                  </motion.h2>
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    Draw!
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    style={{ color: "#a78bfa", fontSize: "1.2rem", margin: "20px 0" }}
                  >
                    Both teams played very well!
                  </motion.p>
                </>
              ) : (
                <>
                  <motion.h2
                    className="trophy-emoji"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  >
                    🏆
                  </motion.h2>
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    Winner :
                  </motion.h2>
                  <motion.h1
                    className="winner-name"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7, type: "spring", stiffness: 150 }}
                  >
                    {teams[winnerKey]}
                  </motion.h1>
                </>
              )}
              <motion.button
                className="popup-btn"
                onClick={() => navigate("/")}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Play Again 🔁
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}