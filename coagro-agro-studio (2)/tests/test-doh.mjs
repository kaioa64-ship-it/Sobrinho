import fetch from 'node-fetch';

async function testDoH() {
  try {
    console.log('Testando DNS over HTTPS via Cloudflare...');
    const res = await fetch('https://cloudflare-dns.com/dns-query?name=api-inference.huggingface.co&type=A', {
      headers: { 'accept': 'application/dns-json' }
    });
    const data = await res.json();
    console.log('IPs encontrados:', data.Answer);
  } catch (err) {
    console.error('DoH falhou:', err);
  }
}
testDoH();
