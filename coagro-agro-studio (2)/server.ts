import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

import { generateRouter } from './server/routes/generate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '30mb' }));

app.use('/', generateRouter);

// NOTA: a rota POST /api/remove-bg (Hugging Face / RMBG-1.4) foi REMOVIDA.
// O recorte de fundo é feito 100% no cliente (Web Worker + Canvas em
// src/lib/imageTransparency.ts), com fallback local por chroma-key.
// Manter o endpoint era código morto e induzia à falsa ideia de que HF_TOKEN
// é pré-requisito da aplicação. Ver CORRECOES_REALIZADAS.md.

async function startServer() {
  // 404 JSON para qualquer rota da API não interceptada acima (antes do fallback do SPA)
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Rota da API não encontrada ou removida.' });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Coagro Agro Studio running on port ${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
