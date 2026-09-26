const fs = require('fs');
let c = fs.readFileSync('apps/backend/src/orders/orders.controller.ts', 'utf8');

c = c.replace(
  /@Post\('demo'\)\n  demoCreate\(@Body\(\) data: any\) \{\n    return this\.ordersService\.demoCreate\(data\);\n  \}/,
  `// demo endpoint removed`
);

fs.writeFileSync('apps/backend/src/orders/orders.controller.ts', c);
console.log('Fixed OrdersController');
