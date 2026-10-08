import { Router } from 'express';

export const removeBgRouter = Router();

removeBgRouter.post('/api/remove-bg', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: 'A imagem em base64 é obrigatória.' });

    // Aceita tanto FAL_KEY (legado) quanto HF_TOKEN
    const apiToken = process.env.HF_TOKEN || process.env.FAL_KEY;
    if (!apiToken) {
      return res.status(500).json({ error: 'Token da API (HF_TOKEN) não configurado no backend.' });
    }

    console.log('Chamando API Hugging Face (RMBG-1.4) para remoção de fundo...');
    
    // Converte o base64 recebido do front para um Buffer binário
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

    let response;
    let retries = 5;
    let waitTime = 5000; // 5 segundos

    while (retries > 0) {
      response = await fetch('https://api-inference.huggingface.co/models/briaai/RMBG-1.4', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/octet-stream',
          'x-wait-for-model': 'true'
        },
        body: buffer
      });

      if (response.status === 503) {
        console.log(`Modelo carregando... Aguardando ${waitTime/1000}s. Tentativas restantes: ${retries - 1}`);
        await new Promise(r => setTimeout(r, waitTime));
        retries--;
      } else {
        break; // Sucesso ou outro erro
      }
    }

    if (!response || !response.ok) {
      const text = await response?.text();
      console.error('Hugging Face error:', response?.status, text);
      return res.status(response?.status || 500).json({ error: 'Falha na API do Hugging Face.' });
    }

    const contentType = response.headers.get('content-type') || '';
    let outBase64 = '';

    if (contentType.includes('application/json')) {
      // Retornou JSON (geralmente [{"label":"foreground","mask":"base64..."}])
      const data = await response.json();
      if (Array.isArray(data) && data[0] && data[0].mask) {
        outBase64 = `data:image/png;base64,${data[0].mask}`;
      } else {
        throw new Error('Formato JSON inesperado do Hugging Face: ' + JSON.stringify(data));
      }
    } else {
      // Retornou a imagem binária diretamente
      const arrayBuffer = await response.arrayBuffer();
      const outBuffer = Buffer.from(arrayBuffer);
      outBase64 = `data:image/png;base64,${outBuffer.toString('base64')}`;
    }

    return res.json({ image: outBase64 });
  } catch (error) {
    console.error('Erro no /api/remove-bg:', error);
    res.status(500).json({ error: 'Erro interno ao processar o recorte na Hugging Face.' });
  }
});
