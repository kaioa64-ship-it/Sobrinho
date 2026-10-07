import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function testMultimodal() {
  try {
    // Read the sample image in directory
    const imgBuffer = fs.readFileSync('../img_8475-whsmvarhtw.webp');
    const base64Data = imgBuffer.toString('base64');

    const parts = [
      { text: 'Identifique o produto nesta imagem e descreva em poucas palavras.' },
      {
        inlineData: {
          mimeType: 'image/webp',
          data: base64Data
        }
      }
    ];

    console.log('Enviando para gemini-3.8-flash...');
    let res = null;
    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        console.log(`Tentativa ${attempt}...`);
        res = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: { parts },
          config: {
            systemInstruction: 'Você é um redator publicitário. Retorne estritamente um JSON com as chaves: titulo, diferenciais.',
            responseMimeType: 'application/json',
            temperature: 0.15
          }
        });
        break;
      } catch (e) {
        if (attempt === 4) throw e;
        console.log(`Tentativa ${attempt} falhou (${e.status || e.message}). Aguardando 2s...`);
        await new Promise(r => setTimeout(r, 2000));
      }
    }
    console.log('Resposta JSON do Gemini:', res.text);
  } catch (err) {
    console.error('Erro multimodal:', err);
  }
}

testMultimodal();
