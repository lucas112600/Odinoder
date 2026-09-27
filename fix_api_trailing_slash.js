const fs = require('fs');

// 1. Fix LIFF Consumer
let consumer = fs.readFileSync('apps/liff-consumer/src/app/page.tsx', 'utf8');
consumer = consumer.replace(
  /const API_BASE = process\.env\.NEXT_PUBLIC_API_URL \|\| 'https:\/\/odinoder-api\.onrender\.com';/,
  "const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://odinoder-api.onrender.com';\nconst API_BASE = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;"
);
consumer = consumer.replace(
  /then\(data => setProducts\(data\)\)/,
  "then(data => setProducts(Array.isArray(data) ? data : []))"
);
fs.writeFileSync('apps/liff-consumer/src/app/page.tsx', consumer);

// 2. Fix Admin Dashboard
let admin = fs.readFileSync('apps/admin-dashboard/src/App.tsx', 'utf8');
admin = admin.replace(
  /const API_BASE = import\.meta\.env\.VITE_API_URL \|\| 'https:\/\/odinoder-api\.onrender\.com';/,
  "const rawApiUrl = import.meta.env.VITE_API_URL || 'https://odinoder-api.onrender.com';\nconst API_BASE = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;"
);
admin = admin.replace(/setProducts\(data\)/g, 'setProducts(Array.isArray(data) ? data : [])');
admin = admin.replace(/setOrders\(data\)/g, 'setOrders(Array.isArray(data) ? data : [])');
admin = admin.replace(/setRawMaterials\(data\)/g, 'setRawMaterials(Array.isArray(data) ? data : [])');
fs.writeFileSync('apps/admin-dashboard/src/App.tsx', admin);

// 3. Fix POS Tablet
let pos = fs.readFileSync('apps/pos-tablet/src/App.tsx', 'utf8');
pos = pos.replace(
  /const API_BASE = import\.meta\.env\.VITE_API_URL \|\| 'https:\/\/odinoder-api\.onrender\.com';/,
  "const rawApiUrl = import.meta.env.VITE_API_URL || 'https://odinoder-api.onrender.com';\nconst API_BASE = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;"
);
pos = pos.replace(/setAvailableStores\(data\)/g, 'setAvailableStores(Array.isArray(data) ? data : [])');
fs.writeFileSync('apps/pos-tablet/src/App.tsx', pos);

console.log('Fixed API_BASE trailing slashes and added array safety checks');
