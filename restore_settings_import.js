const fs = require('fs');
let c = fs.readFileSync('apps/admin-dashboard/src/App.tsx', 'utf8');

c = c.replace(
  /import \{ Package, AlertCircle, Building2 \} from 'lucide-react';/,
  "import { Package, AlertCircle, Building2, Settings } from 'lucide-react';"
);

fs.writeFileSync('apps/admin-dashboard/src/App.tsx', c);
console.log('Restored Settings import');
