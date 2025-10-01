import React from 'react';

export default function ScoreBoardBox({ name, score }) {
  return (
    <div className="box" style={{ padding: 16 }}>
      <h4>{name}</h4>
      <p style={{ fontSize: 22, fontWeight: 'bold' }}>{score}</p>
    </div>
  );
}
