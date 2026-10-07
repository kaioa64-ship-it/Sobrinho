import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

async function testHuggingFace() {
  const token = process.env.HF_TOKEN || process.env.FAL_KEY;
  if (!token) {
    console.error('Sem HF_TOKEN no .env');
    process.exit(1);
  }

  console.log('Testando conexão com Hugging Face (api-inference.huggingface.co)...');
  
  try {
    const res = await fetch('https://api-inference.huggingface.co/status');
    console.log('Status de conexão GET:', res.status, res.statusText);
  } catch (err) {
    console.error('ERRO CRÍTICO DE CONEXÃO (DNS ou Rede):', err.message);
    if (err.cause) console.error('Causa exata:', err.cause);
    console.log('\n--- CONCLUSÃO ---');
    console.log('O Node.js nesta máquina não consegue enxergar a Hugging Face (ENOTFOUND).');
    process.exit(1);
  }

  console.log('Conexão bem sucedida. O DNS está funcionando!');
}

testHuggingFace();
