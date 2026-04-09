import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(null);

export const THEMES = {
  calm_forest: {
    name: 'Calm Forest',
    bg: '#f0f7f0', card: '#ffffff', primary: '#3d6b50', accent: '#7a9e87',
    light: '#d4e8db', text: '#1e3a2a', muted: '#5a7a66', border: 'rgba(61,107,80,0.15)',
    font: 'DM Sans', emoji: '🌿', description: 'Gentle greens, soft and grounding',
  },
  warm_sunset: {
    name: 'Warm Sunset',
    bg: '#fff8f0', card: '#ffffff', primary: '#c46a2a', accent: '#e8a87c',
    light: '#fde8d0', text: '#3a1f0a', muted: '#8a5a3a', border: 'rgba(196,106,42,0.15)',
    font: 'Nunito', emoji: '🌅', description: 'Warm oranges, cozy and safe',
  },
  deep_night: {
    name: 'Deep Night',
    bg: '#0f1923', card: '#1a2733', primary: '#4a90b8', accent: '#7ab8d8',
    light: '#1e3344', text: '#e8f4fc', muted: '#8ab0c8', border: 'rgba(74,144,184,0.2)',
    font: 'DM Sans', emoji: '🌙', description: 'Dark mode, easy on the eyes',
  },
  soft_lavender: {
    name: 'Soft Lavender',
    bg: '#f4f0fa', card: '#ffffff', primary: '#6a4ca0', accent: '#a87ed8',
    light: '#e8dff5', text: '#2a1a40', muted: '#7a6090', border: 'rgba(106,76,160,0.15)',
    font: 'Quicksand', emoji: '💜', description: 'Gentle purples, calm and creative',
  },
  ocean_mist: {
    name: 'Ocean Mist',
    bg: '#f0f6fb', card: '#ffffff', primary: '#2a7ab8', accent: '#6ab0d8',
    light: '#d8ecf8', text: '#0a2a3a', muted: '#4a7a9a', border: 'rgba(42,122,184,0.15)',
    font: 'DM Sans', emoji: '🌊', description: 'Cool blues, clear and focused',
  },
  high_contrast: {
    name: 'High Contrast',
    bg: '#ffffff', card: '#f8f8f8', primary: '#000000', accent: '#333333',
    light: '#e8e8e8', text: '#000000', muted: '#444444', border: 'rgba(0,0,0,0.3)',
    font: 'DM Sans', emoji: '⬛', description: 'Maximum clarity, no strain',
  }
};

const DEFAULT_PROFILE = {
  name: '', age: null, ageGroup: null,
  assessmentDone: false,
  contentPreference: null, pacePreference: null,
  woundLevel: null, vigourLevel: null,
  approachPreference: null, lightSensitivity: null,
  themeId: 'calm_forest',
  happinessScore: 30, sessions: 0,
  activitiesCompleted: [],
  ballHighScore: 0, streakDays: 0, lastVisit: null,
};

export function AppProvider({ children }) {
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('presentMindProfile');
      return saved ? { ...DEFAULT_PROFILE, ...JSON.parse(saved) } : DEFAULT_PROFILE;
    } catch { return DEFAULT_PROFILE; }
  });
  const [screen, setScreen] = useState('splash');

  const theme = THEMES[profile.themeId] || THEMES.calm_forest;

  // Save to localStorage
  useEffect(() => {
    try { localStorage.setItem('presentMindProfile', JSON.stringify(profile)); } catch {}
  }, [profile]);

  // Apply theme — set on BOTH :root AND body AND #root element to ensure override
  useEffect(() => {
    const vars = {
      '--bg': theme.bg,
      '--card': theme.card,
      '--primary': theme.primary,
      '--accent': theme.accent,
      '--light': theme.light,
      '--text': theme.text,
      '--muted': theme.muted,
      '--border': theme.border,
      '--font': `'${theme.font}'`,
    };

    // Apply to :root (document element)
    const root = document.documentElement;
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));

    // Also force on body
    document.body.style.background = theme.bg;
    document.body.style.color = theme.text;
    document.body.style.fontFamily = `'${theme.font}', sans-serif`;

    // Force on #root div
    const rootEl = document.getElementById('root');
    if (rootEl) {
      rootEl.style.background = theme.bg;
      Object.entries(vars).forEach(([k, v]) => rootEl.style.setProperty(k, v));
    }
  }, [theme]);

  const updateProfile = (updates) => setProfile(p => ({ ...p, ...updates }));

  const markActivityDone = (id) => {
    updateProfile({
      activitiesCompleted: [...(profile.activitiesCompleted || []), { id, date: Date.now() }],
      happinessScore: Math.min(95, profile.happinessScore + 5)
    });
  };

  const getAdaptiveContent = () => {
    const p = profile;
    return {
      useEmoji: p.ageGroup === 'child' || p.contentPreference === 'visual' || p.approachPreference === 'playful',
      useStories: p.contentPreference === 'story',
      useFacts: p.contentPreference === 'facts',
      speed: p.pacePreference || 'medium',
      isChild: p.ageGroup === 'child',
      isTeen: p.ageGroup === 'teen',
      tone: p.approachPreference || 'gentle',
      ballSpeed: p.pacePreference === 'slow' ? 1200 : p.pacePreference === 'fast' ? 600 : 900,
      breathDuration: p.pacePreference === 'slow' ? 5000 : p.pacePreference === 'fast' ? 3000 : 4000,
      pacePreference: p.pacePreference || 'medium',
    };
  };

  return (
    <AppContext.Provider value={{
      profile, updateProfile, theme, screen, setScreen,
      markActivityDone, getAdaptiveContent, THEMES
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
