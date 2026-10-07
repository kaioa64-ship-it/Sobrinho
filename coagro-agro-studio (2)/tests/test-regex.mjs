import fs from 'fs';

const serverCode = fs.readFileSync('server.ts', 'utf8');

// Quick and dirty extraction of the functions.
// We can just execute the whole file minus the express routes and imports.
// Wait, easier to just compile and run it but mock the routes? 
// No, the easiest is to just write a regex that matches "4x R$25 sem juros".

const testCases = [
  "4x R$25 sem juros",
  "10x de R$ 175,00",
  "em até 10x sem juros",
  "em 6x no cartão",
  "4x R$ 25",
  "10x 175"
];

for (const t of testCases) {
  const match = t.match(/(?:em\s+)?(?:at[ée]\s+)?(\d+\s*x)(?:\s+de\s+|\s+)(?:r\$)?\s*([\d]+(?:[.,]\d{1,2})?)/i);
  console.log("TEXT:", t);
  if (match) {
    console.log(" -> MATCHED:", match[1], "value:", match[2]);
  } else {
    console.log(" -> NO MATCH");
  }
}
