import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Assessment from './components/Assessment';
import Home from './components/Home';
import ActivitiesScreen from './components/ActivitiesScreen';
import ChatScreen from './components/ChatScreen';
import SettingsScreen from './components/SettingsScreen';
import GameScreen from './components/GameScreen';
import './index.css';

function Splash() {
  const { setScreen } = useApp();
  React.useEffect(() => {
    const t = setTimeout(() => setScreen('app'), 1800);
    return () => clearTimeout(t);
  }, [setScreen]);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)',
    }}>
      <div style={{ fontSize: 56, marginBottom: 12, animation: 'breathe 2s ease-in-out infinite' }}>🌿</div>
      <p style={{ fontFamily: 'Lora, serif', fontSize: 22, color: 'var(--text)', fontStyle: 'italic' }}>Present Mind</p>
    </div>
  );
}

function NavBar({ tab, setTab }) {
  const navItems = [
    { id: 'home',       icon: '🏡', label: 'Home' },
    { id: 'activities', icon: '🎯', label: 'Activities' },
    { id: 'chat',       icon: '💬', label: 'Mind Space' },
    { id: 'settings',   icon: '⚙️', label: 'Profile' },
  ];
  return (
    <div className="nav-bar">
      {navItems.map(n => (
        <button
          key={n.id}
          className={`nav-btn ${tab === n.id ? 'active' : ''}`}
          onClick={() => setTab(n.id)}
        >
          <span className="nav-icon">{n.icon}</span>
          <span className="nav-label">{n.label}</span>
        </button>
      ))}
    </div>
  );
}

function AppInner() {
  const { profile, screen, setScreen, theme } = useApp();
  const [tab, setTab] = useState('home');
  const [openGame, setOpenGame] = useState(null);

  // Themed wrapper — forces background update on theme change
  const wrapperStyle = {
    minHeight: '100vh',
    background: theme.bg,
    color: theme.text,
    fontFamily: `'${theme.font}', sans-serif`,
    transition: 'background 0.4s ease, color 0.3s ease',
  };

  if (screen === 'splash') return <div style={wrapperStyle}><Splash /></div>;
  if (!profile.assessmentDone) return <div style={wrapperStyle}><Assessment /></div>;

  if (openGame) {
    return (
      <div style={wrapperStyle}>
        <GameScreen gameId={openGame} onClose={() => setOpenGame(null)} />
      </div>
    );
  }

  return (
    <div style={wrapperStyle}>
      {tab === 'home'       && <Home onOpenGame={setOpenGame} />}
      {tab === 'activities' && <ActivitiesScreen onOpenGame={setOpenGame} />}
      {tab === 'chat'       && <ChatScreen />}
      {tab === 'settings'   && <SettingsScreen />}
      <NavBar tab={tab} setTab={setTab} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
