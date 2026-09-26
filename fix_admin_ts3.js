const fs = require('fs');

let c = fs.readFileSync('apps/admin-dashboard/src/App.tsx', 'utf8');

c = c.replace(
  /import \{ ArrowRight, Trash2,/,
  `import { ArrowRight, Trash2, Package, AlertCircle, Building2, Printer,`
);

const fetchOrdersMatch = c.match(/(const fetchOrders = async \(\) => \{[\s\S]*?\}\s*catch\(e\) \{\}\s*\};\s*useEffect\(\(\) => \{[\s\S]*?\}\, \[activeTab, tenantId\]\);)/);
if (fetchOrdersMatch) {
  const block = fetchOrdersMatch[1];
  c = c.replace(block, '');
  // Insert before handleCreateMaterial
  c = c.replace(
    /const handleCreateMaterial = async/,
    block + '\n\n  const handleCreateMaterial = async'
  );
}

fs.writeFileSync('apps/admin-dashboard/src/App.tsx', c);
console.log('Final TS fix');
