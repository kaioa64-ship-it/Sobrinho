import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

async function testHF() {
  const token = process.env.HF_TOKEN;
  if (!token) {
    console.log('HF_TOKEN missing in .env');
    return;
  }
  
  try {
    const imgPath = 'c:\\src\\Documents\\Programas e testes\\subrinho\\img_8475-whsmvarhtw.webp';
    const buffer = fs.readFileSync(imgPath);
    
    console.log('Sending request to Hugging Face API...');
    const response = await fetch('https://api-inference.huggingface.co/models/briaai/RMBG-1.4', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/octet-stream'
      },
      body: buffer
    });
    
    if (!response.ok) {
      const text = await response.text();
      console.error('API Error:', response.status, text);
    } else {
      console.log('Success! Received:', response.headers.get('content-type'));
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testHF();
