const fs = require('fs');

let c = fs.readFileSync('apps/admin-dashboard/src/App.tsx', 'utf8');

c = c.replace(
  /className="bg-blue-600 text-white px-4 py-2 rounded font-bold text-sm hover:bg-blue-700"/g,
  'className="bg-[#37352f] text-white px-4 py-2 rounded font-bold text-sm hover:bg-[#2f2e2a]"'
);
c = c.replace(/text-blue-600/g, 'text-[#37352f]');
c = c.replace(/text-blue-800/g, 'text-[#37352f]');
c = c.replace(/bg-blue-100/g, 'bg-[#e9e9e7]');
c = c.replace(/border-blue-200/g, 'border-[#e9e9e7]');

fs.writeFileSync('apps/admin-dashboard/src/App.tsx', c);
console.log('Cleaned up remaining blue colors in admin dashboard');
