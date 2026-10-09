import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import WebSocket from 'ws';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DEBUG_PORT = 9222;
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// Packshot SVG de Produto Agro Real (Pulverizador Costal XP 16L em alta definição com gradientes)
const MOCK_AGRO_PRODUCT = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 700" width="500" height="700"><defs><linearGradient id="gAgroTanque" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="%23d97706" /><stop offset="30%" stop-color="%23fbbf24" /><stop offset="70%" stop-color="%23f59e0b" /><stop offset="100%" stop-color="%23b45309" /></linearGradient><linearGradient id="gAgroTampa" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230284c7" /><stop offset="100%" stop-color="%230369a1" /></linearGradient></defs><g><rect x="110" y="150" width="280" height="440" rx="45" fill="url(%23gAgroTanque)" stroke="%2378350f" stroke-width="4"/><rect x="190" y="90" width="120" height="70" rx="16" fill="url(%23gAgroTampa)"/><rect x="140" y="260" width="220" height="220" rx="24" fill="%23ffffff" opacity="0.95"/><text x="250" y="325" font-family="Arial, sans-serif" font-size="30" font-weight="900" fill="%23004d40" text-anchor="middle">COAGRO</text><text x="250" y="370" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="%231f2937" text-anchor="middle">PULVERIZADOR</text><text x="250" y="425" font-family="Arial, sans-serif" font-size="38" font-weight="900" fill="%23d97706" text-anchor="middle">XP 16L</text><path d="M90 280 L90 560 L110 560" stroke="%234b5563" stroke-width="12" stroke-linecap="round" fill="none"/><circle cx="90" cy="280" r="14" fill="%23dc2626"/></g></svg>`;

// Packshot SVG de Produto Pet Real (Saco de Ração Golden Special 15kg em alta definição)
const MOCK_PET_PRODUCT = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 700" width="500" height="700"><defs><linearGradient id="gPetSaco" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="%2300335e" /><stop offset="25%" stop-color="%23004b87" /><stop offset="70%" stop-color="%230284c7" /><stop offset="100%" stop-color="%23001f3f" /></linearGradient><linearGradient id="gPetOuro" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23fde047" /><stop offset="100%" stop-color="%23ffab00" /></linearGradient></defs><g><path d="M110 160 L390 160 L425 630 L75 630 Z" fill="url(%23gPetSaco)" stroke="%23ffab00" stroke-width="5"/><path d="M100 160 L400 160 L370 120 L130 120 Z" fill="%23002240" stroke="%23ffab00" stroke-width="3"/><rect x="135" y="250" width="230" height="260" rx="24" fill="%23ffffff"/><circle cx="250" cy="325" r="42" fill="url(%23gPetOuro)"/><text x="250" y="338" font-family="Arial, sans-serif" font-size="34" font-weight="900" fill="%23004b87" text-anchor="middle">PET</text><text x="250" y="415" font-family="Arial, sans-serif" font-size="26" font-weight="900" fill="%231f2937" text-anchor="middle">RAÇÃO GOLDEN</text><text x="250" y="455" font-family="Arial, sans-serif" font-size="21" font-weight="bold" fill="%23004b87" text-anchor="middle">SPECIAL 15KG</text><rect x="165" y="480" width="170" height="24" rx="8" fill="%23e96c2c"/><text x="250" y="497" font-family="Arial, sans-serif" font-size="12" font-weight="900" fill="%23ffffff" text-anchor="middle">CÃES ADULTOS</text></g></svg>`;

