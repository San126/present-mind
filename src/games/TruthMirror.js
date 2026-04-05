import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { geminiSingle, buildSystemPrompt, getKey, saveKey } from '../utils/gemini';

function parseSections(text) {
  const labels = ['WHAT I HEAR','WHAT IS ACTUALLY TRUE','THE PRESENT MOMENT','ONE STEP RIGHT NOW'];
  const result = {};
  labels.forEach((label, i) => {
    const tag = `[${label}]`;
    const start = text.indexOf(tag);
    if (start === -1) return;
    const after = start + tag.length;
    const nextTag = labels[i + 1] ? text.indexOf(`[${labels[i + 1]}]`) : -1;
    const content = text.slice(after, nextTag > -1 ? nextTag : undefined).trim();
    if (content) result[label] = content;
  });
  return Object.keys(result).length >= 2 ? result : null;
}

const SECTION_CONFIG = [
  { key: 'WHAT I HEAR',             icon: '👂', label: 'What I hear' },
  { key: 'WHAT IS ACTUALLY TRUE',   icon: '🔍', label: 'What is actually true' },
  { key: 'THE PRESENT MOMENT',      icon: '🌿', label: 'The present moment' },
  { key: 'ONE STEP RIGHT NOW',      icon: '→',  label: 'One step right now' },
];

