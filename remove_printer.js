const fs = require('fs');
let c = fs.readFileSync('apps/admin-dashboard/src/App.tsx', 'utf8');
c = c.replace(/import \{ Package, AlertCircle, Building2, Printer \} from 'lucide-react';/, `import { Package, AlertCircle, Building2 } from 'lucide-react';`);
fs.writeFileSync('apps/admin-dashboard/src/App.tsx', c);
