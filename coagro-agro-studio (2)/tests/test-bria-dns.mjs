import dns from 'dns';
dns.resolve4('engine.bria-api.com', (err, addresses) => {
  console.log('Bria API IPs:', err || addresses);
});
dns.resolve4('bria.ai', (err, addresses) => {
  console.log('Bria.ai IPs:', err || addresses);
});
