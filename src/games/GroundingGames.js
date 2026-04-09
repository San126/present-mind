import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export function GroundingGame({ onClose }) {
  const { getAdaptiveContent, profile } = useApp();
  const adaptive = getAdaptiveContent();
  const [step, setStep] = useState(0);
  const [items, setItems] = useState({ see: [], touch: [], hear: [], smell: [], taste: [] });
  const [input, setInput] = useState('');

  const senses = [
    { key: 'see', num: 5, label: adaptive.isChild ? 'things you can SEE 👀' : 'things you can see', icon: '👁️', color: '#e8f4f8', textColor: '#2a6a8a' },
    { key: 'touch', num: 4, label: adaptive.isChild ? 'things you can TOUCH ✋' : 'things you can touch or feel', icon: '✋', color: '#d4e8db', textColor: '#2a5a3a' },
    { key: 'hear', num: 3, label: adaptive.isChild ? 'sounds you can HEAR 👂' : 'things you can hear', icon: '👂', color: '#fde8d0', textColor: '#7a3a0a' },
    { key: 'smell', num: 2, label: adaptive.isChild ? 'things you can SMELL 👃' : 'things you can smell', icon: '👃', color: '#f8e8f0', textColor: '#7a2a5a' },
    { key: 'taste', num: 1, label: adaptive.isChild ? 'thing you can TASTE 👅' : 'something you can taste', icon: '👅', color: '#f4f0fa', textColor: '#5a2a8a' },
  ];

  const current = senses[step];
  const currentItems = items[current?.key] || [];

  const addItem = () => {
    if (!input.trim() || !current) return;
    setItems(prev => ({ ...prev, [current.key]: [...(prev[current.key] || []), input.trim()] }));
    setInput('');
  };

  if (step >= senses.length) {
    return (
      <div className="section fade-in" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🌿</div>
        <h2 style={{ fontFamily: 'Lora,serif', marginBottom: 8 }}>You are grounded</h2>
        <p style={{ marginBottom: 24, lineHeight: 1.8 }}>
          {adaptive.isChild
            ? 'You did it! You used all 5 senses. You are HERE, right now! 🌟'
            : 'You just spent the last few minutes entirely in the present moment. That\'s real. That\'s what grounding is.'}
        </p>
        <div className="card" style={{ textAlign: 'left', marginBottom: 20 }}>
          {senses.map(s => (
            <div key={s.key} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 16 }}>{s.icon}</span>
              <div>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>{s.num} {s.key}: </span>
                <span style={{ fontSize: 13, color: 'var(--text)' }}>{(items[s.key] || []).join(', ') || '—'}</span>
              </div>
            </div>
          ))}
        </div>
        <button className="btn btn-primary" onClick={onClose}>I'm here ✓</button>
      </div>
    );
  }

  return (
    <div className="section fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'Lora,serif' }}>5-4-3-2-1</h2>
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>{step + 1} / 5</span>
      </div>
      <div className="progress-bar" style={{ marginBottom: 20 }}>
        <div className="progress-fill" style={{ width: `${(step / 5) * 100}%` }} />
      </div>

      <div style={{ background: current.color, borderRadius: 20, padding: 24, textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 48 }}>{current.icon}</div>
        <div style={{ fontSize: 40, fontWeight: 700, color: current.textColor, margin: '8px 0', fontFamily: 'Lora,serif' }}>{current.num}</div>
        <p style={{ fontSize: 16, fontWeight: 600, color: current.textColor }}>{current.label}</p>
        <p style={{ fontSize: 13, color: current.textColor, opacity: 0.7, marginTop: 6 }}>
          {adaptive.isChild ? 'Look around and find them!' : 'Look around slowly. Name each one.'}
        </p>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <input
            type="text"
            placeholder={`Name something you can ${current.key}...`}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem()}
          />
          <button onClick={addItem} style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 12, padding: '0 16px', cursor: 'pointer', fontSize: 18, flexShrink: 0 }}>+</button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {currentItems.map((item, i) => (
            <span key={i} className="tag">{item}</span>
          ))}
        </div>
      </div>

      <button
        className="btn btn-primary"
        onClick={() => setStep(s => s + 1)}
        disabled={currentItems.length < current.num}
      >
        {currentItems.length < current.num
          ? `${current.num - currentItems.length} more to go...`
          : step < 4 ? `Next sense →` : 'Complete ✓'}
      </button>
    </div>
  );
}

export function SlowObservation({ onClose }) {
  const { getAdaptiveContent } = useApp();
  const adaptive = getAdaptiveContent();
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);

  const questions = adaptive.isChild
    ? ['What colour is it exactly?', 'Is it soft or hard?', 'Can you count anything on it?', 'What shape is it?', 'What is it for?']
    : ['What is its exact colour — can you describe it precisely?', 'What texture would it feel like if you touched it?', 'What is its exact shape?', 'How old do you think it is?', 'What is its purpose, and does it fulfil it well?'];

  const allAnswered = questions.every((_, i) => answers[i]?.trim());

  if (done) {
    return (
      <div className="section fade-in" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
        <h2 style={{ fontFamily: 'Lora,serif', marginBottom: 8 }}>You were present</h2>
        <p style={{ marginBottom: 20, lineHeight: 1.8 }}>
          For the last few minutes, your mind stayed on one real thing in front of you. That\'s not small — that\'s the practice.
        </p>
        <button className="btn btn-primary" onClick={onClose}>That was grounding ✓</button>
      </div>
    );
  }

  return (
    <div className="section fade-in">
      <h2 style={{ fontFamily: 'Lora,serif', marginBottom: 8 }}>Slow Observation</h2>
      <p style={{ marginBottom: 20, lineHeight: 1.8 }}>
        {adaptive.isChild ? 'Pick one thing near you and look at it REALLY closely! ': 'Choose one nearby object. Look at it slowly and carefully — answer each question as precisely as you can.'}
      </p>
      <div style={{ background: 'var(--light)', borderRadius: 16, padding: 16, marginBottom: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', marginBottom: 8 }}>
          {adaptive.isChild ? '📌 Pick something near you right now' : 'Choose your object. Then work through these:'}
        </p>
        {questions.map((q, i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 4 }}>
              {i + 1}. {q}
            </label>
            <input type="text" placeholder="Your answer..." value={answers[i] || ''} onChange={e => setAnswers(a => ({ ...a, [i]: e.target.value }))} style={{ borderRadius: 10, padding: '10px 14px' }} />
          </div>
        ))}
      </div>
      <button className="btn btn-primary" onClick={() => setDone(true)} disabled={!allAnswered}>
        {allAnswered ? 'I noticed. I\'m here ✓' : 'Answer all to continue'}
      </button>
    </div>
  );
}
