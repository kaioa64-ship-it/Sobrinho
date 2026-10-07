import 'dotenv/config';
import fs from 'fs';

async function testHfRouter() {
  const token = process.env.HF_TOKEN;
  console.log('Testando router.huggingface.co...');

  // 1. Testar Bria RMBG 1.4
  try {
    const imgBuffer = fs.readFileSync('../img_8475-whsmvarhtw.webp');
    console.log('1. Testando remoção de fundo com RMBG-1.4 no router...');
    const resBg = await fetch('https://router.huggingface.co/hf-inference/models/briaai/RMBG-1.4', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/octet-stream',
        'x-wait-for-model': 'true'
      },
      body: imgBuffer
    });

    console.log('Status RMBG:', resBg.status);
    if (resBg.ok) {
      const arrayBuf = await resBg.arrayBuffer();
      console.log('SUCESSO RMBG! Bytes recebidos:', arrayBuf.byteLength);
    } else {
      console.log('Erro RMBG:', await resBg.text());
    }
  } catch (err) {
    console.error('Falha RMBG:', err);
  }

  // 2. Testar Qwen-VL para visão
  try {
    console.log('\n2. Testando Qwen-VL no router...');
    const imgBuffer = fs.readFileSync('../img_8475-whsmvarhtw.webp');
    const base64Data = imgBuffer.toString('base64');
    const dataUrl = `data:image/webp;base64,${base64Data}`;

    const resQwen = await fetch('https://router.huggingface.co/hf-inference/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'Qwen/Qwen2.5-VL-7B-Instruct',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Identifique o produto nesta imagem e descreva em 1 frase.' },
              { type: 'image_url', image_url: { url: dataUrl } }
            ]
          }
        ],
        max_tokens: 200
      })
    });

    console.log('Status Qwen-VL:', resQwen.status);
    const qwenText = await resQwen.text();
    console.log('Resposta Qwen-VL:', qwenText);
  } catch (err) {
    console.error('Falha Qwen-VL:', err);
  }
}

testHfRouter();
