import dns from 'dns';
import fetch from 'node-fetch'; // if available, or just global fetch

dns.setServers(['8.8.8.8', '1.1.1.1']);

async function testDNS() {
  console.log("Resolving with 8.8.8.8...");
  dns.resolve4('api-inference.huggingface.co', (err, addresses) => {
    if (err) {
      console.error('Ainda deu erro de DNS mesmo com 8.8.8.8:', err);
    } else {
      console.log('Resolvido! IPs:', addresses);
    }
  });
}
testDNS();
