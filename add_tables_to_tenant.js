const fs = require('fs');

let schema = fs.readFileSync('apps/backend/prisma/schema.prisma', 'utf8');
schema = schema.replace(
  /createdAt        DateTime    @default\(now\(\)\) @map\("created_at"\)/,
  `createdAt        DateTime    @default(now()) @map("created_at")\n  tables           String[]    @default(["1", "2", "3"])`
);

fs.writeFileSync('apps/backend/prisma/schema.prisma', schema);
console.log('Added tables to Tenant model');
