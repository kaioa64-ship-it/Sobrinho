import fs from 'fs';

async function testPollinationsVision() {
  try {
    const imgBuffer = fs.readFileSync('../img_8475-whsmvarhtw.webp');
    const base64Data = imgBuffer.toString('base64');
    const dataUrl = `data:image/webp;base64,${base64Data}`;

    console.log('Testando Pollinations com visão...');
    const res = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Identifique o produto nesta imagem e retorne apenas o nome exato e marca.' },
              { type: 'image_url', image_url: { url: dataUrl } }
            ]
          }
        ],
        model: 'openai',
        jsonMode: false
      })
    });

    const text = await res.text();
    console.log('Status Pollinations:', res.status);
    console.log('Resposta Pollinations:', text);
  } catch (err) {
    console.error('Erro Pollinations:', err);
  }
}

testPollinationsVision();
