const fs = require('fs');
let c = fs.readFileSync('apps/liff-consumer/package.json', 'utf8');
c = c.replace(/"build": "next build"/, `"build": "npm install --no-workspaces && next build"`);
fs.writeFileSync('apps/liff-consumer/package.json', c);
