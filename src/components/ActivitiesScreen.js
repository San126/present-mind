import React from 'react';
import { useApp } from '../context/AppContext';

export default function ActivitiesScreen({ onOpenGame }) {
  const { profile } = useApp();

  const activities = [
    { id: 'ball',      icon: '👁️', title: 'Ball Tracking',
      desc: 'Click the moving ball. Sharpens neural focus and calms overthinking.',
      tag: 'Focus', color: '#e8f4f8', stat: `Best: ${profile.ballHighScore || 0} pts`,
      ageNote: { child: 'Tap the ball as fast as you can! 🎯', teen: 'How fast can you catch it?', adult: null } },
    { id: 'breath',    icon: '🌬️', title: 'Breathing Space',
      desc: 'Follow the breathing ring. Activates calm in your nervous system.',
      tag: 'Calming', color: 'var(--light)' },
    { id: 'grounding', icon: '🌿', title: '5-4-3-2-1 Grounding',
      desc: 'Use your 5 senses to pull yourself back to the present moment.',
      tag: 'Grounding', color: '#f0f7e8' },
    { id: 'truth',     icon: '💡', title: 'Truth Mirror',
      desc: 'Write a difficult thought. Get honest AI reflection on what\'s real.',
      tag: 'Clarity', color: '#fff8e8' },
    { id: 'slow',      icon: '🔍', title: 'Slow Observation',
      desc: 'Choose one object and describe it carefully. Pure present-moment practice.',
      tag: 'Presence', color: '#f4f0fa' },
    { id: 'safety',    icon: '🛡️', title: 'AI Safety & Privacy',
      desc: 'Understand how AI is used here, control your data, and write privately. No AI reads this.',
      tag: 'Safety', color: '#e8f4f0', stat: 'Your rights', highlight: true },
  ];

  return (
    <div className="screen">
      <div style={{ padding: '24px 24px 0' }}>
        <h2 style={{ fontFamily: 'Lora,serif' }}>Mindful Activities</h2>
        <p style={{ marginTop: 6 }}>Each one brings you back to now. Start with any that calls to you.</p>
      </div>
      <div style={{ padding: '16px 24px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {activities.map(act => {
          const ageNote = act.ageNote?.[profile.ageGroup];
          return (
            <div key={act.id} onClick={() => onOpenGame(act.id)} style={{
              background: 'var(--card)',
              border: act.highlight ? '2px solid var(--primary)' : '1.5px solid var(--border)',
              borderRadius: 20, padding: 18, cursor: 'pointer', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: 14 }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: act.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                {act.icon}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{act.title}</p>
                <p style={{ fontSize: 13, marginTop: 2, lineHeight: 1.5 }}>{ageNote || act.desc}</p>
                <div style={{ display: 'flex', gap: 6, marginTop: 6, alignItems: 'center' }}>
                  <span className="tag" style={{ fontSize: 11 }}>{act.tag}</span>
                  {act.stat && <span style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600 }}>{act.stat}</span>}
                </div>
              </div>
              <span style={{ fontSize: 20, color: 'var(--muted)', flexShrink: 0 }}>›</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
