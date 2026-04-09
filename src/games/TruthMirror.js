import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getKey, saveKey, runTruthMirror as runAgents } from '../utils/gemini';

const AGENT_LABELS = [
  '👂  Listener — understanding your words',
  '🔍  Truth Agent — separating facts from fears',
  '🌿  Grounding Agent — anchoring you to now',
  '→   Guide Agent — finding one concrete step',
];

const SECTIONS = [
  { key: 'heard',  icon: '👂', title: 'What I hear',          color: '#5b9fdc' },
  { key: 'truth',  icon: '🔍', title: 'What is actually true', color: '#4ab87a' },
  { key: 'ground', icon: '🌿', title: 'Right now',             color: '#7c6fe0' },
  { key: 'action', icon: '→',  title: 'One thing to try',      color: '#e08050' },
];

const STARTERS = [
  "I'm a burden to others",
  "My future feels hopeless",
  "I always ruin everything",
  "I'll never be okay",
];

export default function TruthMirror({ onClose }) {
  const { profile } = useApp();

  const [key, setKey]         = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [thought, setThought] = useState('');
  const [result, setResult]   = useState(null);   // { heard, truth, ground, action }
  const [phase, setPhase]     = useState('input'); // input | loading | result | error
  const [error, setError]     = useState('');
  const [step, setStep]       = useState(-1);      // which agent is running (0-3)

  useEffect(() => {
    const found = getKey();
    setKey(found);
    if (!found) setShowKey(true);
  }, []);

  const persistKey = () => {
    saveKey(keyInput);
    setKey(keyInput.trim());
    setKeyInput('');
    setShowKey(false);
  };

  const submit = async () => {
    if (!thought.trim() || !key) return;
    setPhase('loading');
    setResult(null);
    setError('');
    setStep(-1);

    try {
      const data = await runAgents(thought, s => setStep(s));
      setResult(data);
      setPhase('result');
    } catch (e) {
      setError(e.message || 'UNKNOWN');
      setPhase('error');
    }
  };

  const reset = () => {
    setThought('');
    setResult(null);
    setError('');
    setPhase('input');
    setStep(-1);
  };

  // ─── INPUT ────────────────────────────────────────────────────────────────
  if (phase === 'input') return (
    <div className="section fade-in">
      <h2 style={{ fontFamily: 'Lora,serif', marginBottom: 8 }}>Truth Mirror</h2>
      <p style={{ marginBottom: 20, lineHeight: 1.8, color: 'var(--muted)' }}>
        Write a thought that has been sitting heavy. I will reflect back what is actually real.
      </p>

      {showKey ? (
        <div style={{ background: 'rgba(74,144,184,0.12)', border: '1.5px solid rgba(74,144,184,0.4)', borderRadius: 16, padding: 20, marginBottom: 20 }}>
          <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>🔑 Gemini API key (free)</p>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 12 }}>
            Get free key at{' '}
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              aistudio.google.com/app/apikey
            </a>
            {' '}→ sign in → Create API Key
          </p>
          <input
            type="text" placeholder="AIzaSy..." value={keyInput}
            onChange={e => setKeyInput(e.target.value)}
            style={{ fontFamily: 'monospace', fontSize: 13, marginBottom: 10 }}
          />
          <button className="btn btn-primary" onClick={persistKey} disabled={!keyInput.trim().startsWith('AIza')}>
            Save key
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, padding: '8px 14px', background: 'rgba(74,184,120,0.1)', borderRadius: 10, border: '1px solid rgba(74,184,120,0.3)' }}>
          <span style={{ fontSize: 13 }}>🔑 {key.slice(0, 14)}...</span>
          <button onClick={() => { setShowKey(true); setKeyInput(''); }} style={{ fontSize: 12, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
            Change
          </button>
        </div>
      )}

      <textarea
        rows={4} value={thought} onChange={e => setThought(e.target.value)}
        placeholder="Write your full thought here..."
        style={{ resize: 'none', lineHeight: 1.75, marginBottom: 12 }}
      />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        {STARTERS.map(s => (
          <button key={s} onClick={() => setThought(s)} style={{
            background: thought === s ? 'var(--light)' : 'var(--card)',
            border: `1.5px solid ${thought === s ? 'var(--primary)' : 'var(--border)'}`,
            borderRadius: 20, padding: '6px 14px', fontSize: 13, cursor: 'pointer',
            color: thought === s ? 'var(--primary)' : 'var(--text)', fontFamily: 'inherit',
          }}>{s}</button>
        ))}
      </div>

      <button className="btn btn-primary" onClick={submit} disabled={!thought.trim() || !key || showKey}>
        Reflect this thought
      </button>
    </div>
  );

  // ─── LOADING ──────────────────────────────────────────────────────────────
  if (phase === 'loading') return (
    <div style={{ textAlign: 'center', padding: '60px 24px' }}>
      <div style={{ fontSize: 44, marginBottom: 16 }}>🪞</div>
      <div className="typing" style={{ justifyContent: 'center' }}><span /><span /><span /></div>
      <p style={{ marginTop: 16, fontSize: 15, color: 'var(--muted)' }}>Agents are thinking…</p>

      <div style={{ maxWidth: 300, margin: '20px auto 0', textAlign: 'left', background: 'var(--light)', borderRadius: 14, padding: '14px 18px' }}>
        {AGENT_LABELS.map((label, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
              background: i <= step ? '#4ab87a' : 'var(--border)',
            }} />
            <span style={{ fontSize: 13, color: i <= step ? 'var(--text)' : 'var(--muted)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // ─── ERROR ────────────────────────────────────────────────────────────────
  if (phase === 'error') return (
    <div className="section fade-in">
      <div style={{ background: 'rgba(200,60,60,0.08)', border: '1.5px solid rgba(200,60,60,0.25)', borderRadius: 16, padding: 20, marginBottom: 16 }}>
        <p style={{ fontWeight: 700, fontSize: 15, color: '#f08080', marginBottom: 8 }}>
          {error === 'NO_KEY' ? '🔑 No API key' : `⚠️ Error ${error}`}
        </p>
        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75 }}>
          {error === 'NO_KEY'
            ? 'Add your free Gemini key to continue.'
            : error === '429'
            ? 'Too many requests. Wait a few seconds and try again.'
            : 'Something went wrong. Please try again.'}
        </p>
      </div>
      <button className="btn btn-primary" onClick={submit}>Try again</button>
      <button className="btn btn-soft" onClick={reset} style={{ marginTop: 10 }}>Edit my thought</button>
    </div>
  );

  // ─── RESULT ───────────────────────────────────────────────────────────────
  return (
    <div className="section fade-in">
      <h2 style={{ fontFamily: 'Lora,serif', marginBottom: 12 }}>Truth Mirror</h2>

      <div style={{ background: 'var(--light)', borderRadius: 14, padding: '14px 16px', marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Your thought</p>
        <p style={{ fontSize: 14, fontStyle: 'italic', lineHeight: 1.7 }}>"{thought}"</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
        {SECTIONS.map(s => (
          <div key={s.key} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderLeft: `4px solid ${s.color}`, borderRadius: '0 18px 18px 0', padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}>{s.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: s.color, letterSpacing: 1, textTransform: 'uppercase' }}>{s.title}</span>
            </div>
            <p style={{ fontSize: 15, lineHeight: 1.85 }}>{result[s.key]}</p>
          </div>
        ))}
      </div>

      <button className="btn btn-primary" onClick={reset}>Reflect another thought</button>
      <button className="btn btn-soft" onClick={onClose} style={{ marginTop: 10 }}>I understand — thank you ✓</button>
    </div>
  );
}
