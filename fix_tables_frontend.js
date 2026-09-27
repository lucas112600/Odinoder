const fs = require('fs');

let c = fs.readFileSync('apps/admin-dashboard/src/App.tsx', 'utf8');

c = c.replace(
  /const \[tables, setTables\] = useState<string\[\]>\(\['1', '2', '3', '4', '5'\]\);/,
  "const [tables, setTables] = useState<string[]>([]);"
);

c = c.replace(
  /const fetchProducts = async \(\) => \{/,
  `const fetchTenantDetails = async () => {
      try {
        const res = await fetch(\`\${API_BASE}/tenants/\${tenantId}\`);
        const data = await res.json();
        if (data.tables && data.tables.length > 0) {
          setTables(data.tables);
        } else {
          // If empty, sync default
          const defaultTables = ['1', '2', '3'];
          setTables(defaultTables);
          fetch(\`\${API_BASE}/tenants/\${tenantId}\`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tables: defaultTables })
          });
        }
      } catch (e) {}
    };
    fetchTenantDetails();

    const fetchProducts = async () => {`
);

// handleAddTable
c = c.replace(
  /onSubmit=\{\(e\) => \{ e\.preventDefault\(\); if\(newTable\) \{ setTables\(\[\.\.\.tables, newTable\]\); setNewTable\(''\); \} \}\}/,
  `onSubmit={async (e) => { 
                      e.preventDefault(); 
                      if(newTable) { 
                        const nt = [...tables, newTable];
                        setTables(nt); 
                        setNewTable(''); 
                        await fetch(\`\${API_BASE}/tenants/\${tenantId}\`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ tables: nt })
                        });
                      } 
                    }}`
);

// handleRemoveTable
c = c.replace(
  /onClick=\{\(\) => setTables\(tables\.filter\(t => t !== table\)\)\}/,
  `onClick={async () => {
                        const nt = tables.filter(t => t !== table);
                        setTables(nt);
                        await fetch(\`\${API_BASE}/tenants/\${tenantId}\`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ tables: nt })
                        });
                      }}`
);

fs.writeFileSync('apps/admin-dashboard/src/App.tsx', c);
console.log('Fixed tables state in admin-dashboard');
