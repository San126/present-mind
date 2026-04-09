import { GoogleGenerativeAI } from "@google/generative-ai";

// ── Key helpers ─────────────────────────────────────────────
export function getKey() {
  return (localStorage.getItem('tm_gemini_key') || '').trim();
}

export function saveKey(k) {
  localStorage.setItem('tm_gemini_key', k.trim());
}

// ── Model creator ───────────────────────────────────────────
export function createModel(systemInstruction = '') {
  const key = getKey();
  if (!key) throw new Error('NO_KEY');

  const genAI = new GoogleGenerativeAI(key);

  return genAI.getGenerativeModel({
    // ✅ Updated to Gemini 2.5 Flash Lite
    model: 'models/gemini-2.5-flash-lite',
    ...(systemInstruction ? { systemInstruction } : {}),
  });
}

// ── Core single agent ───────────────────────────────────────
export async function runAgent(prompt, systemInstruction = '') {
  try {
    const model = createModel(systemInstruction);
    const result = await model.generateContent(prompt);

    const text = result.response.text();
    if (!text) throw new Error('EMPTY');

    return text;

  } catch (e) {
    const msg = e?.message || '';
    if (msg.includes('API key')) throw new Error('BAD_KEY');
    if (msg.includes('429')) throw new Error('RATE_LIMIT');
    throw new Error('UNKNOWN');
  }
}

// ── ask() helper ────────────────────────────────────────────
export async function ask(prompt) {
  return runAgent(
    prompt,
    'You are Present Mind, a warm grounding wellness companion.'
  );
}

// ── chat() helper ───────────────────────────────────────────
export async function chat(messages) {
  try {
    const model = createModel();

    const history = messages.slice(0, -1).map(m => ({
      role: m.role,
      parts: m.parts,
    }));

    const lastMsg = messages[messages.length - 1].parts[0].text;

    const session = model.startChat({ history });
    const result = await session.sendMessage(lastMsg);

    return result.response.text();

  } catch (e) {
    const msg = e?.message || '';
    if (msg.includes('API key')) throw new Error('BAD_KEY');
    if (msg.includes('429')) throw new Error('RATE_LIMIT');
    throw new Error('UNKNOWN');
  }
}

// ── System prompt builder ───────────────────────────────────
export function buildSystemPrompt(profile = {}) {
  return `You are Present Mind, a warm grounding wellness companion. Only NOW is real.`;
}

// ── TruthMirror pipeline ────────────────────────────────────
export async function runTruthMirror(thought, onStep = () => {}) {
  const stages = [
    {
      role: 'compassionate listener',
      prompt: `The person wrote: "${thought}"\nReflect what they are going through in 2 sentences.`,
      key: 'heard'
    },
    {
      role: 'calm truth-finder',
      prompt: `The person wrote: "${thought}"\nSeparate facts from anxious interpretation in 2 sentences.`,
      key: 'truth'
    },
    {
      role: 'grounding guide',
      prompt: `The person wrote: "${thought}"\nGround them in the present moment in 2 sentences.`,
      key: 'ground'
    },
    {
      role: 'action guide',
      prompt: `The person wrote: "${thought}"\nGive ONE small practical step.`,
      key: 'action'
    }
  ];

  const results = {};

  for (let i = 0; i < stages.length; i++) {
    const { role, prompt, key } = stages[i];
    onStep(i);
    results[key] = await runAgent(prompt, `You are ${role}.`);
  }

  return results;
}

// ✅ Backward compatibility: export runAgents too
export { runTruthMirror as runAgents };
