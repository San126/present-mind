import React from 'react';
import { useApp } from '../context/AppContext';
import BallTracker from '../games/BallTracker';
import BreathingGame from '../games/BreathingGame';
import TruthMirror from '../games/TruthMirror';
import AISafetyModule from '../games/AISafetyModule';
import { GroundingGame, SlowObservation } from '../games/GroundingGames';

const GAME_TITLES = {
  ball:      'Ball Tracking',
  breath:    'Breathing Space',
  grounding: '5-4-3-2-1 Grounding',
  truth:     'Truth Mirror',
  slow:      'Slow Observation',
  safety:    'AI Safety & Privacy',
};

export default function GameScreen({ gameId, onClose }) {
  const { markActivityDone } = useApp();

  const handleClose = () => {
    if (gameId !== 'safety') markActivityDone(gameId);
    onClose();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh',
      background: 'var(--bg)', paddingBottom: 24 }}>
      {/* Sticky back bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 200,
        background: 'var(--bg)', borderBottom: `1px solid var(--border)`,
        padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={handleClose} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--card)', border: `1.5px solid var(--border)`,
          borderRadius: 50, padding: '8px 16px', cursor: 'pointer',
          fontSize: 14, fontWeight: 600, color: 'var(--text)', fontFamily: 'inherit',
          flexShrink: 0, transition: 'all 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
          ← Back
        </button>
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
          {GAME_TITLES[gameId]}
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {gameId === 'ball'      && <BallTracker      onClose={handleClose} />}
        {gameId === 'breath'    && <BreathingGame     onClose={handleClose} />}
        {gameId === 'grounding' && <GroundingGame     onClose={handleClose} />}
        {gameId === 'truth'     && <TruthMirror       onClose={handleClose} />}
        {gameId === 'slow'      && <SlowObservation   onClose={handleClose} />}
        {gameId === 'safety'    && <AISafetyModule    onClose={handleClose} />}
      </div>
    </div>
  );
}
