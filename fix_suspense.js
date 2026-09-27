const fs = require('fs');

let c = fs.readFileSync('apps/liff-consumer/src/app/page.tsx', 'utf8');

if (!c.includes('Suspense')) {
  c = c.replace(/import React, \{ useState, useEffect \} from 'react';/, `import React, { useState, useEffect, Suspense } from 'react';`);
  
  c = c.replace(/export default function OrderingPage\(\) \{/, `function OrderingContent() {`);
  
  const wrapper = `\nexport default function OrderingPage() {\n  return (\n    <Suspense fallback={<div>Loading...</div>}>\n      <OrderingContent />\n    </Suspense>\n  );\n}\n`;
  
  c = c + wrapper;
  fs.writeFileSync('apps/liff-consumer/src/app/page.tsx', c);
  console.log('Added Suspense to liff-consumer/page.tsx');
}

let a = fs.readFileSync('apps/admin-dashboard/src/App.tsx', 'utf8');
a = a.replace(/http:\/\/localhost:3001\/\$\{tenantId\}\?table=\$\{table\}/g, `http://localhost:3001/?store=\${tenantId}&table=\${table}`);
fs.writeFileSync('apps/admin-dashboard/src/App.tsx', a);
console.log('Updated QR code URLs in admin-dashboard');
