import React, { useContext } from "react";
import { GameContext } from "../context/GameContext";
import { useNavigate } from "react-router-dom";

export default function Scoreboard() {
  const { teams, scores, currentRound } = useContext(GameContext);
  const navigate = useNavigate();

  const isDraw = scores.team1 === scores.team2;
  const winnerKey =
    scores.team1 > scores.team2 ? "team1" : scores.team2 > scores.team1 ? "team2" : null;

  // helper untuk render breakdown per ronde
  const renderBreakdown = (teamKey) => {
    if (!scores.perRound) return null;
    return (
      <ul style={{ marginTop: 6, textAlign: "left" }}>
        <li>Ronde 1: {scores.perRound[teamKey][1]} poin</li>
        <li>Ronde 2: {scores.perRound[teamKey][2]} poin</li>
        <li>Ronde 3: {scores.perRound[teamKey][3]} poin</li>
      </ul>
    );
  };

  return (
    <div className="container center">
      {currentRound === null ? (
        <>
          <h2>FINAL RESULT 🎉</h2>
          <div className="box" style={{ fontSize: 22, marginBottom: 20 }}>
            <div
              style={{
                background: isDraw || winnerKey === "team1" ? "#ffd70055" : "transparent",
                padding: "8px",
                borderRadius: "6px",
                marginBottom: 10,
              }}
            >
              <p>
                {teams.team1}: <strong>{scores.team1}</strong> poin
              </p>
              {renderBreakdown("team1")}
            </div>

            <div
              style={{
                background: isDraw || winnerKey === "team2" ? "#ffd70055" : "transparent",
                padding: "8px",
                borderRadius: "6px",
              }}
            >
              <p>
                {teams.team2}: <strong>{scores.team2}</strong> poin
              </p>
              {renderBreakdown("team2")}
            </div>
          </div>

          {isDraw ? (
            <h3>🤝 Pertandingan Berakhir Seri!</h3>
          ) : (
            <h3>
              🏆 Pemenang:{" "}
              <span style={{ color: "green" }}>
                {winnerKey === "team1" ? teams.team1 : teams.team2}
              </span>
            </h3>
          )}

          <button style={{ marginTop: 20 }} onClick={() => navigate("/")}>
            Main Lagi 🔁
          </button>
        </>
      ) : (
        <>
          <h2>Skor Sementara</h2>
          <div className="box" style={{ fontSize: 20, marginBottom: 20 }}>
            <p>
              {teams.team1}: <strong>{scores.team1}</strong> poin
            </p>
            {renderBreakdown("team1")}
            <p style={{ marginTop: 12 }}>
              {teams.team2}: <strong>{scores.team2}</strong> poin
            </p>
            {renderBreakdown("team2")}
          </div>

          <button onClick={() => navigate(`/round${currentRound}`)}>
            Lanjut ke Ronde {currentRound} ▶
          </button>
        </>
      )}
    </div>
  );
}
