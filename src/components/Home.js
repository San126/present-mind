import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

const REMINDERS = [
  { h: "You are here, right now.", p: "Feel your feet on the ground. Look around you." },
  { h: "Take one slow breath.", p: "In through your nose. Out through your mouth." },
  { h: "The past is just a memory.", p: "The future is just a thought. This moment is real." },
  { h: "Notice something near you.", p: "Look at it. What colour is it exactly?" },
  { h: "Your mind is working hard.", p: "It's allowed to rest for a moment." },
  { h: "Right now, you are safe.", p: "Name three things you can see from where you sit." },
];

export default function Home({ onOpenGame }) {
  const { profile, theme } = useApp();
  const [reminderIdx, setReminderIdx] = useState(0);
  const name = profile.name || 'friend';

  useEffect(() => {
    const t = setInterval(() => {
      setReminderIdx(i => (i + 1) % REMINDERS.length);
      if ('vibrate' in navigator) navigator.vibrate(150);
    }, 90000);
    return () => clearInterval(t);
  }, []);

  const reminder = REMINDERS[reminderIdx];

  const todayActivities = [
    { id: 'breath', icon: '🌬️', label: 'Breathing exercise', tag: 'Calm', game: 'breath' },
    { id: 'ball', icon: '👁️', label: 'Ball tracking', tag: `Best: ${profile.ballHighScore || 0}`, game: 'ball' },
    { id: 'truth', icon: '💡', label: 'Challenge a thought', tag: 'Clarity', game: 'truth' },
  ];

  const todayDone = profile.activitiesCompleted?.filter(a => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return a.date >= today.getTime();
  }).map(a => a.id) || [];

  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  const ageGreeting = profile.ageGroup === 'child' ? '👋 Hey' :
    profile.ageGroup === 'teen' ? 'Hey' : 'Hello,';

  const happinessPct = Math.min(95, profile.happinessScore || 30);

  return (
    <div className="screen">
      {/* Hero */}
      <div style={{ padding: '24px 24px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>{ageGreeting}</p>
            <h1 style={{ fontFamily: 'Lora,serif', fontSize: 26 }}>{name} {profile.ageGroup === 'child' ? '🌟' : ''}</h1>
          </div>
          <div style={{
            width: 44, height: 44, borderRadius: 14, background: 'var(--light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22
          }}>
            {theme.emoji}
          </div>
        </div>

        {/* Grounding reminder */}
        <div style={{ marginTop: 16, background: `linear-gradient(135deg, var(--primary), ${theme.accent})`, borderRadius: 20, padding: '18px 20px', color: 'white' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 28 }}>🔔</span>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'white', lineHeight: 1.3 }}>{reminder.h}</p>
              <p style={{ fontSize: 13, opacity: 0.85, color: 'white', marginTop: 2, lineHeight: 1.4 }}>{reminder.p}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Happiness */}
      <div style={{ padding: '20px 24px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <h3>Wellbeing today</h3>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>{happinessPct}%</span>
        </div>
        <div style={{ height: 10, background: 'var(--light)', borderRadius: 20, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${happinessPct}%`,
            background: `linear-gradient(90deg, #e87a7a 0%, #f5d486 45%, var(--accent) 100%)`,
            borderRadius: 20, transition: 'width 1.5s ease'
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>Struggling</span>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>Thriving</span>
        </div>
      </div>

      {/* Activities */}
      <div style={{ padding: '20px 24px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3>Today's activities</h3>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{todayDone.length} / 3</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {todayActivities.map(act => {
            const done = todayDone.includes(act.id);
            return (
              <div
                key={act.id}
                onClick={() => onOpenGame(act.game)}
                style={{
                  background: done ? 'var(--light)' : 'var(--card)',
                  border: `1.5px solid ${done ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: 18, padding: '14px 16px',
                  display: 'flex', alignItems: 'center', gap: 12,
                  cursor: 'pointer', transition: 'all 0.2s',
                  opacity: done ? 0.75 : 1
                }}
              >
                <div style={{ width: 42, height: 42, borderRadius: 13, background: done ? 'var(--primary)' : 'var(--light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                  {done ? '✓' : act.icon}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{act.label}</p>
                  <span className="tag" style={{ fontSize: 11 }}>{act.tag}</span>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: 18, color: 'var(--muted)' }}>›</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Streak */}
      <div style={{ padding: '20px 24px 0' }}>
        <h3 style={{ marginBottom: 10 }}>This week</h3>
        <div style={{ display: 'flex', gap: 6 }}>
          {days.map((d, i) => (
            <div key={i} style={{
              flex: 1, height: 34, borderRadius: 8,
              border: `2px solid ${i === todayIdx ? 'var(--primary)' : 'var(--border)'}`,
              background: i < todayIdx ? 'var(--primary)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 700,
              color: i < todayIdx ? 'white' : i === todayIdx ? 'var(--primary)' : 'var(--muted)'
            }}>
              {d}
            </div>
          ))}
        </div>
      </div>

      {/* Quick mood check */}
      <div style={{ padding: '20px 24px 0' }}>
        <h3 style={{ marginBottom: 10 }}>Quick check-in</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
          {[
            { e: '😔', l: 'Heavy' }, { e: '😐', l: 'Okay' }, { e: '😊', l: 'Good' },
            { e: '😤', l: 'Tense' }, { e: '😴', l: 'Tired' }, { e: '🌱', l: 'Growing' },
          ].map(m => (
            <div key={m.l} onClick={() => {}} style={{
              background: 'var(--card)', border: '1.5px solid var(--border)',
              borderRadius: 14, padding: '12px 8px', textAlign: 'center', cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              <div style={{ fontSize: 22 }}>{m.e}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginTop: 4 }}>{m.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
