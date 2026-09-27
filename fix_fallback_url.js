const fs = require('fs');
let c = fs.readFileSync('apps/admin-dashboard/src/App.tsx', 'utf8');

c = c.replace(
  /'http:\/\/localhost:3001'/g,
  "'https://odinoder.pages.dev'"
);

fs.writeFileSync('apps/admin-dashboard/src/App.tsx', c);
console.log('Changed fallback consumer URL');
