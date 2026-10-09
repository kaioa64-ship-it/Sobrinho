import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
const DEBUG_PORT = 9222;

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

class CdpSession {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.callbacks = new Map();

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.id;
      const timer = setTimeout(() => {
        this.callbacks.delete(id);
        resolve({ result: { value: null } });
      }, 8000);
      this.callbacks.set(id, {
        resolve: (val) => { clearTimeout(timer); resolve(val); },
        reject: (err) => { clearTimeout(timer); reject(err); }
      });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    return res?.result?.value;
  }

  async captureElement(selector, filename) {
    const box = await this.eval(`(() => {
      const el = document.querySelector('${selector}');
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: Math.max(0, r.x), y: Math.max(0, r.y), width: r.width, height: r.height };
    })()`);

    if (box && box.width > 10 && box.height > 10) {
      const res = await this.send('Page.captureScreenshot', {
        format: 'png',
        clip: {
          x: Math.round(box.x),
          y: Math.round(box.y),
          width: Math.round(box.width),
          height: Math.round(box.height),
          scale: 1
        }
      });
      const buffer = Buffer.from(res.data, 'base64');
      const filePath = path.join(SCREENSHOTS_DIR, filename);
      fs.writeFileSync(filePath, buffer);
      console.log(`🎯 Canvas salvo [${selector}]: ${filename} (${(buffer.length / 1024).toFixed(1)} KB)`);
      return filePath;
    } else {
      const res = await this.send('Page.captureScreenshot', { format: 'png' });
      const buffer = Buffer.from(res.data, 'base64');
      const filePath = path.join(SCREENSHOTS_DIR, filename);
      fs.writeFileSync(filePath, buffer);
      console.log(`📸 Tela cheia salva: ${filename}`);
      return filePath;
    }
  }
}

async function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Cria um SVG de produto simulado (frasco de fertilizante com fundo branco)
function generateMockProductSvg(label = 'NPK 10-10-10') {
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">
    <rect width="400" height="500" fill="%23ffffff" />
    <path d="M140 100 L260 100 L260 140 L140 140 Z" fill="%23d97706" />
    <path d="M120 140 L280 140 L310 440 L90 440 Z" fill="%23059669" rx="20" />
    <rect x="130" y="220" width="140" height="150" fill="%23ffffff" rx="10" />
    <text x="200" y="270" font-family="sans-serif" font-size="20" font-weight="bold" fill="%23047857" text-anchor="middle">COAGRO</text>
    <text x="200" y="310" font-family="sans-serif" font-size="16" font-weight="bold" fill="%231f2937" text-anchor="middle">${label}</text>
    <text x="200" y="340" font-family="sans-serif" font-size="12" fill="%234b5563" text-anchor="middle">5 Litros</text>
  </svg>`;
}

async function run() {
  console.log('🚀 Iniciando Chrome Headless para Bateria Visual com Produtos...');
  const tempDir = path.join(__dirname, 'temp-profile');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${tempDir}`,
    '--window-size=1440,900',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    'http://localhost:3000'
  ], { stdio: 'ignore' });

  let version = null;
  for (let i = 0; i < 30; i++) {
    try {
      version = await getJson(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
      break;
    } catch {
      await wait(300);
    }
  }

  if (!version) {
    chromeProc.kill();
    throw new Error('Falha ao conectar à porta CDP do Chrome.');
  }

  const targets = await getJson(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
  const pageTarget = targets.find(t => t.type === 'page') || targets[0];
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  const cdp = new CdpSession(ws);
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');

  console.log('⏳ Carregando Coagro Studio...');
  await wait(3000);

  const mockAgroImg = generateMockProductSvg('FERTILIZANTE NPK');
  const mockPetImg = generateMockProductSvg('RAÇÃO GOLDEN 15KG');

  // --- BATERIA A: AGRO COM PRODUTO RECORTADO ---
  console.log('\n--- TESTE 1: AGRO - Fundo Escuro com Produto Recortado ---');
  await cdp.eval(`(() => {
    // Modo Agro no Header
    const hBtns = Array.from(document.querySelectorAll('header button'));
    if (hBtns[0]) hBtns[0].click();

    // Injeta imagem do produto
    const imgData = "${mockAgroImg.replace(/"/g, '\\"')}";
    const event = new CustomEvent('setProductImageManual', { detail: imgData });
    window.dispatchEvent(event);

    // Preenche campos via DOM
    const inputs = Array.from(document.querySelectorAll('input[type="text"]'));
    const titInput = inputs.find(i => i.value?.includes('Golden') || i.parentElement?.textContent?.includes('Título'));
    if (titInput) {
      titInput.value = 'Fertilizante Mineral NPK';
      titInput.dispatchEvent(new Event('input', { bubbles: true }));
      titInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    const subInput = inputs.find(i => i.parentElement?.textContent?.includes('Subtítulo') || i.placeholder?.includes('oferta'));
    if (subInput) {
      subInput.value = 'Alta performance e produtividade';
      subInput.dispatchEvent(new Event('input', { bubbles: true }));
      subInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
  })()`);
  await wait(1500);
  await cdp.captureElement('#artwork-canvas-container', '10_agro_feed_com_produto_escuro.png');

  // --- BATERIA B: AGRO COM TEMA CLEAN-BRANCO ---
  console.log('\n--- TESTE 2: AGRO - Fundo Claro clean-branco ---');
  await cdp.eval(`(() => {
    const allBtns = Array.from(document.querySelectorAll('button'));
    const btnBranco = allBtns.find(b => b.textContent?.includes('clean-branco') || b.textContent?.includes('Branco') || b.title?.includes('clean-branco'));
    if (btnBranco) btnBranco.click();
  })()`);
  await wait(1500);
  await cdp.captureElement('#artwork-canvas-container', '11_agro_feed_com_produto_clean_branco.png');

  // --- BATERIA C: AGRO COM FUNDO ORIGINAL PRESERVADO ---
  console.log('\n--- TESTE 3: AGRO - Manter Fundo Original da Foto ---');
  await cdp.eval(`(() => {
    const chk = document.querySelector('input[type="checkbox"]');
    if (chk && !chk.checked) chk.click();
  })()`);
  await wait(1500);
  await cdp.captureElement('#artwork-canvas-container', '12_agro_feed_fundo_original.png');

  // --- BATERIA D: ALTERNAR A QUENTE PARA PET ---
  console.log('\n--- TESTE 4: Alternância Instantânea para PET ---');
  await cdp.eval(`(() => {
    const hBtns = Array.from(document.querySelectorAll('header button'));
    if (hBtns[1]) hBtns[1].click(); // Clica em PET
  })()`);
  await wait(1800);
  await cdp.captureElement('#artwork-canvas-container', '13_pet_feed_alternado_mesmo_conteudo.png');

  // --- BATERIA E: PET COM PRODUTO PET DEDICADO ---
  console.log('\n--- TESTE 5: PET - Produto Pet Dedicado ---');
  await cdp.eval(`(() => {
    const inputs = Array.from(document.querySelectorAll('input[type="text"]'));
    const titInput = inputs.find(i => i.parentElement?.textContent?.includes('Título'));
    if (titInput) {
      titInput.value = 'Ração Premium Adulto 15kg';
      titInput.dispatchEvent(new Event('input', { bubbles: true }));
      titInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
  })()`);
  await wait(1500);
  await cdp.captureElement('#artwork-canvas-container', '14_pet_feed_produto_pet.png');

  console.log('\n✅ Bateria de testes visuais concluída!');
  ws.close();
  chromeProc.kill();
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Falha:', err);
  process.exit(1);
});
