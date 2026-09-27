const fs = require('fs');

let service = fs.readFileSync('apps/backend/src/tenants/tenants.service.ts', 'utf8');
service = service.replace(
  /data: \{ name\?: string, isActive\?: boolean \}/,
  'data: { name?: string, isActive?: boolean, tables?: string[] }'
);
fs.writeFileSync('apps/backend/src/tenants/tenants.service.ts', service);

let controller = fs.readFileSync('apps/backend/src/tenants/tenants.controller.ts', 'utf8');
controller = controller.replace(
  /data: \{ name\?: string, isActive\?: boolean \}/,
  'data: { name?: string, isActive?: boolean, tables?: string[] }'
);
fs.writeFileSync('apps/backend/src/tenants/tenants.controller.ts', controller);

console.log('Updated tenants backend');
