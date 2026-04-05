// ── Gemini API utility ────────────────────────────────────────────────────────
// Free tier: ~15 req/min on gemini-2.0-flash
// Get key: https://aistudio.google.com/app/apikey

export function getKey() {
  // .env key only wins if it is non-empty and looks valid (starts with AIza)
  const envKey = (process.env.REACT_APP_GEMINI_KEY || '').trim();
  const localKey = (localStorage.getItem('pm_gemini_key') || '').trim();
  const key = (envKey.startsWith('AIza') ? envKey : '') || localKey;
  return key;
}

export function saveKey(key) {
  localStorage.setItem('pm_gemini_key', key.trim());
}

const MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash-8b',
];

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function attemptModel(model, key, messages) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: messages,
        generationConfig: { temperature: 0.85, maxOutputTokens: 700 },
      }),
    });
  } catch {
    throw new Error('NETWORK');
  }

  if (res.status === 404) return null;           // model unavailable → try next
  if (res.status === 401 || res.status === 403) throw new Error('BAD_KEY');
  if (res.status === 429) throw new Error('RATE_LIMIT');
  if (!res.ok) {
    const b = await res.json().catch(() => ({}));
    throw new Error('API_ERROR: ' + (b?.error?.message || res.status));
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('EMPTY');
  return text;
}

// Main export — auto-retry with backoff on 429
export async function geminiChat(messages, { retries = 3, onRetry } = {}) {
  const key = getKey();
  if (!key || !key.startsWith('AIza')) throw new Error('NO_KEY');

  for (let attempt = 0; attempt <= retries; attempt++) {
    let hit429 = false;
    for (const model of MODELS) {
      try {
        const text = await attemptModel(model, key, messages);
        if (text === null) continue; // 404 → try next model
        return { text, model };
      } catch (e) {
        if (e.message === 'RATE_LIMIT') {
          hit429 = true;
          break; // stop trying models, go to retry wait
        }
        if (e.message === 'BAD_KEY' || e.message === 'NETWORK') throw e;
        // other errors → try next model
      }
    }

    if (hit429) {
      if (attempt >= retries) throw new Error('RATE_LIMIT');
      const delayMs = 22000 * (attempt + 1); // 22s, 44s, 66s
      if (onRetry) onRetry(attempt + 1, delayMs);
      await wait(delayMs);
    }
  }
  throw new Error('RATE_LIMIT');
}

export async function geminiSingle(prompt, opts) {
  return geminiChat([{ role: 'user', parts: [{ text: prompt }] }], opts);
}

export function buildSystemPrompt(profile) {
  const age =
    profile.ageGroup === 'child' ? 'a child (6-12)' :
    profile.ageGroup === 'teen'  ? 'a teenager (13-17)' :
    profile.ageGroup === 'adult' ? 'an adult' : 'a mature adult (40+)';

  return `You are Present Mind, a grounding wellness companion for ${age} named ${profile.name || 'friend'}.
Pain: ${profile.woundLevel || 5}/10 | Energy: ${profile.vigourLevel || 5}/10
Style: ${profile.approachPreference || 'gentle'} | Pace: ${profile.pacePreference || 'medium'}
Rules: Be warm, honest, direct. Never generic. Only NOW is real. Suggest professional support if severe distress.`;
}
