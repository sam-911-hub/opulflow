const fs = require('fs');
const src = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8').split('\n');
const startLine = src.findIndex(line => line.includes('return ('));
const lines = src.slice(startLine);
const openDivs = lines.reduce((count, line) => count + (line.match(/<div\b/g) || []).length, 0);
const closeDivs = lines.reduce((count, line) => count + (line.match(/<\/div>/g) || []).length, 0);
const openFragments = lines.reduce((count, line) => count + (line.match(/<>/g) || []).length, 0);
const closeFragments = lines.reduce((count, line) => count + (line.match(/<\/>/g) || []).length, 0);
console.log('startLine', startLine+1);
console.log('openDivs', openDivs, 'closeDivs', closeDivs);
console.log('openFragments', openFragments, 'closeFragments', closeFragments);
for (let i = 0; i < lines.length; i++) {
  if (/className=/.test(lines[i]) && lines[i].includes('{') && !lines[i].includes('}')) {
    if (/`/.test(lines[i])) console.log('template line', i+startLine+1, lines[i]);
  }
}
