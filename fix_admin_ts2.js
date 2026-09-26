const fs = require('fs');

let c = fs.readFileSync('apps/admin-dashboard/src/App.tsx', 'utf8');

// 1. Fix line 94: e implicitly any
c = c.replace(
  /const handleUpdateStoreProfile = async \(e\) => \{/,
  `const handleUpdateStoreProfile = async (e: React.FormEvent) => {`
);

// 2. Fix line 103: tenantName is string | null
c = c.replace(
  /localStorage\.setItem\('admin_tenantName', tenantName\);/,
  `localStorage.setItem('admin_tenantName', tenantName || '');`
);

// 3. Move fetchRawMaterials definition up
const fetchRawMatch = c.match(/(const fetchRawMaterials = async \(\) => \{[\s\S]*?\}\s*catch\(e\) \{\}\s*\};\s*useEffect\(\(\) => \{[\s\S]*?\}\, \[activeTab, tenantId\]\);)/);
if (fetchRawMatch) {
  const block = fetchRawMatch[1];
  c = c.replace(block, '');
  // Insert before handleCreateMaterial
  c = c.replace(
    /const handleCreateMaterial = async/,
    block + '\n\n  const handleCreateMaterial = async'
  );
}

fs.writeFileSync('apps/admin-dashboard/src/App.tsx', c);
console.log('Admin TS fixed');
