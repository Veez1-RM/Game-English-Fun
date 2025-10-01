import React from 'react';

export default function QuestionCard({ questionText, options = [], onOptionClick, showOptions = true }) {
  return (
    <div className="box">
      <h3>{questionText}</h3>
      {showOptions && (
        <div style={{ marginTop: 12 }}>
          {options.map((opt, idx) => (
            <div key={idx} style={{ margin: '6px 0' }}>
              <button onClick={() => onOptionClick(idx)}>{String.fromCharCode(65 + idx)}. {opt}</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
