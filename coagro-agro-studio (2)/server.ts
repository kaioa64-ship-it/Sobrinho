import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import { ai } from './server/config/gemini.js';
import { generateOptimizedPhotoPrompt, inferAgroBackground } from './server/utils/prompts.js';
import { analyzeAgroDescriptionServer } from './server/services/analyzer.js';
import { generateHeuristicAgroContent } from './server/services/heuristic.js';
import {
  formatBrlWithSymbol,
  formatBrlValue,
  parsePriceToFloat,
  normalizeAgroPrice,
  maskNonPriceSegments,
  extractPaymentConditions,
  extractPriceFromText,
  ExtractedPriceInfo
} from './server/utils/priceParser.js';

dotenv.config();

import { generateRouter } from './server/routes/generate.js';
import { removeBgRouter } from './server/routes/removeBg.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '30mb' }));

app.use('/', generateRouter);
app.use('/', removeBgRouter);

async function startServer() {
  // Tratamento 404 para qualquer rota da API não interceptada acima (antes do fallback do SPA)
  app.use('/api', (req, res) => {
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

