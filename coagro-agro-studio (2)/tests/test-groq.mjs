import 'dotenv/config';
import fs from 'fs';

const apiKey = process.env.GROQ_API_KEY;
const imgBuffer = fs.readFileSync('../img_8475-whsmvarhtw.webp');
const dataUrl = `data:image/webp;base64,${imgBuffer.toString('base64')}`;

async function call(model, withImage) {
  const content = withImage
    ? [
        { type: 'text', text: 'Identifique o produto na imagem. Retorne JSON: {"produto":"","marca":"","categoria":"","diferenciais":["","",""]}' },
        { type: 'image_url', image_url: { url: dataUrl } }
      ]
    : 'Crie um titulo publicitario curto para racao TuttiCanis Premium filhotes 15kg. Retorne JSON: {"titulo":""}';

  const t0 = Date.now();
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content }],
      temperature: 0.2,
      response_format: { type: 'json_object' }
    })
  });
  const data = await res.json();
  const ms = Date.now() - t0;
  if (!res.ok) {
    console.log(`[FALHA] ${model} imagem=${withImage} (${res.status}) ${ms}ms: ${data.error?.message?.slice(0, 160)}`);
  } else {
    console.log(`[OK] ${model} imagem=${withImage} ${ms}ms: ${data.choices[0].message.content.slice(0, 300)}`);
  }
}

await call('qwen/qwen3.8-27b', true);
await call('qwen/qwen3.8-27b', false);
await call('openai/gpt-oss-120b', false);
