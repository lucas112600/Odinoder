const fs = require('fs');
let c = fs.readFileSync('apps/admin-dashboard/src/App.tsx', 'utf8');

c = c.replace(
  /const consumerUrl = \(import\.meta\.env\.VITE_CONSUMER_URL \|\| 'http:\/\/localhost:3001'\) \+ `\/\?store=\$\{tenantId\}`;/,
  "const rawConsumerUrl = import.meta.env.VITE_CONSUMER_URL || 'http://localhost:3001';\n              const consumerUrl = (rawConsumerUrl.endsWith('/') ? rawConsumerUrl.slice(0, -1) : rawConsumerUrl) + `/?store=${tenantId}`;"
);

// We should also fix the QR code URL just in case! Wait, QR code URL is hardcoded to odinoder.pages.dev. Let's make it use VITE_CONSUMER_URL too so it doesn't break if they use a custom domain.
c = c.replace(
  /https:\/\/odinoder\.pages\.dev\/\?store=\$\{tenantId\}&table=\$\{table\}/,
  "${(import.meta.env.VITE_CONSUMER_URL || 'http://localhost:3001').replace(/\\/$/, '')}/?store=${tenantId}&table=${table}"
);

fs.writeFileSync('apps/admin-dashboard/src/App.tsx', c);
console.log('Fixed double slash bug in URLs');
