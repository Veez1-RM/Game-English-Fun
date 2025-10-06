import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './PopupSelectTeam.css';

export default function PopupSelectTeam({ show, onClose, teams, onSelect }) {
  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="popup-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          <motion.div
            className="popup-content"
            initial={{ scale: 0.7, opacity: 0, rotateX: -30 }}
            animate={{ scale: 1, opacity: 1, rotateX: 0 }}
            exit={{ scale: 0.7, opacity: 0, rotateX: 30 }}
            transition={{ 
              duration: 0.5,
              type: "spring",
              stiffness: 200
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="popup-close-btn" onClick={onClose}>
              ✕
            </button>

            <div className="popup-header">
              <motion.div 
                className="popup-icon"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
              >
                🏆
              </motion.div>
              <motion.h3 
                className="popup-title"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Pilih Tim yang Menjawab
              </motion.h3>
              <motion.p 
                className="popup-subtitle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Tim mana yang paling cepat?
              </motion.p>
            </div>

            <div className="teams-container">
              <motion.button
                className="team-button team1-btn"
                onClick={() => onSelect('team1')}
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 150 }}
                whileHover={{ scale: 1.03, y: -8 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div 
                  className="team-icon"
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ 
                    delay: 0.7,
                    duration: 0.5,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                >
                  👥
                </motion.div>
                <span className="team-name">{teams.team1}</span>
                <span className="team-arrow">→</span>
              </motion.button>

              <motion.button
                className="team-button team2-btn"
                onClick={() => onSelect('team2')}
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6, type: "spring", stiffness: 150 }}
                whileHover={{ scale: 1.03, y: -8 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div 
                  className="team-icon"
                  animate={{ rotate: [0, 10, -10, 10, 0] }}
                  transition={{ 
                    delay: 0.8,
                    duration: 0.5,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                >
                  👥
                </motion.div>
                <span className="team-name">{teams.team2}</span>
                <span className="team-arrow">→</span>
              </motion.button>
            </div>

            <motion.button
              className="cancel-button"
              onClick={onClose}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.02, y: -3 }}
              whileTap={{ scale: 0.98 }}
            >
              ❌ Batal
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}