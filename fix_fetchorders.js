const fs = require('fs');
let c = fs.readFileSync('apps/admin-dashboard/src/App.tsx', 'utf8');

c = c.replace(/onClick=\{\(\) => \{ setActiveTab\('orders'\); fetchOrders\(\); \}\}/, `onClick={() => setActiveTab('orders')}`);
c = c.replace(/Printer,/, '');

fs.writeFileSync('apps/admin-dashboard/src/App.tsx', c);
console.log('Fixed fetchOrders call');