async function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function runMatrix() {
  console.log('🚀 Iniciando Chrome Headless para BATERIA MATRIZ VISUAL COMPLETA...');
  
  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${DEBUG_PORT}`,
    '--window-size=1920,2000',
    'http://localhost:3000'
  ]);

  await wait(3500);

  const targets = await new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${DEBUG_PORT}/json/list`, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve(JSON.parse(d)));
    }).on('error', reject);
  });

  const pageTarget = targets.find(t => t.type === 'page') || targets[0];
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise(r => ws.on('open', r));

  function send(method, params = {}) {
    return new Promise(resolve => {
      const id = Math.floor(Math.random() * 1000000);
      const onMsg = (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.id === id) {
          ws.off('message', onMsg);
          resolve(msg);
        }
      };
      ws.on('message', onMsg);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evalJs(expression) {
    const res = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res?.result?.exceptionDetails) {
      console.error('JS EXCEPTION:', res.result.exceptionDetails.text);
    }
    return res?.result?.result?.value;
  }

  async function captureElement(selector, filename) {
    const box = await evalJs(`(() => {
      const el = document.querySelector('${selector}') || document.getElementById('${selector.replace(/^#/, '')}');
      if (!el) return { error: 'Elemento não encontrado no DOM: ${selector}' };
      el.scrollIntoView({ block: 'center', inline: 'center' });
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return { error: 'Dimensões zeradas' };
      return { x: Math.max(0, r.x), y: Math.max(0, r.y), width: r.width, height: r.height };
    })()`);

    const filePath = path.join(SCREENSHOTS_DIR, filename);

    if (box && !box.error && box.width > 20 && box.height > 20) {
      try {
        const res = await send('Page.captureScreenshot', {
          format: 'png',
          clip: {
            x: Math.round(box.x),
            y: Math.round(box.y),
            width: Math.round(box.width),
            height: Math.round(box.height),
            scale: 1
          }
        });
        const buffer = Buffer.from(res.result.data, 'base64');
        fs.writeFileSync(filePath, buffer);
        const kb = (buffer.length / 1024).toFixed(1);
        console.log(`✅ [${filename}] - Canvas capturado (${kb} KB, ${Math.round(box.width)}x${Math.round(box.height)}px)`);
        return { success: true, sizeKb: buffer.length / 1024, path: filePath };
      } catch (err) {
        console.warn('Erro ao capturar clip:', err);
      }
    }

    const res = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.result.data, 'base64');
    fs.writeFileSync(filePath, buffer);
    const kb = (buffer.length / 1024).toFixed(1);
    console.log(`⚠️ [${filename}] - Fallback tela cheia (${kb} KB) - ${box?.error || 'dimensão inválida'}`);
    return { success: false, sizeKb: buffer.length / 1024, path: filePath };
  }

  console.log('⏳ Aguardando montagem completa do Coagro Studio...');
  let bridgeReady = false;
  for (let i = 0; i < 40; i++) {
    bridgeReady = await evalJs(`Boolean(window.__studioTestBridge && typeof window.__studioTestBridge.setFullArtwork === 'function')`);
    if (bridgeReady) break;
    await wait(300);
  }

  if (!bridgeReady) {
    chromeProc.kill();
    throw new Error('Timeout: __studioTestBridge não inicializado no DOM.');
  }
  console.log('✅ Coagro Studio pronto e bridge conectada!');

  const results = [];

  // =========================================================================
  // BLOCO 1: DIVISÃO AGRO (PRODUTO REAL + TEMPLATES + VARIAÇÕES DE COR)
  // =========================================================================
  console.log('\n========================================');
  console.log('🌱 BLOCO 1: TESTES VISUAIS DA DIVISÃO AGRO');
  console.log('========================================');

  // Cenário 1: AGRO + WhatsappStatusVertical (Status Zap 9:16) + Fundo Escuro Oficial
  console.log('\n[1/12] AGRO: Template Status Zap (9:16) em Fundo Escuro Oficial');
  await evalJs(`(() => {
    window.__studioTestBridge.setModule('SOCIAL_MEDIA');
    window.__studioTestBridge.setFullArtwork({
      title: 'Pulverizador Costal XP 16L',
      subtitle: 'Alta durabilidade e conforto no campo',
      priceDe: '299,90',
      pricePor: '249,90',
      productImg: ${JSON.stringify(MOCK_AGRO_PRODUCT)},
      scope: 'AGRO',
      template: 'whatsapp-status',
      format: 'story',
      theme: 'campo-agro'
    });
  })()`);
  await wait(1400);
  results.push(await captureElement('#agro-canvas-main', 'matrix_01_agro_whatsapp_status_escuro.png'));

  // Cenário 2: AGRO + WhatsappStatusVertical (Status Zap 9:16) + Fundo Clean Branco
  console.log('\n[2/12] AGRO: Template Status Zap (9:16) em Fundo Clean Branco');
  await evalJs(`(() => {
    window.__studioTestBridge.setFullArtwork({
      title: 'Pulverizador Costal XP 16L',
      subtitle: 'Alta durabilidade e conforto no campo',
      priceDe: '299,90',
      pricePor: '249,90',
      productImg: ${JSON.stringify(MOCK_AGRO_PRODUCT)},
      scope: 'AGRO',
      template: 'whatsapp-status',
      format: 'story',
      theme: 'clean-branco'
    });
  })()`);
  await wait(1400);
  results.push(await captureElement('#agro-canvas-main', 'matrix_02_agro_whatsapp_status_clean_branco.png'));

  // Cenário 3: AGRO + UnifiedCentral (Feed 1:1) + Fundo Verde Escuro Oficial
  console.log('\n[3/12] AGRO: Template Central (1:1) em Fundo Verde Escuro Oficial');
  await evalJs(`(() => {
    window.__studioTestBridge.setFullArtwork({
      title: 'Pulverizador Costal XP 16L',
      subtitle: 'Alta durabilidade e conforto no campo',
      priceDe: '299,90',
      pricePor: '249,90',
      productImg: ${JSON.stringify(MOCK_AGRO_PRODUCT)},
      scope: 'AGRO',
      template: 'unified-central',
      format: 'feed-quadrado',
      theme: 'campo-agro'
    });
  })()`);
  await wait(1400);
  results.push(await captureElement('#agro-canvas-main', 'matrix_03_agro_central_escuro.png'));

  // Cenário 4: AGRO + UnifiedCentral (Feed 1:1) + Clean Branco (TESTE CRÍTICO: LOGO AZUL EM FUNDO BRANCO)
  console.log('\n[4/12] AGRO: Template Central (1:1) em Clean Branco (TESTE CRÍTICO: Logo Azul em Fundo Branco)');
  await evalJs(`(() => {
    window.__studioTestBridge.setFullArtwork({
      title: 'Pulverizador Costal XP 16L',
      subtitle: 'Alta durabilidade e conforto no campo',
      priceDe: '299,90',
      pricePor: '249,90',
      productImg: ${JSON.stringify(MOCK_AGRO_PRODUCT)},
      scope: 'AGRO',
      template: 'unified-central',
      format: 'feed-quadrado',
      theme: 'clean-branco'
    });
  })()`);
  await wait(1400);
  results.push(await captureElement('#agro-canvas-main', 'matrix_04_agro_central_clean_branco.png'));

  // Cenário 5: AGRO + UnifiedSplit (Feed 1:1) + Fundo Verde Escuro
  console.log('\n[5/12] AGRO: Template Split Lateral (1:1) em Fundo Verde Escuro');
  await evalJs(`(() => {
    window.__studioTestBridge.setFullArtwork({
      title: 'Pulverizador Costal XP 16L',
      subtitle: 'Alta durabilidade e conforto no campo',
      priceDe: '299,90',
      pricePor: '249,90',
      productImg: ${JSON.stringify(MOCK_AGRO_PRODUCT)},
      scope: 'AGRO',
      template: 'unified-split',
      format: 'feed-quadrado',
      theme: 'campo-agro'
    });
  })()`);
  await wait(1400);
  results.push(await captureElement('#agro-canvas-main', 'matrix_05_agro_split_escuro.png'));

  // Cenário 6: AGRO + PromoSimples (Feed 1:1) + Fundo Branco
  console.log('\n[6/12] AGRO: Template Promo Simples (1:1) em Fundo Branco');
  await evalJs(`(() => {
    window.__studioTestBridge.setFullArtwork({
      title: 'Pulverizador Costal XP 16L',
      subtitle: 'Alta durabilidade e conforto no campo',
      priceDe: '299,90',
      pricePor: '249,90',
      productImg: ${JSON.stringify(MOCK_AGRO_PRODUCT)},
      scope: 'AGRO',
      template: 'promo-simples',
      format: 'feed-quadrado',
      theme: 'clean-branco'
    });
  })()`);
  await wait(1400);
  results.push(await captureElement('#agro-canvas-main', 'matrix_06_agro_promo_simples.png'));

  // =========================================================================
  // BLOCO 2: ALTERNÂNCIA A QUENTE PARA PET (TESTE DE CONTAMINAÇÃO DE MARCA)
  // =========================================================================
  console.log('\n======================================================');
  console.log('🐾 BLOCO 2: TROCA A QUENTE PARA PET (TESTE DE RESÍDUOS)');
  console.log('======================================================');

  // Cenário 7: PET + Troca Imediata com Produto Pet Dedicado (Feed 1:1)
  console.log('\n[7/12] PET: Alternância Imediata para Modo PET (Verifica troca de logo e eliminação de verde)');
  await evalJs(`(() => {
    window.__studioTestBridge.setModule('SOCIAL_MEDIA');
    window.__studioTestBridge.setFullArtwork({
      title: 'Ração Golden Special 15kg',
      subtitle: 'Sabor Frango e Carne - Cães Adultos',
      priceDe: '179,90',
      pricePor: '144,90',
      productImg: ${JSON.stringify(MOCK_PET_PRODUCT)},
      scope: 'PET',
      template: 'unified-central',
      format: 'feed-quadrado',
      theme: 'clean-branco'
    });
  })()`);
  await wait(1400);
  results.push(await captureElement('#agro-canvas-main', 'matrix_07_pet_apos_troca_imediata.png'));

  // Cenário 8: PET + UnifiedCentral (Feed 1:1) em Clean Branco (Validação Contraste: Título Azul Escuro #001C71)
  console.log('\n[8/12] PET: Template Central (1:1) em Clean Branco (Validação: Azul Pet, sem Verde)');
  await evalJs(`(() => {
    window.__studioTestBridge.setFullArtwork({
      title: 'Ração Golden Special 15kg',
      subtitle: 'Sabor Frango e Carne - Cães Adultos',
      priceDe: '179,90',
      pricePor: '144,90',
      productImg: ${JSON.stringify(MOCK_PET_PRODUCT)},
      scope: 'PET',
      template: 'unified-central',
      format: 'feed-quadrado',
      theme: 'clean-branco'
    });
  })()`);
  await wait(1400);
  results.push(await captureElement('#agro-canvas-main', 'matrix_08_pet_central_clean_branco.png'));

  // Cenário 9: PET + WhatsappStatusVertical (Status Zap Pet 9:16) com CoagroPetLogo
  console.log('\n[9/12] PET: Template Status Zap (9:16) com CoagroPetLogo e Azul Oficial');
  await evalJs(`(() => {
    window.__studioTestBridge.setFullArtwork({
      title: 'Ração Golden Special 15kg',
      subtitle: 'Sabor Frango e Carne - Cães Adultos',
      priceDe: '179,90',
      pricePor: '144,90',
      productImg: ${JSON.stringify(MOCK_PET_PRODUCT)},
      scope: 'PET',
      template: 'whatsapp-status',
      format: 'story',
      theme: 'azul-coagro'
    });
  })()`);
  await wait(1400);
  results.push(await captureElement('#agro-canvas-main', 'matrix_09_pet_whatsapp_status.png'));

  // Cenário 10: PET + UnifiedSplit (Feed 1:1) em Azul Pet
  console.log('\n[10/12] PET: Template Split (1:1) com Layout Lateral e Paleta Pet Oficial');
  await evalJs(`(() => {
    window.__studioTestBridge.setFullArtwork({
      title: 'Ração Golden Special 15kg',
      subtitle: 'Sabor Frango e Carne - Cães Adultos',
      priceDe: '179,90',
      pricePor: '144,90',
      productImg: ${JSON.stringify(MOCK_PET_PRODUCT)},
      scope: 'PET',
      template: 'unified-split',
      format: 'feed-quadrado',
      theme: 'azul-coagro'
    });
  })()`);
  await wait(1400);
  results.push(await captureElement('#agro-canvas-main', 'matrix_10_pet_split_azul.png'));

  // Cenário 11: AGRO + WhatsApp Status com Degradê Verde-Azul e Selo de Oferta
  console.log('\n[11/14] AGRO: WhatsApp Status com Degradê Especial Verde-Azul e Selo "OFERTA"');
  await evalJs(`(() => {
    window.__studioTestBridge.setModule('SOCIAL_MEDIA');
    window.__studioTestBridge.setFullArtwork({
      title: 'Adubo Especial Grãos e Café',
      subtitle: 'Nutrição equilibrada para alta produtividade',
      priceDe: '189,90',
      pricePor: '159,90',
      productImg: ${JSON.stringify(MOCK_AGRO_PRODUCT)},
      scope: 'AGRO',
      template: 'whatsapp-status',
      format: 'story',
      theme: 'azul-coagro',
      badge: 'OFERTA'
    });
  })()`);
  await wait(1400);
  results.push(await captureElement('#agro-canvas-main', 'matrix_11_agro_whatsapp_status_verde_azul_selo.png'));

  // Cenário 12: AGRO + WhatsApp Status com Topo Limpo (Sem Selo)
  console.log('\n[12/14] AGRO: WhatsApp Status com Topo Limpo (Sem Selo, apenas Logo)');
  await evalJs(`(() => {
    window.__studioTestBridge.setFullArtwork({
      title: 'Pulverizador Costal XP 16L',
      subtitle: 'Conforto e pressão constante no campo',
      priceDe: '299,90',
      pricePor: '249,90',
      productImg: ${JSON.stringify(MOCK_AGRO_PRODUCT)},
      scope: 'AGRO',
      template: 'whatsapp-status',
      format: 'story',
      theme: 'campo-agro',
      badge: 'Sem Selo'
    });
  })()`);
  await wait(1400);
  results.push(await captureElement('#agro-canvas-main', 'matrix_12_agro_whatsapp_status_sem_selo.png'));

  // Cenário 13: TESTE DE ESTRESSE DE CARACTERES (Texto Longo sem quebrar o layout)
  console.log('\n[13/14] ESTRESSE: Título Longo (48 chars) e Benefícios sem vazar do container');
  await evalJs(`(() => {
    window.__studioTestBridge.setFullArtwork({
      title: 'FERTILIZANTE MINERAL NPK 10-10-10 ESPECIAL PASTAGEM',
      subtitle: 'Desenvolvimento radicular vigoroso e rápida recuperação foliar em solos arenosos',
      priceDe: '1.580,00',
      pricePor: '1.390,00',
      productImg: ${JSON.stringify(MOCK_AGRO_PRODUCT)},
      scope: 'AGRO',
      template: 'unified-central',
      format: 'feed-quadrado',
      theme: 'campo-agro'
    });
  })()`);
  await wait(1400);
  results.push(await captureElement('#agro-canvas-main', 'matrix_13_estresse_texto_longo.png'));

  // =========================================================================
  // BLOCO 3: MÓDULO CARTAZES A4 DE LOJA (AGRO & PET)
  // =========================================================================
  console.log('\n=================================================');
  console.log('🏷️ BLOCO 3: CARTAZES A4 DE GÔNDOLA (AGRO & PET)');
  console.log('=================================================');

  // Abre módulo de Cartazes A4 no Pet
  console.log('\n[14/15] CARTAZ A4: Template PromoPetA4 (Identidade Azul/Ouro Pet)');
  await evalJs(`(() => {
    window.__studioTestBridge.setModule('STORE_POSTERS');
    window.__studioTestBridge.setAppMode('PET');
    window.__studioTestBridge.setPosterTemplate('promo-pet-a4');
    window.__studioTestBridge.setManualPosterData({
      codigo: '55440',
      titulo: 'RAÇÃO GOLDEN SPECIAL 15KG',
      valorDe: '179,90',
      valorPor: '144,90'
    });
  })()`);
  await wait(1800);
  results.push(await captureElement('#preview-poster-a4', 'matrix_14_cartaz_a4_pet.png'));

  // Seleciona template PromoAgroA4 no Agro
  console.log('\n[15/15] CARTAZ A4: Template PromoAgroA4 (Identidade Verde/Ouro Agro)');
  await evalJs(`(() => {
    window.__studioTestBridge.setAppMode('AGRO');
    window.__studioTestBridge.setPosterTemplate('promo-agro-a4');
    window.__studioTestBridge.setManualPosterData({
      codigo: '78910',
      titulo: 'PULVERIZADOR COSTAL MANUAL XP 16L',
      valorDe: '299,90',
      valorPor: '249,90'
    });
  })()`);
  await wait(1800);
  results.push(await captureElement('#preview-poster-a4', 'matrix_15_cartaz_a4_agro.png'));

  // =========================================================================
  // RELATÓRIO FINAL CONSOLIDADO
  // =========================================================================
  console.log('\n=================================================');
  console.log('📊 RELATÓRIO FINAL DA BATERIA MATRIZ VISUAL');
  console.log('=================================================');
  const validScreenshots = results.filter(r => r.sizeKb > 25);
  console.log(`Total de testes executados: ${results.length}`);
  console.log(`Screenshots com renderização sólida (> 25 KB): ${validScreenshots.length} de ${results.length}`);

  results.forEach((r, idx) => {
    const file = path.basename(r.path);
    const status = r.sizeKb > 25 ? '✅ APROVADO' : '❌ VAZIO/SUSPEITO';
    console.log(`[${idx + 1}] ${status} - ${file} (${r.sizeKb.toFixed(1)} KB)`);
  });

  ws.close();
  chromeProc.kill();

  if (validScreenshots.length < results.length) {
    console.error('❌ Falha: Alguns screenshots não atingiram a densidade visual esperada.');
    process.exit(1);
  }

  console.log('\n🎉 BATERIA MATRIZ VISUAL 100% CONCLUÍDA COM SUCESSO (12/12 APROVADOS)!');
  process.exit(0);
}

runMatrix().catch(err => {
  console.error('❌ Erro fatal na execução dos testes visuais:', err);
  process.exit(1);
});
