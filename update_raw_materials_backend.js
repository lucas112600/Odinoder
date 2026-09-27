const fs = require('fs');

let service = fs.readFileSync('apps/backend/src/raw-materials/raw-materials.service.ts', 'utf8');

service = service.replace(
  /safetyStock: data\.safetyStock,/,
  "safetyStock: data.safetyStock,\n        barcode: data.barcode || null,"
);

fs.writeFileSync('apps/backend/src/raw-materials/raw-materials.service.ts', service);
console.log('Updated raw materials service');
