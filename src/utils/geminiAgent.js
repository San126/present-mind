// // ─────────────────────────────────────────────────────────────
// // Gemini Agent — CLEAN FINAL (backend only)
// // ─────────────────────────────────────────────────────────────

// import { GoogleGenerativeAI } from "@google/generative-ai";

// // ── Key helpers ─────────────────────────────────────────────
// export function getKey() {
//   return (localStorage.getItem('tm_gemini_key') || '').trim();
// }

// export function saveKey(k) {
//   localStorage.setItem('tm_gemini_key', k.trim());
// }

// // ── Model ───────────────────────────────────────────────────
// function createModel(systemInstruction = '') {
//   const key = getKey();
//   if (!key) throw new Error('NO_KEY');

//   const genAI = new GoogleGenerativeAI(key);

//   return genAI.getGenerativeModel({
//     model: 'gemini-1.5-flash',
//     ...(systemInstruction ? { systemInstruction } : {}),
//   });
// }

// // ── Single Agent ────────────────────────────────────────────
// export const runAgent = async (prompt, systemInstruction = '') => {
//   try {
//     const model = createModel(systemInstruction);
//     const chat = model.startChat();
//     const result = await chat.sendMessage(prompt);

//     const text = result.response.text();
//     if (!text) throw new Error('EMPTY');

//     return text;

//   } catch (e) {
//     const msg = e?.message || '';

//     if (msg.includes('API key')) throw new Error('BAD_KEY');
//     if (msg.includes('429')) throw new Error('RATE_LIMIT');

//     throw new Error('UNKNOWN');
//   }
// };

// // ── 4-Agent Pipeline ────────────────────────────────────────
// export async function runAgents(thought, onStep = () => {}) {

//   onStep(0);

//   const heard = await runAgent(
//     `The person wrote: "${thought}"\nReflect what they are going through in 2 sentences.`,
//     'You are a compassionate listener.'
//   );

//   onStep(1);

//   const truth = await runAgent(
//     `The person wrote: "${thought}"\nSeparate facts from anxious interpretation in 2 sentences.`,
//     'You are a calm truth-finder.'
//   );

//   onStep(2);

//   const ground = await runAgent(
//     `The person wrote: "${thought}"\nGround them in the present moment in 2 sentences.`,
//     'You are a grounding guide.'
//   );

//   onStep(3);

//   const action = await runAgent(
//     `The person wrote: "${thought}"\nGive ONE small practical step.`,
//     'You are an action guide.'
//   );

//   return { heard, truth, ground, action };
// }