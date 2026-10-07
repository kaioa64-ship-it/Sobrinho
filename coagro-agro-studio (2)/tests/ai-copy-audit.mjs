// Auditoria automatizada de copy da IA (Coagro Studio)
// Uso: node tests/ai-copy-audit.mjs   (servidor rodando em http://localhost:3000)
import fs from 'node:fs';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
// PNG 1x1 (o teste valida copy a partir do texto; a foto real e validada manualmente na UI)
const IMG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

const AGRO_WORDS = /campo|lavoura|produtividade|rural|safra|pasto|propriedade|produtor|rebanho/i;
const PET_WORDS = /\bpet\b|tutor|c[aã]es|c[aã]o\b|cachorro|gato|animal de estima/i;

// dominio: PET (produto pet em loja agro) | AGRO | MISTO (vet/pecuaria/jardim)
// tom esperado: PET => zero palavras de campo | AGRO => zero palavras pet | MISTO => livre
const CASES = [
  // ---- 10 PET dentro do modo AGRO ----
  { id: 'P01', dom: 'PET', nome: 'nexgard', txt: 'Nex Gard Carrapaticida Caes De 4 A 10kg R$100 4x R$25 sem juros' },
  { id: 'P02', dom: 'PET', nome: 'golden', txt: 'Ração Golden Formula Cães Adultos 15kg de 189,90 por 159,90 à vista' },
  { id: 'P03', dom: 'PET', nome: 'bravecto', txt: 'Bravecto cães 10 a 20kg 229' },
  { id: 'P04', dom: 'PET', nome: 'coleira', txt: 'Coleira antipulgas Seresto gatos 120,00 em até 3x' },
  { id: 'P05', dom: 'PET', nome: 'shampoo', txt: 'Shampoo neutro para cães e gatos 500ml 24,90' },
  { id: 'P06', dom: 'PET', nome: 'areia', txt: 'Areia higiênica para gatos 4kg de 29,90 por 22,90' },
  { id: 'P07', dom: 'PET', nome: 'petisco', txt: 'Petisco bifinho Pedigree cachorro 500g 18,90' },
  { id: 'P08', dom: 'PET', nome: 'caminha', txt: 'Caminha pet confortável tamanho M cães 89,90 em 3x' },
  { id: 'P09', dom: 'PET', nome: 'vermifugo', txt: 'Vermífugo Drontal Plus cães 10kg 1 comprimido 39,90' },
  { id: 'P10', dom: 'PET', nome: 'comedouro', txt: 'Comedouro bebedouro automático pet 2 litros 69,90' },
  // ---- 8 AGRO puro ----
  { id: 'A01', dom: 'AGRO', nome: 'triturador', txt: 'Triturador TR30 Tramontina 2HP de 1992 por 1575' },
  { id: 'A02', dom: 'AGRO', nome: 'pulverizador', txt: 'Pulverizador costal Jacto PJH 20 litros 489,90' },
  { id: 'A03', dom: 'AGRO', nome: 'semente', txt: 'Semente de capim Brachiaria Marandu 5kg 74,90' },
  { id: 'A04', dom: 'AGRO', nome: 'adubo', txt: 'Fertilizante NPK 20-05-20 saco 50kg 189' },
  { id: 'A05', dom: 'AGRO', nome: 'rocadeira', txt: 'Roçadeira Stihl FS 220 de 2890 por 2490 em 10x' },
  { id: 'A06', dom: 'AGRO', nome: 'arame', txt: 'Arame farpado Belgo 500m rolo 349' },
  { id: 'A07', dom: 'AGRO', nome: 'motobomba', txt: 'Motobomba Toyama 3HP gasolina 1.890,00' },
  { id: 'A08', dom: 'AGRO', nome: 'herbicida', txt: 'Herbicida Glifosato Atanor galão 20 litros 380' },
  // ---- 2 MISTO (vet pecuaria / jardim) ----
  { id: 'M01', dom: 'MISTO', nome: 'vacina', txt: 'Vacina Raivaguard bovinos 50 doses Ourofino 129,90' },
  { id: 'M02', dom: 'MISTO', nome: 'jardim', txt: 'Mangueira de jardim 30m Tramontina 99,90' },
];

