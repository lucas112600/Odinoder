const fs = require('fs');

// Add GET :id to controller
let controller = fs.readFileSync('apps/backend/src/tenants/tenants.controller.ts', 'utf8');
controller = controller.replace(
  /@Get\(\)\n  findAll/,
  `@Get(':id')\n  findOne(@Param('id') id: string) {\n    return this.tenantsService.findOne(id);\n  }\n\n  @Get()\n  findAll`
);
fs.writeFileSync('apps/backend/src/tenants/tenants.controller.ts', controller);

// Add findOne to service
let service = fs.readFileSync('apps/backend/src/tenants/tenants.service.ts', 'utf8');
service = service.replace(
  /async findAll\(\) \{/,
  `async findOne(id: string) {\n    return this.prisma.tenant.findUnique({ where: { id } });\n  }\n\n  async findAll() {`
);
fs.writeFileSync('apps/backend/src/tenants/tenants.service.ts', service);
console.log('Added findOne to tenants backend');
