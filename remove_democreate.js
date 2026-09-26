const fs = require('fs');

let c = fs.readFileSync('apps/backend/src/orders/orders.service.ts', 'utf8');

if (c.includes('async demoCreate')) {
  c = c.replace(
    /async demoCreate\([\s\S]*?return fakeOrder;\n  \}/,
    `// No mocks allowed. demoCreate removed.`
  );
  fs.writeFileSync('apps/backend/src/orders/orders.service.ts', c);
  console.log('Removed demoCreate from OrdersService');
}