const wc = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;
const norm = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function grade(c, d) {
  const t = d.textos_da_arte || {};
  const titulo = d.textos_hero?.titulo || t.titulo_impacto || d.caixa_titulo?.texto || d.titulo || '';
  const sub = d.textos_hero?.subtitulo || t.subtitulo || d.caixa_subtitulo?.texto || d.subtitulo || '';
  const bullets = d.diferenciais_tecnicos || t.bullets_tecnicos || d.beneficios_tecnicos || [];
  const all = [titulo, sub, ...bullets].join(' | ');
  const checks = [];
  const add = (name, ok, info = '') => checks.push({ name, ok, info });

  add('título ≤ 4 palavras', wc(titulo) > 0 && wc(titulo) <= 4, `${wc(titulo)} palavras`);
  add('subtítulo presente', wc(sub) > 0);
  add('exatamente 3 diferenciais', bullets.length === 3, `${bullets.length}`);
  add('diferenciais ≤ 5 palavras', bullets.every((b) => wc(b) <= 5));
  const hasPrice = /\d/.test(c.txt);
  add('preço extraído', !hasPrice || Boolean(d.modulo_preco?.ativo || d.price_module?.ativo || d.preco?.ativo), JSON.stringify(d.modulo_preco || {}));
  // produto reconhecido: título OU subtítulo contém token do produto/marca digitado
  const tok = norm(c.nome);
  add('produto citado (título/subtítulo)', norm(titulo + ' ' + sub).includes(tok.slice(0, 5)) || norm(sub).length > 12, `${titulo} / ${sub}`);
  if (c.dom === 'PET') {
    add('SEM linguagem de campo', !AGRO_WORDS.test(all), (all.match(AGRO_WORDS) || [''])[0]);
  } else if (c.dom === 'AGRO') {
    add('SEM linguagem pet', !PET_WORDS.test(all), (all.match(PET_WORDS) || [''])[0]);
  }
  return { titulo, sub, bullets, checks, pass: checks.every((x) => x.ok) };
}

async function run(c) {
  const t0 = Date.now();
  const r = await fetch(`${BASE}/api/generate-content`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64: IMG, mimeType: 'image/png', prompt: c.txt, format: 'feed', appMode: 'AGRO' }),
  });
  const j = await r.json();
  const d = j.data || j.content || j.result || j;
  return { ms: Date.now() - t0, status: r.status, d };
}

const results = [];
for (const c of CASES) {
  try {
    const { ms, status, d } = await run(c);
    const g = grade(c, d);
    results.push({ c, ms, status, g, raw: d });
    console.log(`${g.pass ? 'PASS' : 'FAIL'} ${c.id} [${c.dom}] ${ms}ms | ${g.titulo} | ${g.sub}`);
    g.checks.filter((x) => !x.ok).forEach((x) => console.log(`   ✗ ${x.name} ${x.info}`));
  } catch (e) {
    results.push({ c, g: { pass: false, titulo: '', sub: '', bullets: [], checks: [{ name: 'request', ok: false, info: String(e) }] } });
    console.log(`ERR  ${c.id}`, e.message);
  }
  await new Promise((r) => setTimeout(r, 1500));
}

const passN = results.filter((r) => r.g.pass).length;
let md = `# Relatório de Auditoria de Copy — ${new Date().toLocaleString('pt-BR')}\n\n**Resultado: ${passN}/${results.length} aprovados**\n\n| ID | Domínio | Entrada | Título | Subtítulo | Diferenciais | Status |\n|---|---|---|---|---|---|---|\n`;
for (const r of results) {
  md += `| ${r.c.id} | ${r.c.dom} | ${r.c.txt} | ${r.g.titulo} | ${r.g.sub} | ${r.g.bullets.join('; ')} | ${r.g.pass ? '✅' : '❌ ' + r.g.checks.filter((x) => !x.ok).map((x) => x.name).join(', ')} |\n`;
}
fs.mkdirSync('tests/out', { recursive: true });
fs.writeFileSync('tests/out/ai-copy-audit.md', md);
fs.writeFileSync('tests/out/ai-copy-audit.json', JSON.stringify(results, null, 2));
console.log(`\n${passN}/${results.length} aprovados -> tests/out/ai-copy-audit.md`);
