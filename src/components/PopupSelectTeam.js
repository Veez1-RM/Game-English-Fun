import React from 'react';

export default function PopupSelectTeam({ show, onClose, teams, onSelect }) {
  if (!show) return null;
  return (
    <div className="overlay">
      <div className="modal">
        <h4>Jawaban ini dari tim?</h4>
        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <button onClick={() => onSelect('team1')}>{teams.team1}</button>
          <button onClick={() => onSelect('team2')}>{teams.team2}</button>
        </div>
        <div style={{ marginTop: 12 }}>
          <button onClick={onClose}>Batal</button>
        </div>
      </div>
    </div>
  );
}
