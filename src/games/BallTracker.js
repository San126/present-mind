import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';

const LEVELS = [
  { name: 'Calm', balls: 1, speed: 1400, points: 1, color: '#7a9e87', emoji: '🟢' },
  { name: 'Focus', balls: 1, speed: 1000, points: 2, color: '#4a90b8', emoji: '🔵' },
  { name: 'Sharp', balls: 2, speed: 800, points: 3, color: '#c46a2a', emoji: '🟠' },
  { name: 'Swift', balls: 2, speed: 600, points: 5, color: '#8a4ca0', emoji: '🟣' },
  { name: 'Elite', balls: 3, speed: 500, points: 8, color: '#c43a3a', emoji: '🔴' },
];

function randomPos() {
  return { x: 15 + Math.random() * 70, y: 15 + Math.random() * 70 };
}

export default function BallTracker({ onClose }) {
  const { profile, updateProfile, getAdaptiveContent } = useApp();
  const adaptive = getAdaptiveContent();
  const [phase, setPhase] = useState('intro'); // intro, playing, done
  const [levelIdx, setLevelIdx] = useState(0);
  const [balls, setBalls] = useState([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [misses, setMisses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [ripples, setRipples] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [highScore, setHighScore] = useState(profile.ballHighScore || 0);
  const arenRef = useRef(null);
  const timerRef = useRef(null);
  const moveRefs = useRef([]);

  const level = LEVELS[Math.min(levelIdx, LEVELS.length - 1)];

  const spawnBalls = useCallback((lvl) => {
    return Array.from({ length: lvl.balls }, (_, i) => ({
      id: i,
      ...randomPos(),
      key: Date.now() + i,
    }));
  }, []);

  const moveBall = useCallback((ballId, lvlSpeed) => {
    setBalls(prev => prev.map(b => b.id === ballId ? { ...b, ...randomPos(), key: Date.now() + ballId } : b));
  }, []);

  const startGame = useCallback(() => {
    const startLevel = adaptive.pacePreference === 'slow' ? 0 : adaptive.pacePreference === 'fast' ? 1 : 0;
    setLevelIdx(startLevel);
    setScore(0); setStreak(0); setMisses(0); setTimeLeft(30);
    setBalls(spawnBalls(LEVELS[startLevel]));
    setPhase('playing');
  }, [adaptive.pacePreference, spawnBalls]);

  // Move balls on interval
  useEffect(() => {
    if (phase !== 'playing') return;
    moveRefs.current.forEach(r => clearInterval(r));
    moveRefs.current = balls.map(b =>
      setInterval(() => moveBall(b.id, level.speed), level.speed)
    );
    return () => moveRefs.current.forEach(r => clearInterval(r));
  }, [phase, levelIdx, balls.length, level.speed, moveBall]);

  // Timer
  useEffect(() => {
    if (phase !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { endGame(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const endGame = useCallback(() => {
    moveRefs.current.forEach(r => clearInterval(r));
    clearInterval(timerRef.current);
    setPhase('done');
    setHighScore(prev => {
      const newHs = Math.max(prev, score);
      updateProfile({ ballHighScore: newHs });
      return newHs;
    });
  }, [score, updateProfile]);

  const hitBall = (e, ballId) => {
    e.stopPropagation();
    const arena = arenRef.current;
    if (!arena) return;
    const rect = arena.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    // Add ripple
    const rippleId = Date.now();
    setRipples(prev => [...prev, { id: rippleId, x: cx, y: cy, hit: true }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== rippleId)), 700);

    const pts = level.points;
    const newStreak = streak + 1;
    const bonus = newStreak > 4 ? Math.floor(newStreak / 5) : 0;
    setStreak(newStreak);
    setMaxStreak(prev => Math.max(prev, newStreak));
    setScore(prev => prev + pts + bonus);

    // Feedback
    const msgs = newStreak > 9 ? ['🔥 ON FIRE!', '⚡ UNSTOPPABLE!'] :
                 newStreak > 4 ? ['🎯 STREAK!', '✨ SHARP!'] :
                 ['👁 Got it!', '✓ Nice!', '⚡ Hit!'];
    setFeedback({ text: msgs[Math.floor(Math.random() * msgs.length)], x: cx, y: cy });
    setTimeout(() => setFeedback(null), 700);

    // Move hit ball immediately
    setBalls(prev => prev.map(b => b.id === ballId ? { ...b, ...randomPos(), key: Date.now() + ballId } : b));

    // Level up every 20 points
    if ((score + pts + bonus) % 20 === 0 && levelIdx < LEVELS.length - 1) {
      setLevelIdx(prev => Math.min(prev + 1, LEVELS.length - 1));
      setBalls(spawnBalls(LEVELS[Math.min(levelIdx + 1, LEVELS.length - 1)]));
    }
  };

  const missClick = (e) => {
    if (phase !== 'playing') return;
    const arena = arenRef.current;
    if (!arena) return;
    const rect = arena.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const rippleId = Date.now();
    setRipples(prev => [...prev, { id: rippleId, x: cx, y: cy, hit: false }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== rippleId)), 600);
    setStreak(0);
    setMisses(m => m + 1);
  };

  const accuracy = misses + score > 0 ? Math.round((score / (score + misses)) * 100) : 100;

  if (phase === 'intro') {
    return (
      <div className="section fade-in">
        <h2 style={{ fontFamily: 'Lora,serif', marginBottom: 8 }}>Ball Tracking</h2>
        <p style={{ marginBottom: 20, lineHeight: 1.8 }}>
          {adaptive.isChild
            ? 'A moving ball will appear — tap it as fast as you can! This is a fun eye exercise. 🎯'
            : adaptive.useFacts
            ? 'Eye-tracking exercises stimulate neural pathways damaged by stress and trauma. Following moving targets rebuilds focus circuits in the prefrontal cortex.'
            : 'Follow the ball with your eyes and tap it. This neural exercise rebuilds focus and calms an overactive mind by training your attention circuits.'}
        </p>
        <div className="card" style={{ marginBottom: 16 }}>
          <p style={{ fontWeight: 600, marginBottom: 10, fontSize: 14 }}>Difficulty levels</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {LEVELS.map((l, i) => (
              <div key={l.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'var(--light)', borderRadius: 10 }}>
                <span>{l.emoji}</span>
                <span style={{ fontWeight: 600, fontSize: 13, minWidth: 50 }}>{l.name}</span>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{l.balls} ball{l.balls > 1 ? 's' : ''} · {l.points} pts each</span>
                {i === 0 && <span style={{ marginLeft: 'auto', fontSize: 11, background: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: 20 }}>Start</span>}
              </div>
            ))}
          </div>
        </div>
        {highScore > 0 && (
          <div style={{ textAlign: 'center', padding: '10px', marginBottom: 16, background: 'var(--light)', borderRadius: 12 }}>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Your best: </span>
            <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>🏆 {highScore} pts</span>
          </div>
        )}
        <button className="btn btn-primary" onClick={startGame}>
          {adaptive.isChild ? '🎯 Let\'s play!' : 'Start tracking'}
        </button>
      </div>
    );
  }

  if (phase === 'done') {
    const isNewHigh = score >= highScore;
    const grade = accuracy > 85 ? 'Excellent' : accuracy > 70 ? 'Good' : accuracy > 55 ? 'Keep going' : 'Keep practicing';
    return (
      <div className="section fade-in" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>{isNewHigh ? '🏆' : score > 15 ? '🎯' : '💪'}</div>
        <h2 style={{ fontFamily: 'Lora,serif', marginBottom: 4 }}>{isNewHigh ? 'New High Score!' : grade}</h2>
        <p style={{ marginBottom: 24 }}>Your brain just did some real work. That focus? You're building it.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24, textAlign: 'left' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, marginBottom: 4 }}>SCORE</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--primary)' }}>{score}</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, marginBottom: 4 }}>ACCURACY</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--primary)' }}>{accuracy}%</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, marginBottom: 4 }}>BEST STREAK</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--primary)' }}>{maxStreak}🔥</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, marginBottom: 4 }}>LEVEL REACHED</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)' }}>{level.emoji} {level.name}</div>
          </div>
        </div>

        {isNewHigh && (
          <div style={{ padding: '12px', background: 'var(--light)', borderRadius: 12, marginBottom: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>🏆 New personal best: {score} pts</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button className="btn btn-primary" onClick={startGame}>Play again</button>
          <button className="btn btn-soft" onClick={onClose}>Back to activities</button>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      {/* HUD */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)' }}>{score}</span>
          <span style={{ fontSize: 13, color: 'var(--muted)', marginLeft: 4 }}>pts</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {streak > 2 && <span style={{ fontSize: 13, fontWeight: 700, color: '#e07a00' }}>🔥 ×{streak}</span>}
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>{level.emoji} {level.name}</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: timeLeft < 10 ? '#c43a3a' : 'var(--primary)' }}>{timeLeft}</span>
          <span style={{ fontSize: 13, color: 'var(--muted)', marginLeft: 2 }}>s</span>
        </div>
      </div>

      {/* Timer bar */}
      <div className="progress-bar" style={{ marginBottom: 14 }}>
        <div className="progress-fill" style={{ width: `${(timeLeft / 30) * 100}%`, background: timeLeft < 10 ? '#c43a3a' : 'var(--primary)', transition: 'width 1s linear' }} />
      </div>

      {/* Arena */}
      <div
        className="ball-arena"
        ref={arenRef}
        onClick={missClick}
        style={{ border: `2px solid ${level.color}33`, background: `${level.color}18` }}
      >
        {/* Balls */}
        {balls.map(b => (
          <div
            key={b.key}
            className="ball-target catchable"
            onClick={e => hitBall(e, b.id)}
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
              background: `radial-gradient(circle at 35% 35%, ${level.color}cc, ${level.color})`,
              width: adaptive.isChild ? 52 : 44,
              height: adaptive.isChild ? 52 : 44,
              transition: `left ${level.speed * 0.85}ms cubic-bezier(.4,0,.2,1), top ${level.speed * 0.85}ms cubic-bezier(.4,0,.2,1)`,
            }}
          >
            {adaptive.isChild ? '🎯' : ''}
          </div>
        ))}

        {/* Ripples */}
        {ripples.map(r => (
          <div key={r.id} className="click-ripple" style={{ left: r.x, top: r.y, borderColor: r.hit ? level.color : '#c43a3a44' }} />
        ))}

        {/* Float feedback */}
        {feedback && (
          <div style={{
            position: 'absolute', left: feedback.x, top: feedback.y - 20,
            transform: 'translate(-50%,-50%)',
            fontWeight: 700, fontSize: 15, color: level.color,
            pointerEvents: 'none', animation: 'fadeInUp 0.6s ease forwards',
            zIndex: 10
          }}>
            {feedback.text}
          </div>
        )}

        <p style={{ position: 'absolute', bottom: 10, left: 0, right: 0, textAlign: 'center', fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>
          Tap the ball — don't move your head
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>Accuracy: <b style={{ color: 'var(--primary)' }}>{accuracy}%</b></span>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>Best: <b style={{ color: 'var(--primary)' }}>{highScore}</b></span>
        <button className="btn btn-ghost" style={{ padding: '4px 12px', fontSize: 12 }} onClick={endGame}>End</button>
      </div>
    </div>
  );
}
