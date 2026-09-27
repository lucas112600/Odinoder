const fs = require('fs');

let c = fs.readFileSync('apps/liff-consumer/src/app/page.tsx', 'utf8');

c = c.replace(
  /歡迎使用 Odinoder/,
  '歡迎使用線上點餐系統'
);

c = c.replace(
  /const \[products, setProducts\] = useState<any\[\]>\(\[\]\);/,
  "const [products, setProducts] = useState<any[]>([]);\n  const [tenantName, setTenantName] = useState<string>('');"
);

c = c.replace(
  /useEffect\(\(\) => \{\n    fetch\(`\$\{API_BASE\}\/products\/tenant\/\$\{tenantId\}`\)/,
  `useEffect(() => {
    fetch(\`\${API_BASE}/tenants/\${tenantId}\`)
      .then(res => res.json())
      .then(data => setTenantName(data.name || ''))
      .catch(e => console.error(e));

    fetch(\`\${API_BASE}/products/tenant/\${tenantId}\`)`
);

c = c.replace(
  /<h1 className="text-xl font-black text-gray-800">Odinoder 點餐系統<\/h1>/,
  '<h1 className="text-xl font-black text-gray-800">{tenantName ? `${tenantName} 點餐系統` : \'線上點餐系統\'}</h1>'
);

fs.writeFileSync('apps/liff-consumer/src/app/page.tsx', c);
console.log('Removed default name in consumer app');
