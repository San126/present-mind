# 🌿 Present Mind — Mental Wellness App

A React app for grounding, presence, and mental clarity. Built with adaptive learning, Gemini AI, and interactive neural exercises.

---

## 🚀 Quick Start (VS Code)

### Step 1 — Prerequisites
Make sure you have these installed:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://npmjs.com/) (comes with Node)

Check by running in terminal:
```bash
node --version
npm --version
```

---

### Step 2 — Get your FREE Gemini API Key
1. Go to: **https://aistudio.google.com/app/apikey**
2. Sign in with Google
3. Click **"Create API Key"**
4. Copy the key

---

### Step 3 — Add your API Key
Open the `.env` file in the project root and replace the key:
```
REACT_APP_GEMINI_KEY=YOUR_KEY_HERE
```

---

### Step 4 — Install & Run
Open a terminal inside the `present-mind` folder and run:

```bash
npm install
npm start
```

The app will open automatically at **http://localhost:3000**

---

## 📁 Project Structure

```
present-mind/
├── public/
│   └── index.html
├── src/
│   ├── context/
│   │   └── AppContext.js        ← Global state, themes, adaptive settings
│   ├── components/
│   │   ├── Assessment.js        ← 6-step adaptive intake assessment
│   │   ├── Home.js              ← Dashboard with reminders & activities
│   │   ├── ChatScreen.js        ← Gemini AI chat (grounding companion)
│   │   ├── ActivitiesScreen.js  ← All games/activities list
│   │   ├── SettingsScreen.js    ← Profile, theme, adaptive settings
│   │   └── GameScreen.js        ← Game launcher wrapper
│   ├── games/
│   │   ├── BallTracker.js       ← Interactive ball tracking with scoring
│   │   ├── BreathingGame.js     ← Adaptive breathing patterns
│   │   ├── TruthMirror.js       ← AI thought challenger
│   │   └── GroundingGames.js    ← 5-4-3-2-1 + Slow Observation
│   ├── utils/
│   │   └── gemini.js            ← Gemini API calls + system prompt builder
│   ├── App.js                   ← Main router + nav
│   ├── index.js                 ← Entry point
│   └── index.css                ← Global styles + CSS variables
├── .env                         ← Your Gemini API key goes here
└── package.json
```

---

## 🧠 Features

### 1. Adaptive Assessment (6 steps)
Collects:
- **Name & Age** → determines age group (child 6-12 / teen 13-17 / adult / mature 40+)
- **Current mood** → sets emotional baseline
- **Content style** → visual / story / facts / games
- **Pace & approach** → slow/medium/fast + gentle/direct/playful/structured
- **Wound & vigour sliders** → pain level (0-10) and energy level (0-10)
- **Light sensitivity** → auto-selects best theme

### 2. Auto Theme Selection
Based on assessment answers, the app automatically picks the best theme:
- **High light sensitivity** → Deep Night (dark mode)
- **High wound level** → Soft Lavender (gentle)
- **Playful approach** → Warm Sunset (warm, cozy)
- **Direct approach** → Ocean Mist (clear, focused)
- **Default** → Calm Forest (grounding greens)

Themes: Calm Forest 🌿 · Warm Sunset 🌅 · Deep Night 🌙 · Soft Lavender 💜 · Ocean Mist 🌊 · High Contrast ⬛

### 3. Ball Tracking Game (Interactive + Scored)
- Ball moves around the arena — **click/tap it to score**
- 5 difficulty levels: Calm → Focus → Sharp → Swift → Elite
- Auto levels up every 20 points
- **Streak multiplier** — chain hits for bonus points
- Ripple animations on hit/miss
- Real-time accuracy tracking
- Personal best saved across sessions
- Adaptive speed based on user's pace preference

### 4. Breathing Space
- Pattern adapts to pace: slow (5-3-7-3) / medium (4-2-6-2) / fast (3-1-5-1)
- Animated breathing ring expands/contracts
- Cycle counter — encourages completing 3 cycles

### 5. 5-4-3-2-1 Grounding
- Type in what you actually see/touch/hear/smell/taste
- Cannot progress until minimum items entered
- Summarizes all 5 senses at end

### 6. Truth Mirror (AI-powered)
- Write a difficult thought
- Gemini reflects what's real vs what's a story the mind created
- Age-adapted response (child/teen/adult language)
- Approach-adapted tone (gentle/direct/playful/structured)

### 7. Slow Observation
- 5 structured questions about one chosen object
- Forces present-moment attention
- Must complete all fields

### 8. Mind Space Chat
- Full Gemini AI conversation
- System prompt built from user profile (age, wound level, approach style)
- Quick-start suggestions adapted by age group
- Grounding reminders woven into responses

### 9. Home Dashboard
- Rotating grounding reminders (every 90 seconds, haptic on mobile)
- Happiness bar (grows as activities are completed)
- 3 daily activity targets with completion tracking
- Weekly streak visualization
- Quick mood check-in

### 10. Profile & Settings
- Change theme live
- Adjust pace, approach, content style instantly
- Light sensitivity toggle
- Redo assessment option
- Ball tracking personal best display

---

## 🎨 Theme CSS Variables
All themes use CSS variables for instant switching:
```css
--bg       /* Page background */
--card     /* Card surface */
--primary  /* Main action color */
--accent   /* Softer accent */
--light    /* Highlight/tag background */
--text     /* Body text */
--muted    /* Secondary text */
--border   /* Borders and dividers */
```

---

## 🔑 Gemini API Notes
- Uses **Gemini 2.0 Flash** (free tier)
- Free quota: ~1,500 requests/day
- No billing required for free tier
- Get key: https://aistudio.google.com/app/apikey

---

## ♿ Accessibility & Adaptive Design
- Font adapts to theme (DM Sans / Nunito / Quicksand)
- Dark mode theme available (Deep Night)
- High contrast theme for visual clarity
- Child mode: larger tap targets, emoji, simple language
- Slow mode: slower animations, gentler pacing
- All interactions keyboard-friendly

---

## 📱 Mobile
Works in mobile browsers. For best experience on phone:
1. Run `npm start` on your computer
2. Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac)
3. On your phone browser, go to `http://YOUR_IP:3000`

---

## 🛠 Troubleshooting

**"Module not found" error**
```bash
rm -rf node_modules
npm install
```

**API key not working**
- Make sure `.env` file is in the project root (same level as `package.json`)
- Restart `npm start` after changing `.env`
- Check key at: https://aistudio.google.com/app/apikey

**Port 3000 already in use**
```bash
npm start -- --port 3001
```
