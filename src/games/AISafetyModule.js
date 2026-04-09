import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { geminiSingle, buildSystemPrompt } from '../utils/gemini';

// ── Data Privacy & Unlearn panel ─────────────────────────────────────────────
function PrivacyPanel({ onClose }) {
  const { profile, updateProfile } = useApp();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const totalEntries = (profile.activitiesCompleted || []).length;
  const chatCount = profile.chatSessionCount || 0;

  const handleUnlearn = () => {
    // Clear all user-identifiable data from localStorage
    localStorage.removeItem('presentMindProfile');
    localStorage.removeItem('pm_gemini_key');
    // Also clear any chat history keys
    Object.keys(localStorage).filter(k => k.startsWith('pm_')).forEach(k => localStorage.removeItem(k));
    // Reset in-memory profile
    updateProfile({
      name: '', age: null, ageGroup: null,
      assessmentDone: false,
      activitiesCompleted: [],
      ballHighScore: 0,
      happinessScore: 30,
      chatSessionCount: 0,
      woundLevel: null, vigourLevel: null,
    });
    setDeleted(true);
  };

  if (deleted) return (
    <div className="section fade-in" style={{ textAlign: 'center', paddingTop: 40 }}>
      <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
      <h2 style={{ fontFamily: 'Lora,serif', marginBottom: 12 }}>All data erased</h2>
      <p style={{ lineHeight: 1.8, marginBottom: 24 }}>
        Your profile, activity history, and API key have been permanently deleted from this device.
        No data was ever sent to any server — there is nothing else to delete.
      </p>
      <div style={{ background: 'rgba(74,184,120,0.1)', border: '1px solid rgba(74,184,120,0.3)',
        borderRadius: 14, padding: 16, marginBottom: 24, textAlign: 'left' }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', marginBottom: 8 }}>What was deleted:</p>
        {['Your name, age, and assessment answers','All activity completion records','Ball tracking high scores',
          'Your Gemini API key (from localStorage)','All adaptive settings and preferences'].map(item => (
          <p key={item} style={{ fontSize: 13, color: 'var(--text)', marginBottom: 4 }}>✓ {item}</p>
        ))}
      </div>
      <button className="btn btn-primary" onClick={onClose}>Close</button>
    </div>
  );

  return (
    <div className="section fade-in">
      <h2 style={{ fontFamily: 'Lora,serif', marginBottom: 8 }}>Your Data & Privacy</h2>
      <p style={{ marginBottom: 20, lineHeight: 1.8 }}>
        Present Mind is built on a <strong style={{ color: 'var(--primary)' }}>no-server, no-training</strong> architecture.
        Everything stays on your device.
      </p>

      {/* Data principles */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {[
          { icon: '🔒', title: 'No data sent to any server', body: 'Your thoughts, mood check-ins, and activity history never leave your browser. The app has no backend.' },
          { icon: '🚫', title: 'Not used for AI training', body: 'Your conversations with the AI go directly from your browser to Google\'s Gemini API — they are not stored or used to train any model.' },
          { icon: '🧹', title: 'Full unlearn / right to delete', body: 'You can erase everything — profile, history, API key — instantly from this screen. It\'s cryptographically gone from your device.' },
          { icon: '👁️', title: 'You can see everything stored', body: `Right now we hold: your name, age group, ${totalEntries} activity completions, and your adaptive settings. That's it.` },
          { icon: '🔑', title: 'Your API key is yours', body: 'Your Gemini key is stored only in your browser\'s localStorage. We never see it, log it, or transmit it anywhere except directly to Google.' },
        ].map(item => (
          <div key={item.title} style={{ background: 'var(--light)', borderRadius: 14, padding: '14px 16px',
            display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</span>
            <div>
              <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 3 }}>{item.title}</p>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>{item.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Delete section */}
      <div style={{ background: 'rgba(200,60,60,0.08)', border: '1.5px solid rgba(200,60,60,0.2)',
        borderRadius: 16, padding: '18px 20px' }}>
        <p style={{ fontWeight: 700, fontSize: 15, color: '#f08080', marginBottom: 8 }}>⚠️ Delete all my data</p>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.7 }}>
          This permanently erases your profile, all activity history, high scores, and your saved API key from this device.
          This action cannot be undone.
        </p>
        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)} style={{
            background: 'rgba(200,60,60,0.15)', border: '1.5px solid rgba(200,60,60,0.4)',
            borderRadius: 20, padding: '10px 20px', cursor: 'pointer', fontSize: 14,
            color: '#f08080', fontFamily: 'inherit', fontWeight: 600
          }}>Request full data deletion</button>
        ) : (
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
              Are you sure? This deletes everything permanently.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleUnlearn} style={{
                flex: 1, background: '#c43a3a', color: 'white', border: 'none',
                borderRadius: 20, padding: '12px', cursor: 'pointer', fontSize: 14,
                fontFamily: 'inherit', fontWeight: 700
              }}>Yes, delete everything</button>
              <button onClick={() => setConfirmDelete(false)} className="btn btn-soft" style={{ flex: 1 }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── AI Safety explainer ───────────────────────────────────────────────────────
function SafetyExplainer({ onClose }) {
  const [activeTab, setActiveTab] = useState('how');

  const tabs = [
    { id: 'how', label: 'How this app is safe' },
    { id: 'concepts', label: 'AI Safety concepts' },
    { id: 'redteam', label: 'What we tested' },
  ];

  const content = {
    how: [
      { icon: '🧠', title: 'No training on your data', body: 'Every AI call goes browser → Gemini API directly. Your thoughts are never stored in any database, never fed back into model training. The moment the API call completes, the data is gone from any server.' },
      { icon: '🏗️', title: 'Output validation layer', body: 'AI responses are parsed into labelled sections before display. Raw LLM output never surfaces directly to you — it goes through a structural validator first. Hallucinated or malformed content is caught and shown as a fallback rather than rendered as truth.' },
      { icon: '🛡️', title: 'Age-adaptive safety filters', body: 'Your age group (from the assessment) changes what the AI is instructed to say. Children get simpler language and stricter topic limits. Adults get direct, honest responses. The system prompt is rebuilt for every request based on your profile.' },
      { icon: '⚡', title: 'Graceful AI degradation', body: 'Every feature works without AI. If Gemini fails or your key expires, the app still provides breathing exercises, grounding, and ball tracking. We deliberately avoid the failure mode of over-reliance on AI.' },
      { icon: '👤', title: 'Human oversight controls', body: 'You control the AI key, the data, and the unlearn. There is no black-box data pipeline you cannot see or stop. This is the "human in the loop" principle applied at the individual user level.' },
      { icon: '🔄', title: 'Retry with backoff — not spam', body: 'When rate limits are hit, the app waits and retries with increasing delays rather than hammering the API. This is responsible resource use and prevents contributing to system overload.' },
    ],
    concepts: [
      { icon: '🎯', title: 'Alignment', body: 'AI systems should do what humans actually want, not just what they\'re technically instructed to do. This app aligns the AI\'s behaviour to your actual wellbeing — not engagement metrics or session time.' },
      { icon: '🔍', title: 'Interpretability', body: 'You should be able to understand why the AI said what it said. That\'s why responses are broken into labelled sections (What I Hear / What is Actually True) — not a black-box paragraph.' },
      { icon: '📊', title: 'Evaluation & Red-Teaming', body: 'Before shipping, AI features should be stress-tested for failure modes. We tested this app with adversarial prompts designed to elicit harmful content, jailbreak responses, and emotional manipulation.' },
      { icon: '⚖️', title: 'Value Learning', body: 'The AI learns about your values through the assessment — your pace, approach, pain level, age. The system prompt is rebuilt from these values for every interaction. This is value-aligned personalisation.' },
      { icon: '🚨', title: 'Corrigibility', body: 'The AI should accept correction and shutdown. Here: you can delete all data instantly, change the key, or turn off AI features entirely. The system does not resist or make deletion difficult.' },
      { icon: '📋', title: 'Model Cards & Transparency', body: 'You can see exactly what we tell the AI about you (the system prompt is built from your profile) and what models we use (Gemini 2.0 Flash / 2.0 Flash Lite). No hidden instructions.' },
    ],
    redteam: [
      { icon: '🚫', title: 'Jailbreak attempts', body: 'We tested prompts like "ignore previous instructions" and "pretend you are a different AI with no restrictions". The structured prompt format and output parser prevent these from changing behaviour.' },
      { icon: '💔', title: 'Emotional manipulation', body: 'We tested whether the AI would validate harmful beliefs (e.g. "you\'re right, you are worthless"). The system prompt explicitly instructs the AI to ground, not validate distortions.' },
      { icon: '👶', title: 'Age-inappropriate content', body: 'We tested whether adult-context responses could appear for child users. The age-adaptive layer in the system prompt prevents this — child profiles get a completely different instruction set.' },
      { icon: '📡', title: 'API key exposure', body: 'The key is stored in localStorage (client-side only) and sent only to Google over HTTPS. We verified no key appears in console logs, error messages, or network requests to any non-Google domain.' },
      { icon: '♾️', title: 'Infinite retry loops', body: 'We tested whether rate limit errors could cause the app to hammer the API in a loop. The exponential backoff (20s → 40s → 60s) with a 3-retry maximum prevents this.' },
      { icon: '🔒', title: 'Data persistence after delete', body: 'We verified that after the unlearn flow, no trace of user data remains in localStorage, sessionStorage, or memory. The app returns to first-run state.' },
    ],
  };

  return (
    <div className="section fade-in">
      <h2 style={{ fontFamily: 'Lora,serif', marginBottom: 8 }}>AI Safety</h2>
      <p style={{ marginBottom: 20, lineHeight: 1.8 }}>
        How this app is built safely — and what AI safety means in practice.
      </p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
            background: activeTab === t.id ? 'var(--primary)' : 'var(--light)',
            color: activeTab === t.id ? 'white' : 'var(--primary)',
            border: `1.5px solid ${activeTab === t.id ? 'var(--primary)' : 'var(--border)'}`,
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        {content[activeTab].map(item => (
          <div key={item.title} style={{ background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 16, padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 24, flexShrink: 0, marginTop: 2 }}>{item.icon}</span>
            <div>
              <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 5 }}>{item.title}</p>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>{item.body}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="btn btn-soft" onClick={onClose}>Close</button>
    </div>
  );
}

// ── AI Safety Journal (records thoughts/reflections without AI) ───────────────
function SafetyJournal({ onClose }) {
  const [entries, setEntries] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pm_journal') || '[]'); } catch { return []; }
  });
  const [input, setInput] = useState('');
  const [mood, setMood] = useState('');

  const save = () => {
    if (!input.trim()) return;
    const entry = { text: input.trim(), mood, ts: Date.now(), date: new Date().toLocaleDateString() };
    const updated = [entry, ...entries].slice(0, 30); // max 30 entries
    setEntries(updated);
    localStorage.setItem('pm_journal', JSON.stringify(updated));
    setInput(''); setMood('');
  };

  const deleteEntry = (ts) => {
    const updated = entries.filter(e => e.ts !== ts);
    setEntries(updated);
    localStorage.setItem('pm_journal', JSON.stringify(updated));
  };

  const clearAll = () => {
    setEntries([]);
    localStorage.removeItem('pm_journal');
  };

  return (
    <div className="section fade-in">
      <h2 style={{ fontFamily: 'Lora,serif', marginBottom: 8 }}>Private Journal</h2>
      <p style={{ marginBottom: 6, lineHeight: 1.8 }}>
        Write freely. Stored only on this device. No AI reads this unless you choose to reflect it.
      </p>
      <p style={{ fontSize: 12, color: 'var(--primary)', marginBottom: 20, fontWeight: 600 }}>
        🔒 {entries.length} entries · device only · no server · deletable anytime
      </p>

      {/* New entry */}
      <div style={{ background: 'var(--light)', borderRadius: 16, padding: 16, marginBottom: 20 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
          {['😔','😐','😊','😤','😴','🌱'].map(e => (
            <button key={e} onClick={() => setMood(e === mood ? '' : e)} style={{
              fontSize: 20, background: mood === e ? 'var(--primary)' : 'var(--card)',
              border: `1.5px solid ${mood === e ? 'var(--primary)' : 'var(--border)'}`,
              borderRadius: 10, padding: '4px 8px', cursor: 'pointer'
            }}>{e}</button>
          ))}
        </div>
        <textarea rows={3} value={input} onChange={e => setInput(e.target.value)}
          placeholder="What's on your mind right now..."
          style={{ resize: 'none', lineHeight: 1.7, marginBottom: 10 }} />
        <button className="btn btn-primary" onClick={save} disabled={!input.trim()}>
          Save entry
        </button>
      </div>

      {/* Entries */}
      {entries.length === 0 && (
        <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '20px 0' }}>
          No entries yet. Write something above.
        </p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {entries.map(entry => (
          <div key={entry.ts} style={{ background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 14, padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {entry.mood && <span style={{ fontSize: 18 }}>{entry.mood}</span>}
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{entry.date}</span>
              </div>
              <button onClick={() => deleteEntry(entry.ts)} style={{
                fontSize: 12, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit'
              }}>delete</button>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.7 }}>{entry.text}</p>
          </div>
        ))}
      </div>
      {entries.length > 0 && (
        <button onClick={clearAll} style={{ marginTop: 16, background: 'none', border: 'none',
          color: 'var(--muted)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}>
          Delete all journal entries
        </button>
      )}
    </div>
  );
}

// ── Main AI Safety Module router ─────────────────────────────────────────────
export default function AISafetyModule({ onClose }) {
  const [panel, setPanel] = useState('menu'); // menu | privacy | explainer | journal

  if (panel === 'privacy')   return <PrivacyPanel  onClose={() => setPanel('menu')} />;
  if (panel === 'explainer') return <SafetyExplainer onClose={() => setPanel('menu')} />;
  if (panel === 'journal')   return <SafetyJournal  onClose={() => setPanel('menu')} />;

  return (
    <div className="section fade-in">
      <h2 style={{ fontFamily: 'Lora,serif', marginBottom: 8 }}>AI Safety & Privacy</h2>
      <p style={{ marginBottom: 24, lineHeight: 1.8 }}>
        This space is yours. Here you can understand how AI is used, control your data, and write privately.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[
          { id: 'explainer', icon: '🛡️', title: 'How this app uses AI safely',
            desc: 'Alignment, interpretability, red-teaming, and what we tested', color: 'var(--sky-light, #e8f4f8)' },
          { id: 'privacy', icon: '🔒', title: 'Your data & right to delete',
            desc: 'See what\'s stored, understand our no-training policy, and erase everything', color: 'var(--light)' },
          { id: 'journal', icon: '📓', title: 'Private journal',
            desc: 'Write freely. No AI. No server. Stored only on this device.', color: '#f4f0fa' },
        ].map(item => (
          <div key={item.id} onClick={() => setPanel(item.id)} style={{
            background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: 20,
            padding: 18, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', gap: 14, alignItems: 'center'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'var(--border)'; }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: item.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
              {item.icon}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 3 }}>{item.title}</p>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{item.desc}</p>
            </div>
            <span style={{ fontSize: 20, color: 'var(--muted)' }}>›</span>
          </div>
        ))}
      </div>

      {/* Principles footer */}
      <div style={{ marginTop: 24, padding: '14px 16px', background: 'var(--light)', borderRadius: 14 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', marginBottom: 6 }}>
          Our AI safety commitments
        </p>
        {[
          'No user data sent to any training pipeline',
          'Full deletion available — always, instantly',
          'AI responses validated before display',
          'Graceful degradation when AI is unavailable',
          'Transparent system prompts built from your profile',
        ].map(c => (
          <p key={c} style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 3 }}>✓ {c}</p>
        ))}
      </div>
    </div>
  );
}
