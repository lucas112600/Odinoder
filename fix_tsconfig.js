const fs = require('fs');
['apps/admin-dashboard/tsconfig.json', 'apps/pos-tablet/tsconfig.json'].forEach(file => {
  let c = fs.readFileSync(file, 'utf8');
  if (!c.includes('"jsx": "react-jsx"')) {
    c = c.replace(/"skipLibCheck": true,/, '"skipLibCheck": true,\n    "jsx": "react-jsx",');
    fs.writeFileSync(file, c);
    console.log('Added jsx to ' + file);
  }
});
