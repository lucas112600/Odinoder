const fs = require('fs');
let c = fs.readFileSync('apps/backend/src/main.ts', 'utf8');

c = c.replace(
  /origin: \['http:\/\/localhost[^\]]*\],/,
  'origin: true,'
);

fs.writeFileSync('apps/backend/src/main.ts', c);
console.log('CORS updated in main.ts');
