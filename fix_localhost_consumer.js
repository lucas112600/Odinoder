const fs = require('fs');
let c = fs.readFileSync('apps/admin-dashboard/src/App.tsx', 'utf8');

c = c.replace(
  /navigator\.clipboard\.writeText\(`http:\/\/localhost:3001\/\$\{tenantId\}`\);/,
  "const consumerUrl = (import.meta.env.VITE_CONSUMER_URL || 'http://localhost:3001') + `/?store=${tenantId}`;\n              navigator.clipboard.writeText(consumerUrl);"
);

c = c.replace(
  /alert\('已複製消費者專屬點餐網址！\\n\\n' \+ `http:\/\/localhost:3001\/\$\{tenantId\}`\);/g,
  "alert('已複製消費者專屬點餐網址！\\n\\n' + consumerUrl);"
);

fs.writeFileSync('apps/admin-dashboard/src/App.tsx', c);
console.log('Fixed localhost:3001 hardcoded URL');
