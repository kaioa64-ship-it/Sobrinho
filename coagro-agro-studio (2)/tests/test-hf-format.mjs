import dotenv from 'dotenv';
dotenv.config();

async function test() {
  const token = process.env.HF_TOKEN;
  if (!token) return console.error("No token");
  
  // 1x1 transparent png
  const imgBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
  const buffer = Buffer.from(imgBase64, 'base64');
  
  const res = await fetch('https://api-inference.huggingface.co/models/briaai/RMBG-1.4', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: buffer
  });
  
  const contentType = res.headers.get('content-type');
  console.log('Status:', res.status);
  console.log('Content-Type:', contentType);
  
  if (contentType && contentType.includes('application/json')) {
    const data = await res.json();
    console.log('JSON Output:', data);
  } else {
    const buf = await res.arrayBuffer();
    console.log('Buffer length:', buf.byteLength);
  }
}

test();
