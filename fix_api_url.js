const fs = require('fs');

function replaceApiBase(filePath, envVar, framework) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  const apiBaseDef = framework === 'vite' 
    ? `const API_BASE = import.meta.env.VITE_API_URL || 'https://odinoder-api.onrender.com';\n`
    : `const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://odinoder-api.onrender.com';\n`;

  // Inject API_BASE at the top after imports
  if (!content.includes('const API_BASE =')) {
    content = content.replace(/(import .*;\n)+/, match => match + '\n' + apiBaseDef);
  }

  // Replace 'http://localhost:3000/...' with \`\${API_BASE}/...\`
  // We have things like: fetch('http://localhost:3000/tenants')
  content = content.replace(/'http:\/\/localhost:3000([^']*)'/g, '`${API_BASE}$1`');
  
  // We also have things like: fetch(`http://localhost:3000/tenants/${id}`)
  content = content.replace(/`http:\/\/localhost:3000([^`]*)`/g, '`${API_BASE}$1`');

  fs.writeFileSync(filePath, content);
}

replaceApiBase('apps/admin-dashboard/src/App.tsx', 'VITE_API_URL', 'vite');
replaceApiBase('apps/pos-tablet/src/App.tsx', 'VITE_API_URL', 'vite');
replaceApiBase('apps/liff-consumer/src/app/page.tsx', 'NEXT_PUBLIC_API_URL', 'next');

console.log("Replaced localhost:3000 with API_BASE in all frontends.");
