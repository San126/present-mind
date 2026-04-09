import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

const PATTERNS = {
  slow: { in: 5, hold1: 3, out: 7, hold2: 3, name: '5-3-7-3 Deep Rest', desc: 'Very slow, deeply calming' },
  medium: { in: 4, hold1: 2, out: 6, hold2: 2, name: '4-2-6-2 Balance', desc: 'Classic calming pattern' },
  fast: { in: 3, hold1: 1, out: 5, hold2: 1, name: '3-1-5-1 Quick Reset', desc: 'Short but effective' },
};

export default function BreathingGame({ onClose }) {
  const { getAdaptiveContent, profile } = useApp();
  const adaptive = getAdaptiveContent();
  const pattern = PATTERNS[adaptive.speed] || PATTERNS.medium;
  const totalCycle = pattern.in + pattern.hold1 + pattern.out + pattern.hold2;

  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState(0); // 0=in,1=hold,2=out,3=hold2
  const [phaseTime, setPhaseTime] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [size, setSize] = useState(80);
  const intRef = useRef(null);

  const phases = [
    { label: 'Breathe in', duration: pattern.in, targetSize: 130 },
    { label: 'Hold...', duration: pattern.hold1, targetSize: 130 },
    { label: 'Breathe out', duration: pattern.out, targetSize: 70 },
    { label: 'Hold...', duration: pattern.hold2, targetSize: 70 },
  ];

  useEffect(() => {
    if (!running) return;
    let ph = phase, pt = phaseTime;
    intRef.current = setInterval(() => {
      pt++;
      if (pt >= phases[ph].duration) {
        ph = (ph + 1) % 4;
        pt = 0;
        if (ph === 0) setCycles(c => c + 1);
        setPhase(ph);
        setSize(phases[ph].targetSize);
      }
      setPhaseTime(pt);
    }, 1000);
    return () => clearInterval(intRef.current);
  }, [running, phase, phaseTime]);

  const start = () => {
    setPhase(0); setPhaseTime(0); setSize(130);
    setRunning(true);
  };
  const stop = () => { setRunning(false); clearInterval(intRef.current); };

  const currentPhase = phases[phase];

  return (
    <div className="section fade-in">
      <h2 style={{ fontFamily: 'Lora,serif', marginBottom: 6 }}>Breathing Space</h2>
      <p style={{ marginBottom: 4 }}>{pattern.name}</p>
      <p style={{ fontSize: 12, marginBottom: 24 }}>
        {adaptive.useFacts
          ? 'Slow breathing activates the parasympathetic nervous system, reducing cortisol and lowering heart rate within minutes.'
          : adaptive.isChild
          ? 'Breathing slowly is like charging your body\'s battery! 🔋'
          : 'Slow breathing signals safety to your nervous system. Your body calms when your breath leads.'}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
        {/* Breathing ring */}
        <div style={{ position: 'relative', width: 180, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            width: size, height: size,
            borderRadius: '50%',
            background: `radial-gradient(circle at 40% 40%, var(--accent), var(--primary))`,
            opacity: 0.85,
            transition: `width ${currentPhase.duration * 0.9}s ease-in-out, height ${currentPhase.duration * 0.9}s ease-in-out`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 30px var(--light)',
          }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>
              {running ? currentPhase.duration - phaseTime : ''}
            </span>
          </div>
          {/* Outer ring */}
          <div style={{ position: 'absolute', width: 160, height: 160, borderRadius: '50%', border: '2px dashed var(--border)' }} />
        </div>

        <p style={{ fontSize: 22, fontWeight: 600, color: 'var(--primary)', marginTop: 16, minHeight: 32, fontFamily: 'Lora,serif', fontStyle: 'italic' }}>
          {running ? currentPhase.label : 'Press start'}
        </p>

        {cycles > 0 && (
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{cycles} {cycles === 1 ? 'cycle' : 'cycles'} complete ✓</p>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        {!running
          ? <button className="btn btn-primary" onClick={start}>Start breathing</button>
          : <button className="btn btn-soft" onClick={stop}>Pause</button>
        }
        {cycles >= 3 && (
          <button className="btn btn-ghost" onClick={onClose}>I'm done ✓</button>
        )}
      </div>

      {cycles >= 3 && (
        <div style={{ marginTop: 16, padding: 14, background: 'var(--light)', borderRadius: 14, textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'var(--primary)', fontWeight: 600 }}>
            ✓ 3 cycles complete — your nervous system is calmer now
          </p>
        </div>
      )}
    </div>
  );
}
