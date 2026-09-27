const fs = require('fs');

let schema = fs.readFileSync('apps/backend/prisma/schema.prisma', 'utf8');

if (!schema.includes('barcode          String?')) {
  schema = schema.replace(
    /tenantId         String      @map\("tenant_id"\) @db\.Uuid/,
    'tenantId         String      @map("tenant_id") @db.Uuid\n  barcode          String?     @map("barcode")'
  );
  fs.writeFileSync('apps/backend/prisma/schema.prisma', schema);
  console.log('Added barcode field to RawMaterial');
}
