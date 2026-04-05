import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { geminiChat, buildSystemPrompt } from '../utils/gemini';

export default function ChatScreen() {
  const { profile } = useApp();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    initChat();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initChat = async () => {
    setLoading(true);
    const sysPrompt = buildSystemPrompt(profile);
    const greetPrompt = `${sysPrompt}

Start the conversation. Greet ${profile.name || 'the user'} warmly in 2-3 sentences. Match their profile: ${profile.ageGroup}, ${profile.approachPreference} approach. Ask ONE gentle opening question. Be real, not corporate.`;

    try {
      const reply = await geminiChat([{ role: 'user', parts: [{ text: greetPrompt }] }]);
      const aiMsg = { role: 'ai', text: reply };
      setMessages([aiMsg]);
      setHistory([{ role: 'user', parts: [{ text: greetPrompt }] }, { role: 'model', parts: [{ text: reply }] }]);
    } catch {
      const fallback = `Hey ${profile.name || 'there'}. Glad you're here. What's going on for you right now?`;
      setMessages([{ role: 'ai', text: fallback }]);
    }
    setLoading(false);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const userMsg = { role: 'user', text };
    setMessages(prev => [...prev, userMsg, { role: 'ai', text: '...' }]);

    const newHistory = [...history, { role: 'user', parts: [{ text }] }];
    setLoading(true);

    try {
      const reply = await geminiChat(newHistory);
      const modelMsg = { role: 'model', parts: [{ text: reply }] };
      setHistory([...newHistory, modelMsg]);
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'ai', text: reply };
        return updated;
      });
    } catch {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'ai', text: 'You\'re here right now. What\'s one thing you can notice around you?' };
        return updated;
      });
    }
    setLoading(false);
  };

  const suggestions = profile.ageGroup === 'child'
    ? ['I feel sad 😢', 'I\'m worried about something', 'I can\'t focus', 'I feel okay today! 😊']
    : profile.ageGroup === 'teen'
    ? ['I\'m overthinking everything', 'I feel stuck', 'My anxiety is high', 'I actually feel okay']
    : ['I can\'t stop overthinking', 'I feel disconnected', 'I\'m struggling today', 'Help me stay present'];

  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
      {/* Header */}
      <div style={{ padding: '20px 24px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 50, background: 'var(--light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🌿</div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Mind Space</p>
            <p style={{ fontSize: 12, color: 'var(--primary)' }}>Grounding • Honest • Present</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
        {loading && messages.length === 0 && (
          <div className="ai-bubble chat-bubble">
            <div className="typing"><span /><span /><span /></div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === 'ai' ? 'ai-bubble chat-bubble fade-in' : 'user-bubble chat-bubble'}>
            {msg.text === '...'
              ? <div className="typing"><span /><span /><span /></div>
              : <span style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</span>
            }
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Quick suggestions */}
      {messages.length <= 2 && (
        <div style={{ padding: '0 24px 8px', flexShrink: 0 }}>
          <p style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, marginBottom: 6 }}>QUICK START</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {suggestions.map(s => (
              <button key={s} onClick={() => { setInput(s); }} style={{
                background: 'var(--card)', border: '1.5px solid var(--border)',
                borderRadius: 20, padding: '6px 12px', fontSize: 13, cursor: 'pointer',
                color: 'var(--text)', transition: 'all 0.2s', fontFamily: 'inherit'
              }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{ padding: '8px 24px 24px', display: 'flex', gap: 10, flexShrink: 0, borderTop: '1px solid var(--border)' }}>
        <input
          type="text"
          placeholder={profile.ageGroup === 'child' ? "Tell me how you feel..." : "What's on your mind..."}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          style={{ borderRadius: 24 }}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          style={{
            width: 46, height: 46, borderRadius: '50%',
            background: loading ? 'var(--light)' : 'var(--primary)',
            color: 'white', border: 'none', cursor: 'pointer',
            fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'all 0.2s'
          }}
        >↑</button>
      </div>
    </div>
  );
}
