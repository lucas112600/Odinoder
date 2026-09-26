const fs = require('fs');
let c = fs.readFileSync('apps/admin-dashboard/src/App.tsx', 'utf8');

c = `import { Package, AlertCircle, Building2, Printer } from 'lucide-react';\n` + c;

// Move `const fetchOrders = async () => { ... }` up to line 50.
const fetchOrdersBlock = c.match(/(const fetchOrders = async \(\) => \{[\s\S]*?\}\s*catch\(e\) \{\}\s*\};)/);
if (fetchOrdersBlock) {
  c = c.replace(fetchOrdersBlock[0], '');
  c = c.replace(/const \[newTable, setNewTable\] = useState\(''\);/, `const [newTable, setNewTable] = useState('');\n  ${fetchOrdersBlock[0]}`);
}

fs.writeFileSync('apps/admin-dashboard/src/App.tsx', c);
