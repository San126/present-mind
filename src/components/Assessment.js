import React, { useState } from 'react';
import { useApp, THEMES } from '../context/AppContext';
import { geminiSingle } from '../utils/gemini';

const STEPS = [
  'welcome', 'name_age', 'mood_check', 'content_style',
  'pace_approach', 'wound_vigour', 'light_theme', 'result'
];

export default function Assessment() {
  const { updateProfile, setScreen, profile, THEMES: themes } = useApp();
  const [step, setStep] = useState('welcome');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [chosenTheme, setChosenTheme] = useState('calm_forest');

  const set = (key, val) => setData(p => ({ ...p, [key]: val }));

  const next = () => {
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
  };

  const progressPct = ((STEPS.indexOf(step)) / (STEPS.length - 1)) * 100;

  const getAgeGroup = (age) => {
    if (age < 13) return 'child';
    if (age < 18) return 'teen';
    if (age < 40) return 'adult';
    return 'mature';
  };

  const getAutoTheme = (lightSens, approach, wound) => {
    if (lightSens === 'high') return 'deep_night';
    if (wound > 7) return 'soft_lavender';
    if (approach === 'playful') return 'warm_sunset';
    if (approach === 'direct') return 'ocean_mist';
    if (lightSens === 'low') return 'high_contrast';
    return 'calm_forest';
  };

  const finishAssessment = async () => {
    setLoading(true);
    const ageNum = parseInt(data.age) || 25;
    const ageGroup = getAgeGroup(ageNum);
    const woundLevel = parseInt(data.woundLevel) || 5;
    const vigourLevel = parseInt(data.vigourLevel) || 5;
    const autoTheme = getAutoTheme(data.lightSensitivity, data.approachPreference, woundLevel);
    setChosenTheme(autoTheme);

    const happinessBase = Math.round((vigourLevel / 10) * 40 + 10 + (10 - woundLevel) * 3);

    const prompt = `A person named ${data.name || 'friend'} (${ageGroup}, age ${ageNum}) completed a wellness assessment.
Details:
- Current mood: ${data.currentMood}
- Content they like: ${data.contentPreference}
- Pace: ${data.pacePreference}
- Approach: ${data.approachPreference}
- Pain/wound level: ${woundLevel}/10
- Energy: ${vigourLevel}/10
- Light sensitivity: ${data.lightSensitivity}

Write a warm, honest 3-sentence personal summary for them. Acknowledge where they are. Note what approach will help most. End with one encouraging sentence that feels true, not fluffy. No headers. Second person.`;

    try {
      const text = await geminiSingle(prompt);
      setSummary(text);
    } catch {
      setSummary(`You showed up today, and that genuinely matters. Based on what you've shared, we'll go at your pace with a ${data.approachPreference || 'gentle'} approach, focusing on what actually works for you. Let's begin gently.`);
    }

    const finalProfile = {
      name: data.name || '',
      age: ageNum,
      ageGroup,
      contentPreference: data.contentPreference || 'balanced',
      pacePreference: data.pacePreference || 'medium',
      woundLevel,
      vigourLevel,
      approachPreference: data.approachPreference || 'gentle',
      lightSensitivity: data.lightSensitivity || 'medium',
      themeId: autoTheme,
      happinessScore: happinessBase,
      assessmentDone: true,
      sessions: (profile.sessions || 0) + 1
    };
    updateProfile(finalProfile);
    setLoading(false);
    setStep('result');
  };

  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return (
          <div className="fade-in" style={{ textAlign: 'center', padding: '40px 24px' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🌿</div>
            <h1 style={{ fontFamily: 'Lora, serif', fontSize: 30 }}>Present Mind</h1>
            <p style={{ marginTop: 12, fontSize: 16, lineHeight: 1.8 }}>
              Before we begin, I'd like to understand you a little better — so everything here feels made just for you.
            </p>
            <p style={{ marginTop: 8, fontSize: 13, color: 'var(--muted)' }}>Takes 2–3 minutes. Completely private.</p>
            <div style={{ marginTop: 32 }}>
              <button className="btn btn-primary" onClick={next}>Let's begin →</button>
            </div>
          </div>
        );

      case 'name_age':
        return (
          <div className="fade-in section">
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase' }}>Step 1 of 6</p>
            <h2 style={{ fontFamily: 'Lora,serif', marginBottom: 8 }}>A little about you</h2>
            <p style={{ marginBottom: 20 }}>Your name helps me talk to you personally. Age helps me adjust how I speak.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>What can I call you?</label>
                <input type="text" placeholder="Your name or nickname" value={data.name || ''} onChange={e => set('name', e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>Your age</label>
                <input type="number" placeholder="e.g. 24" min="6" max="99" value={data.age || ''} onChange={e => set('age', e.target.value)} />
                {data.age && (
                  <p style={{ fontSize: 12, marginTop: 4, color: 'var(--primary)' }}>
                    {getAgeGroup(parseInt(data.age)) === 'child' && '✨ We\'ll use simple, friendly language just for you'}
                    {getAgeGroup(parseInt(data.age)) === 'teen' && '✨ We\'ll keep it real and relatable'}
                    {getAgeGroup(parseInt(data.age)) === 'adult' && '✨ We\'ll talk directly and honestly'}
                    {getAgeGroup(parseInt(data.age)) === 'mature' && '✨ We\'ll respect your experience and wisdom'}
                  </p>
                )}
              </div>
            </div>
            <div style={{ marginTop: 24 }}>
              <button className="btn btn-primary" onClick={next} disabled={!data.age}>Continue →</button>
            </div>
          </div>
        );

      case 'mood_check':
        return (
          <div className="fade-in section">
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase' }}>Step 2 of 6</p>
            <h2 style={{ fontFamily: 'Lora,serif', marginBottom: 8 }}>How are you right now?</h2>
            <p style={{ marginBottom: 20 }}>Pick the one that feels most true today — no right answer.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { v: 'overwhelmed', e: '🌊', label: 'Overwhelmed — thoughts everywhere' },
                { v: 'foggy', e: '🌫️', label: 'Foggy — hard to think clearly' },
                { v: 'anxious', e: '🫀', label: 'Anxious — worried about things' },
                { v: 'numb', e: '🧊', label: 'Numb — disconnected and flat' },
                { v: 'okay', e: '🌤️', label: 'Okay — a bit off but managing' },
                { v: 'hopeful', e: '🌱', label: 'Hopeful — ready to grow' },
              ].map(opt => (
                <div key={opt.v} className={`option-item ${data.currentMood === opt.v ? 'selected' : ''}`} onClick={() => set('currentMood', opt.v)}>
                  <span style={{ fontSize: 20 }}>{opt.e}</span>
                  <span>{opt.label}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20 }}>
              <button className="btn btn-primary" onClick={next} disabled={!data.currentMood}>Continue →</button>
            </div>
          </div>
        );

      case 'content_style':
        return (
          <div className="fade-in section">
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase' }}>Step 3 of 6</p>
            <h2 style={{ fontFamily: 'Lora,serif', marginBottom: 8 }}>How do you understand things best?</h2>
            <p style={{ marginBottom: 20 }}>This helps me explain things in the way that clicks for you.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { v: 'visual', e: '🎨', label: 'Pictures & visuals', desc: 'Show, don\'t tell' },
                { v: 'story', e: '📖', label: 'Stories & examples', desc: 'Relate it to life' },
                { v: 'facts', e: '🔬', label: 'Facts & science', desc: 'Explain why it works' },
                { v: 'games', e: '🎮', label: 'Games & activities', desc: 'Learn by doing' },
              ].map(opt => (
                <div
                  key={opt.v}
                  onClick={() => set('contentPreference', opt.v)}
                  style={{
                    background: data.contentPreference === opt.v ? 'var(--light)' : 'var(--card)',
                    border: `2px solid ${data.contentPreference === opt.v ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: 16,
                    padding: '16px 14px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{opt.e}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{opt.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{opt.desc}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20 }}>
              <button className="btn btn-primary" onClick={next} disabled={!data.contentPreference}>Continue →</button>
            </div>
          </div>
        );

      case 'pace_approach':
        return (
          <div className="fade-in section">
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase' }}>Step 4 of 6</p>
            <h2 style={{ fontFamily: 'Lora,serif', marginBottom: 8 }}>Your pace & approach</h2>
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontWeight: 600, marginBottom: 10, color: 'var(--text)' }}>How fast do you want things to go?</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { v: 'slow', e: '🐢', label: 'Slow — I need time to absorb things' },
                  { v: 'medium', e: '🚶', label: 'Medium — steady and comfortable' },
                  { v: 'fast', e: '🏃', label: 'Fast — I pick things up quickly' },
                ].map(opt => (
                  <div key={opt.v} className={`option-item ${data.pacePreference === opt.v ? 'selected' : ''}`} style={{ padding: '12px 16px' }} onClick={() => set('pacePreference', opt.v)}>
                    <span>{opt.e}</span><span style={{ fontSize: 14 }}>{opt.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p style={{ fontWeight: 600, marginBottom: 10, color: 'var(--text)' }}>What style feels right?</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { v: 'gentle', e: '🤗', label: 'Gentle — soft and nurturing' },
                  { v: 'direct', e: '🎯', label: 'Direct — honest and straight to the point' },
                  { v: 'playful', e: '🎈', label: 'Playful — light and fun, even in hard moments' },
                  { v: 'structured', e: '📋', label: 'Structured — clear steps and logic' },
                ].map(opt => (
                  <div key={opt.v} className={`option-item ${data.approachPreference === opt.v ? 'selected' : ''}`} style={{ padding: '12px 16px' }} onClick={() => set('approachPreference', opt.v)}>
                    <span>{opt.e}</span><span style={{ fontSize: 14 }}>{opt.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 20 }}>
              <button className="btn btn-primary" onClick={next} disabled={!data.pacePreference || !data.approachPreference}>Continue →</button>
            </div>
          </div>
        );

      case 'wound_vigour':
        return (
          <div className="fade-in section">
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase' }}>Step 5 of 6</p>
            <h2 style={{ fontFamily: 'Lora,serif', marginBottom: 8 }}>How you're carrying things</h2>
            <p style={{ marginBottom: 24 }}>Be honest — these sliders help me understand what kind of support you actually need.</p>

            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>How much inner pain are you carrying?</label>
                <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)', minWidth: 28, textAlign: 'right' }}>{data.woundLevel || 5}</span>
              </div>
              <input type="range" min="0" max="10" step="1" value={data.woundLevel || 5} onChange={e => set('woundLevel', e.target.value)} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>0 — Almost none</span>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>10 — Very heavy</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--primary)', marginTop: 6, fontWeight: 500 }}>
                {(data.woundLevel || 5) > 7 ? '💙 We will be very gentle and go slowly' :
                 (data.woundLevel || 5) > 4 ? '🌿 We\'ll be supportive and build at your pace' :
                 '🌱 You have room to grow — let\'s use that'}
              </p>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>How much energy / motivation do you have?</label>
                <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)', minWidth: 28, textAlign: 'right' }}>{data.vigourLevel || 5}</span>
              </div>
              <input type="range" min="0" max="10" step="1" value={data.vigourLevel || 5} onChange={e => set('vigourLevel', e.target.value)} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>0 — Completely drained</span>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>10 — Full of energy</span>
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <button className="btn btn-primary" onClick={next}>Continue →</button>
            </div>
          </div>
        );

      case 'light_theme':
        return (
          <div className="fade-in section">
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase' }}>Step 6 of 6</p>
            <h2 style={{ fontFamily: 'Lora,serif', marginBottom: 8 }}>Comfort & appearance</h2>
            <p style={{ marginBottom: 16 }}>Some people are sensitive to bright screens. Let me know what feels comfortable.</p>

            <div>
              <p style={{ fontWeight: 600, marginBottom: 10, color: 'var(--text)', fontSize: 14 }}>How sensitive are you to screen brightness?</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { v: 'low', e: '🌑', label: 'Sensitive — prefer dim, dark screens' },
                  { v: 'medium', e: '🌤️', label: 'Moderate — normal screens are fine' },
                  { v: 'high', e: '☀️', label: 'Low sensitivity — I like bright, clear screens' },
                ].map(opt => (
                  <div key={opt.v} className={`option-item ${data.lightSensitivity === opt.v ? 'selected' : ''}`} style={{ padding: '12px 16px' }} onClick={() => set('lightSensitivity', opt.v)}>
                    <span>{opt.e}</span><span style={{ fontSize: 14 }}>{opt.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <p style={{ fontWeight: 600, marginBottom: 10, color: 'var(--text)', fontSize: 14 }}>
                Preview themes
                {data.lightSensitivity && (
                  <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 400, marginLeft: 8 }}>
                    (auto-suggested: {Object.values(THEMES).find(t => {
                      const auto = getAutoTheme(data.lightSensitivity, data.approachPreference, parseInt(data.woundLevel)||5);
                      return t === THEMES[auto];
                    })?.name || ''})
                  </span>
                )}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {Object.entries(THEMES).map(([id, t]) => (
                  <div
                    key={id}
                    onClick={() => set('selectedTheme', id)}
                    style={{
                      background: t.bg,
                      border: `2px solid ${data.selectedTheme === id ? t.primary : 'transparent'}`,
                      borderRadius: 12,
                      padding: '10px 8px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontSize: 22 }}>{t.emoji}</div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: t.text, marginTop: 4 }}>{t.name}</div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>You can always change this later in settings.</p>
            </div>

            <div style={{ marginTop: 20 }}>
              <button className="btn btn-primary" onClick={finishAssessment} disabled={!data.lightSensitivity}>
                {loading ? 'Preparing your space...' : 'See my profile →'}
              </button>
            </div>
          </div>
        );

      case 'result':
        const themeObj = THEMES[chosenTheme];
        return (
          <div className="fade-in section" style={{ paddingTop: 40 }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: 52 }}>{themeObj?.emoji || '🌿'}</div>
              <h1 style={{ fontFamily: 'Lora,serif', marginTop: 12 }}>
                Hello, {data.name || 'friend'} {profile.ageGroup === 'child' ? '👋' : ''}
              </h1>
              <p style={{ marginTop: 6, fontSize: 13 }}>Here's what I found, and how we'll work together</p>
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                <div style={{ flex: 1, background: 'var(--light)', borderRadius: 12, padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, marginBottom: 4 }}>INNER PAIN</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--primary)' }}>{data.woundLevel || 5}<span style={{ fontSize: 14 }}>/10</span></div>
                </div>
                <div style={{ flex: 1, background: 'var(--light)', borderRadius: 12, padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, marginBottom: 4 }}>ENERGY</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--primary)' }}>{data.vigourLevel || 5}<span style={{ fontSize: 14 }}>/10</span></div>
                </div>
                <div style={{ flex: 1, background: 'var(--light)', borderRadius: 12, padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, marginBottom: 4 }}>STYLE</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', textTransform: 'capitalize' }}>{data.approachPreference}</div>
                </div>
              </div>
              {loading ? (
                <div style={{ textAlign: 'center', padding: 20 }}>
                  <div className="typing" style={{ justifyContent: 'center' }}><span /><span /><span /></div>
                  <p style={{ marginTop: 8 }}>Reading your profile...</p>
                </div>
              ) : (
                <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text)' }}>{summary}</p>
              )}
            </div>

            <div className="card" style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Your theme: {themeObj?.name}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: themeObj?.primary }}></div>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: themeObj?.accent }}></div>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: themeObj?.light }}></div>
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>{themeObj?.description}</p>
              </div>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>Auto-chosen based on your light sensitivity and approach style</p>
            </div>

            <button className="btn btn-primary" onClick={() => setScreen('home')}>
              Enter Present Mind →
            </button>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="screen" style={{ background: 'var(--bg)' }}>
      {step !== 'welcome' && step !== 'result' && (
        <div style={{ padding: '16px 24px 0' }}>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      )}
      {renderStep()}
    </div>
  );
}
