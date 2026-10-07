import dns from 'dns';
dns.resolve4('fal.run', (err, addresses) => {
  console.log('fal.run IPs:', err || addresses);
});