export default function TruthMirror({ onClose }) {
  const { profile, getAdaptiveContent } = useApp();
  const adaptive = getAdaptiveContent();

  const [step, setStep]         = useState('input');
  const [thought, setThought]   = useState('');
  const [apiKey, setApiKey]     = useState('');
  const [showKey, setShowKey]   = useState(false);
  const [sections, setSections] = useState(null);
  const [rawText, setRawText]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [errorType, setErrorType] = useState('');
  const [retryInfo, setRetryInfo] = useState(null); // {attempt, remaining}
  const retryTimerRef = useRef(null);

  useEffect(() => {
    // Clear stale/dead hardcoded key if it's the old demo key
    const OLD_KEY = 'AIzaSyD-9tSrke72WhFra1vjkB8coSJZMjnNYec';
    const stored = localStorage.getItem('pm_gemini_key') || '';
    if (stored === OLD_KEY) localStorage.removeItem('pm_gemini_key');

    const k = getKey();
    setApiKey(k);
    if (!k) setShowKey(true);
    return () => clearInterval(retryTimerRef.current);
  }, []);

  const handleSaveKey = (k) => {
    const t = k.trim();
    saveKey(t);   // uses shared util — writes to localStorage
    setApiKey(t);
    setShowKey(false);
  };

  const examples = profile.ageGroup === 'child'
    ? ["I'm not good at anything", 'Nobody likes me', 'I always mess up']
    : profile.ageGroup === 'teen'
    ? ["I'm falling behind everyone", "I'll never figure my life out", 'Everyone judges me']
    : ["I'm a burden to others", 'My future looks hopeless', 'I always ruin things', "I'll never be okay"];

  const reflect = async () => {
    const key = apiKey.trim();
    if (!key) { setShowKey(true); return; }
    if (!thought.trim()) return;

    setLoading(true);
    setErrorType('');
    setRetryInfo(null);
    setSections(null);
    setRawText('');
    setStep('response');

    const toneGuide =
      profile.ageGroup === 'child'       ? 'Very simple words, short sentences. Warm like a kind friend.' :
      profile.ageGroup === 'teen'        ? "Direct, real. Like a trusted older friend, not a therapist." :
      adaptive.tone === 'direct'         ? 'Honest and concise. Name the distortion, no padding.' :
      adaptive.tone === 'structured'     ? 'Clear logic — pattern → evidence → step.' :
                                           'Warm and honest. Feel the weight first, then offer another angle.';

    const prompt = `${buildSystemPrompt(profile)}

The person wrote:
"${thought}"

CRITICAL: Respond SPECIFICALLY to their actual words and situation. No generic mindfulness answer.

${toneGuide}

Reply in EXACTLY this format (keep brackets):

[WHAT I HEAR]
Show you understood their specific situation. Name the actual thing they're dealing with. 2-3 sentences.

[WHAT IS ACTUALLY TRUE]
Separate verifiable facts from what the worried mind adds. Acknowledge the real difficulty AND name the exaggeration/assumption. 2-3 sentences.

[THE PRESENT MOMENT]
Grounding observation directly connected to their situation. What exists now vs what the mind projects. 2 sentences.

[ONE STEP RIGHT NOW]
One concrete, practical action for TODAY addressing their actual situation. Specific, not generic. 2 sentences.`;

    try {
      // Pass onRetry callback — shows countdown UI
      const { text, model } = await geminiSingle(prompt, {
        retries: 3,
        onRetry: (attempt, delayMs) => {
          let remaining = Math.ceil(delayMs / 1000);
          setRetryInfo({ attempt, remaining });
          clearInterval(retryTimerRef.current);
          retryTimerRef.current = setInterval(() => {
            remaining -= 1;
            if (remaining <= 0) {
              clearInterval(retryTimerRef.current);
              setRetryInfo(ri => ri ? { ...ri, remaining: 0 } : null);
            } else {
              setRetryInfo(ri => ri ? { ...ri, remaining } : null);
            }
          }, 1000);
        }
      });

      clearInterval(retryTimerRef.current);
      setRetryInfo(null);
      setRawText(text);
      setSections(parseSections(text));
    } catch (e) {
      clearInterval(retryTimerRef.current);
      setRetryInfo(null);
      const m = e.message || '';
      if (m === 'NO_KEY')      setErrorType('no_key');
      else if (m === 'BAD_KEY')    setErrorType('bad_key');
      else if (m === 'RATE_LIMIT') setErrorType('rate_limit');
      else if (m === 'NETWORK')    setErrorType('network');
      else                         setErrorType('unknown:' + m);
    }
    setLoading(false);
  };

  const reset = () => {
    setThought(''); setSections(null); setRawText('');
    setErrorType(''); setStep('input'); setRetryInfo(null);
    clearInterval(retryTimerRef.current);
  };

  const errorMap = {
    no_key:     { icon: '🔑', title: 'API key needed',        body: 'Enter your free Gemini key below. Get one at aistudio.google.com/app/apikey (Google sign-in, no billing needed).' },
    bad_key:    { icon: '🔑', title: 'API key rejected',      body: 'Your key was refused by Google. Go to aistudio.google.com/app/apikey and create a fresh key — paste it below.' },
    rate_limit: { icon: '⏱️', title: 'Rate limit — retried 3×', body: 'The free Gemini tier allows 15 requests/minute. The app retried automatically but still hit the limit. Wait 1 minute and try again.' },
    network:    { icon: '📡', title: 'No connection',         body: 'Your browser could not reach Google. Check your internet. If on a VPN or office network, try disabling it.' },
  };

  // ── Reusable UI blocks ────────────────────────────────────────────────────
  const KeyBlock = () => (
    <div style={{ background: 'rgba(74,144,184,0.1)', border: '1.5px solid rgba(74,144,184,0.35)',
      borderRadius: 16, padding: '18px 20px', marginBottom: 16 }}>
      <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6, fontSize: 15 }}>🔑 Gemini API key</p>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12, lineHeight: 1.7 }}>
        Free key at{' '}
        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer"
          style={{ color: 'var(--primary)' }}>aistudio.google.com/app/apikey</a>
        {' '}→ Sign in with Google → Create API Key. Saved in your browser only.
      </p>
      <input type="text" placeholder="AIzaSy..." value={apiKey}
        onChange={e => setApiKey(e.target.value)}
        style={{ marginBottom: 10, fontFamily: 'monospace', fontSize: 13 }} autoComplete="off" />
      <button className="btn btn-primary"
        onClick={() => handleSaveKey(apiKey)} disabled={!apiKey.trim().startsWith('AIza')}>
        Save &amp; use this key
      </button>
    </div>
  );

  const ErrorBlock = () => {
    const eKey = Object.keys(errorMap).find(k => errorType.startsWith(k));
    const e = eKey ? errorMap[eKey] : { icon: '⚠️', title: 'Something went wrong', body: `Details: ${errorType}` };
    return (
      <div style={{ background: 'rgba(200,60,60,0.1)', border: '1.5px solid rgba(200,60,60,0.3)',
        borderRadius: 16, padding: '18px 20px', marginBottom: 16 }}>
        <p style={{ fontSize: 22, marginBottom: 8 }}>{e.icon}</p>
        <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, color: '#f08080' }}>{e.title}</p>
        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75 }}>{e.body}</p>
        {(errorType.startsWith('bad_key') || errorType === 'no_key') && (
          <div style={{ marginTop: 14 }}>
            <input type="text" placeholder="AIzaSy..." value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              style={{ marginBottom: 10, fontFamily: 'monospace', fontSize: 13 }} />
            <button className="btn btn-primary"
              onClick={() => { handleSaveKey(apiKey); reflect(); }}
              disabled={!apiKey.trim().startsWith('AIza')}>
              Save key &amp; retry
            </button>
          </div>
        )}
        {errorType === 'rate_limit' && (
          <button onClick={reflect} className="btn btn-soft" style={{ marginTop: 12 }}>
            Try again now
          </button>
        )}
      </div>
    );
  };

  // ── INPUT SCREEN ──────────────────────────────────────────────────────────
  if (step === 'input') return (
    <div className="section fade-in">
      <h2 style={{ fontFamily: 'Lora,serif', marginBottom: 8 }}>Truth Mirror</h2>
      <p style={{ marginBottom: 20, lineHeight: 1.8 }}>
        {adaptive.isChild
          ? "Write down a worry — I'll help you look at it closely. 🔍"
          : "Write a thought that's been sitting heavy. The more specific, the more useful the reflection."}
      </p>

      {showKey && <KeyBlock />}

      {!showKey && apiKey && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 14, padding: '8px 14px',
          background: 'rgba(74,184,120,0.1)', borderRadius: 10, border: '1px solid rgba(74,184,120,0.3)' }}>
          <span style={{ fontSize: 13, color: 'var(--text)' }}>🔑 API key ready</span>
          <button onClick={() => setShowKey(true)} style={{ fontSize: 12, color: 'var(--primary)',
            background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Change</button>
        </div>
      )}

      <textarea rows={4} value={thought} onChange={e => setThought(e.target.value)}
        placeholder="Write the full thought — be specific about your actual situation..."
        style={{ resize: 'none', lineHeight: 1.7, marginBottom: thought.length > 20 ? 4 : 16 }} />
      {thought.length > 20 && (
        <p style={{ fontSize: 12, color: 'var(--primary)', marginBottom: 14, fontWeight: 500 }}>
          ✓ Good — the more specific, the better the reflection
        </p>
      )}

      <p style={{ fontSize: 12, color: 'var(--muted)', margin: '4px 0 8px' }}>Or try one:</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
        {examples.map(ex => (
          <button key={ex} onClick={() => setThought(ex)} style={{
            background: thought === ex ? 'var(--light)' : 'var(--card)',
            border: `1.5px solid ${thought === ex ? 'var(--primary)' : 'var(--border)'}`,
            borderRadius: 20, padding: '7px 14px', fontSize: 13, cursor: 'pointer',
            color: thought === ex ? 'var(--primary)' : 'var(--text)', fontFamily: 'inherit', transition: 'all 0.2s',
          }}>{ex}</button>
        ))}
      </div>

      <button className="btn btn-primary" onClick={reflect} disabled={!thought.trim() || !apiKey.trim()}>
        Reflect this thought
      </button>
    </div>
  );

  // ── RESPONSE SCREEN ───────────────────────────────────────────────────────
  return (
    <div className="section fade-in">
      <h2 style={{ fontFamily: 'Lora,serif', marginBottom: 12 }}>Truth Mirror</h2>

      {/* Original thought */}
      <div style={{ background: 'var(--light)', borderRadius: 14, padding: '14px 16px', marginBottom: 20 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 5,
          letterSpacing: 0.5, textTransform: 'uppercase' }}>Your thought</p>
        <p style={{ fontSize: 14, color: 'var(--text)', fontStyle: 'italic', lineHeight: 1.7 }}>"{thought}"</p>
      </div>

      {/* Loading / retry countdown */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '30px 20px' }}>
          <div className="typing" style={{ justifyContent: 'center' }}><span /><span /><span /></div>
          {retryInfo ? (
            <div style={{ marginTop: 16 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary)' }}>
                Rate limit hit — auto-retrying in {retryInfo.remaining}s
              </p>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>
                Attempt {retryInfo.attempt} of 3 — the free tier resets every minute
              </p>
              {/* Progress bar countdown */}
              <div style={{ height: 6, background: 'var(--light)', borderRadius: 20, margin: '12px 0',
                overflow: 'hidden' }}>
                <div style={{
                  height: '100%', background: 'var(--primary)', borderRadius: 20,
                  width: `${(retryInfo.remaining / (20 * retryInfo.attempt)) * 100}%`,
                  transition: 'width 1s linear'
                }} />
              </div>
            </div>
          ) : (
            <p style={{ marginTop: 14, fontSize: 14, color: 'var(--muted)' }}>
              Reading what you wrote carefully...
            </p>
          )}
        </div>
      )}

      {/* Error */}
      {!loading && errorType && (
        <>
          <ErrorBlock />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {!errorType.startsWith('bad_key') && !errorType.startsWith('no_key') && (
              <button className="btn btn-primary" onClick={reflect}>Try again</button>
            )}
            <button className="btn btn-soft" onClick={reset}>Edit thought</button>
          </div>
        </>
      )}

      {/* Structured sections */}
      {!loading && !errorType && sections && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            {SECTION_CONFIG.map(sc => {
              const content = sections[sc.key];
              if (!content) return null;
              return (
                <div key={sc.key} style={{ background: 'rgba(255,255,255,0.06)',
                  border: '1px solid var(--border)', borderRadius: 16, padding: '16px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 16 }}>{sc.icon}</span>
                    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)',
                      letterSpacing: 0.5, textTransform: 'uppercase' }}>{sc.label}</p>
                  </div>
                  <p style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text)' }}>{content}</p>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button className="btn btn-primary" onClick={reset}>Reflect another thought</button>
            <button className="btn btn-soft" onClick={onClose}>I understand — thank you ✓</button>
          </div>
        </>
      )}

      {/* Raw fallback */}
      {!loading && !errorType && !sections && rawText && (
        <>
          <div style={{ borderLeft: '3px solid var(--primary)', borderRadius: '0 16px 16px 0',
            padding: '16px 18px', marginBottom: 20, background: 'rgba(255,255,255,0.04)' }}>
            <p style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>{rawText}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button className="btn btn-primary" onClick={reset}>Reflect another thought</button>
            <button className="btn btn-soft" onClick={onClose}>I understand — thank you ✓</button>
          </div>
        </>
      )}
    </div>
  );
}
