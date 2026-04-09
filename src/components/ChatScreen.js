import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { chat, ask, getKey, buildSystemPrompt } from '../utils/gemini';

export default function ChatScreen() {
  const { profile } = useApp();
  const [messages, setMessages] = useState([]);
  const [history,  setHistory]  = useState([]);
  const [input,    setInput]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [started,  setStarted]  = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Only call Gemini when user taps Start — never on mount
  const startChat = async () => {
    if (started) return;
    setStarted(true);
    setLoading(true);

    const greeting = await ask(
      `${buildSystemPrompt(profile)}
Greet ${profile.name || 'the user'} in 2 warm sentences. Ask ONE gentle opening question. No corporate language.`
    ).catch(() => `Hey${profile.name ? ' ' + profile.name : ''}. What's going on for you right now?`);

    setMessages([{ role: 'ai', text: greeting }]);
    setHistory([
      { role: 'user',  parts: [{ text: `greet ${profile.name || 'the user'}` }] },
      { role: 'model', parts: [{ text: greeting }] },
    ]);
    setLoading(false);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text }, { role: 'ai', text: '...' }]);

    const sys = buildSystemPrompt(profile);
    const newHistory = [
      ...history,
      { role: 'user', parts: [{ text }] },
    ];

    setLoading(true);
    try {
      // Prepend system context to first message if history is short
      const apiHistory = newHistory.length <= 2
        ? [{ role: 'user', parts: [{ text: sys + '\n\nUser: ' + text }] }]
        : newHistory;

      const reply = await chat(apiHistory);
      setHistory([...newHistory, { role: 'model', parts: [{ text: reply }] }]);
      setMessages(prev => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: 'ai', text: reply };
        return copy;
      });
    } catch (e) {
      const fallback =
        e?.code === 429 ? 'Just a moment — the AI is catching up. Try again in a few seconds.' :
        e?.code === 'NO_KEY' ? 'Add your API key in Truth Mirror first.' :
        "You are here, right now. What is one thing you can see around you?";
      setMessages(prev => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: 'ai', text: fallback };
        return copy;
      });
    }
    setLoading(false);
  };

  const hasKey = !!getKey();

  const suggestions = profile.ageGroup === 'child'
    ? ['I feel sad 😢', "I'm worried", 'I feel okay today 😊']
    : profile.ageGroup === 'teen'
    ? ["I'm overthinking", 'I feel stuck', 'My anxiety is high']
    : ["I can't stop overthinking", 'I feel disconnected', "I'm struggling today"];

  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
      {/* Header */}
      <div style={{ padding: '20px 24px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🌿</div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Mind Space</p>
            <p style={{ fontSize: 12, color: 'var(--primary)' }}>Grounding · Honest · Present</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px',
        display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>

        {!started && (
          <div style={{ textAlign: 'center', padding: '48px 20px' }}>
            <div style={{ fontSize: 44, marginBottom: 16 }}>🌿</div>
            <p style={{ fontSize: 15, color: 'var(--text)', marginBottom: 8, lineHeight: 1.7 }}>
              {hasKey
                ? 'Ready when you are.'
                : 'Add your Gemini key in Truth Mirror, then come back here.'}
            </p>
            {hasKey && (
              <button className="btn btn-primary" onClick={startChat}
                style={{ maxWidth: 200, margin: '16px auto 0' }}>
                Start conversation
              </button>
            )}
          </div>
        )}

        {started && loading && messages.length === 0 && (
          <div className="ai-bubble chat-bubble">
            <div className="typing"><span /><span /><span /></div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === 'ai' ? 'ai-bubble chat-bubble fade-in' : 'user-bubble chat-bubble'}>
            {msg.text === '...'
              ? <div className="typing"><span /><span /><span /></div>
              : <span style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</span>}
          </div>
        ))}

        {messages.length === 1 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {suggestions.map(s => (
              <button key={s} onClick={() => setInput(s)} style={{
                background: 'var(--card)', border: '1.5px solid var(--border)',
                borderRadius: 20, padding: '6px 12px', fontSize: 13,
                cursor: 'pointer', color: 'var(--text)', fontFamily: 'inherit',
              }}>{s}</button>
            ))}
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Input — only shown after start */}
      {started && (
        <div style={{ padding: '8px 24px 24px', display: 'flex', gap: 10,
          flexShrink: 0, borderTop: '1px solid var(--border)' }}>
          <input type="text" placeholder="What's on your mind..."
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !loading && send()}
            style={{ borderRadius: 24 }} />
          <button onClick={send} disabled={loading || !input.trim()} style={{
            width: 46, height: 46, borderRadius: '50%',
            background: loading ? 'var(--light)' : 'var(--primary)',
            color: 'white', border: 'none', cursor: 'pointer',
            fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>↑</button>
        </div>
      )}
    </div>
  );
}
