import React from 'react';
import { useApp, THEMES } from '../context/AppContext';

export default function SettingsScreen() {
  const { profile, updateProfile, theme } = useApp();

  const resetAssessment = () => {
    if (window.confirm('Reset your profile and take the assessment again?')) {
      updateProfile({ assessmentDone: false });
    }
  };

  return (
    <div className="screen">
      <div style={{ padding: '24px 24px 0' }}>
        <h2 style={{ fontFamily: 'Lora,serif' }}>Your Profile</h2>
      </div>

      <div style={{ padding: '16px 24px 0' }}>
        {/* Profile card */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 18, background: 'var(--light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
              {theme.emoji}
            </div>
            <div>
              <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{profile.name || 'Friend'}</p>
              <p style={{ fontSize: 13 }}>Age {profile.age} · {profile.ageGroup}</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div style={{ background: 'var(--light)', borderRadius: 12, padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', marginBottom: 4 }}>PAIN</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)' }}>{profile.woundLevel || '—'}</div>
            </div>
            <div style={{ background: 'var(--light)', borderRadius: 12, padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', marginBottom: 4 }}>ENERGY</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)' }}>{profile.vigourLevel || '—'}</div>
            </div>
            <div style={{ background: 'var(--light)', borderRadius: 12, padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', marginBottom: 4 }}>BALL PB</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)' }}>🏆{profile.ballHighScore || 0}</div>
            </div>
          </div>
        </div>

        {/* Adaptive settings */}
        <div className="card" style={{ marginBottom: 16 }}>
          <p style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>Adaptive settings</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Pace', value: profile.pacePreference, opts: ['slow', 'medium', 'fast'], key: 'pacePreference' },
              { label: 'Approach', value: profile.approachPreference, opts: ['gentle', 'direct', 'playful', 'structured'], key: 'approachPreference' },
              { label: 'Content', value: profile.contentPreference, opts: ['visual', 'story', 'facts', 'games'], key: 'contentPreference' },
            ].map(s => (
              <div key={s.key}>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase' }}>{s.label}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {s.opts.map(opt => (
                    <button key={opt} onClick={() => updateProfile({ [s.key]: opt })} style={{
                      background: profile[s.key] === opt ? 'var(--primary)' : 'var(--light)',
                      color: profile[s.key] === opt ? 'white' : 'var(--text)',
                      border: 'none', borderRadius: 20, padding: '6px 14px',
                      fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                      textTransform: 'capitalize', transition: 'all 0.2s'
                    }}>{opt}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Theme picker */}
        <div className="card" style={{ marginBottom: 16 }}>
          <p style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>Theme</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {Object.entries(THEMES).map(([id, t]) => (
              <div
                key={id}
                onClick={() => updateProfile({ themeId: id })}
                style={{
                  background: t.bg,
                  border: `2px solid ${profile.themeId === id ? t.primary : 'transparent'}`,
                  borderRadius: 14, padding: '12px 8px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s'
                }}
              >
                <div style={{ fontSize: 24 }}>{t.emoji}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: t.text, marginTop: 4 }}>{t.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Light sensitivity */}
        <div className="card" style={{ marginBottom: 16 }}>
          <p style={{ fontWeight: 700, marginBottom: 10, fontSize: 14 }}>Light sensitivity</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {[{ v: 'low', e: '🌑', l: 'Sensitive' }, { v: 'medium', e: '🌤️', l: 'Normal' }, { v: 'high', e: '☀️', l: 'Low' }].map(opt => (
              <button key={opt.v} onClick={() => updateProfile({ lightSensitivity: opt.v })} style={{
                flex: 1, padding: '10px 4px',
                background: profile.lightSensitivity === opt.v ? 'var(--light)' : 'var(--card)',
                border: `2px solid ${profile.lightSensitivity === opt.v ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: 12, cursor: 'pointer', textAlign: 'center', fontFamily: 'inherit', transition: 'all 0.2s'
              }}>
                <div style={{ fontSize: 18 }}>{opt.e}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', marginTop: 3 }}>{opt.l}</div>
              </button>
            ))}
          </div>
        </div>

        <button className="btn btn-ghost" onClick={resetAssessment} style={{ width: '100%', justifyContent: 'center' }}>
          Redo initial assessment
        </button>
      </div>
    </div>
  );
}
