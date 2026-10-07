import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const candidates = [
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.0-flash',
  'gemini-2.0-flash-001',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash-8b',
  'gemini-1.5-pro',
  'gemini-1.5-pro-latest',
  'gemini-3.8-flash',
  'gemini-pro'
];

async function run() {
  for (const m of candidates) {
    try {
      const res = await ai.models.generateContent({
        model: m,
        contents: 'Diga apenas: OK'
      });
      console.log(`[SUCESSO] ${m} -> ${res.text?.trim()}`);
      break;
    } catch (err) {
      const msg = err.message || JSON.stringify(err);
      const code = err.status || (err.error && err.error.code) || 'ERR';
      console.log(`[FALHA] ${m} (${code}): ${msg.slice(0, 100)}`);
    }
  }
}

run();
