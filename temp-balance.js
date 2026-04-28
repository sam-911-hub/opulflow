const fs = require('fs');
const src = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8').split('\n');
const startLine = src.findIndex(line => line.includes('return ('));
let balance = 0;
for (let i = startLine; i < src.length; i++) {
  const line = src[i];
  const opens = (line.match(/<div\b/g) || []).length;
  const closes = (line.match(/<\/div>/g) || []).length;
  balance += opens - closes;
  if (opens || closes) {
    console.log(i + 1, 'opens', opens, 'closes', closes, 'balance', balance, line.trim().slice(0, 120));
  }
}
console.log('final balance', balance);
