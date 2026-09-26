const fs = require('fs');
let c = fs.readFileSync('apps/admin-dashboard/src/App.tsx', 'utf8');

// 1. Fix activeTab type
c = c.replace(
  /const \[activeTab, setActiveTab\] = useState\<'orders' \| 'products' \| 'settings' \| 'qrcodes'\>\('orders'\);/,
  `const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'settings' | 'qrcodes' | 'inventory'>('orders');`
);

// 2. Fix missing imports
if (!c.includes('Building2')) {
  c = c.replace(
    /import \{ ArrowRight, Trash2, Package, AlertCircle,/,
    `import { ArrowRight, Trash2, Package, AlertCircle, Building2, Printer,`
  );
}

// 3. Move fetchRawMaterials definition before useEffect
if (c.includes('useEffect(() => {\n    if (activeTab === \'inventory\') fetchRawMaterials();')) {
  // Wait, in my previous script I wrote:
  /*
  const fetchRawMaterials = async () => { ... };
  useEffect(() => { ... fetchRawMaterials() }, []);
  const fetchOrders = ...
  */
  // Let me just manually rearrange or verify it. If it's `const fetchRawMaterials = ...`, then it IS defined before the useEffect right below it!
  // Why did TS complain?
  // "Cannot find name 'fetchRawMaterials'" - Maybe it was defined inside a useEffect but called outside?
}

fs.writeFileSync('apps/admin-dashboard/src/App.tsx', c);
