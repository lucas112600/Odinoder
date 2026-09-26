const fs = require('fs');

let lines = fs.readFileSync('apps/admin-dashboard/src/App.tsx', 'utf8').split('\n');

for(let i=0; i<lines.length; i++) {
  if (lines[i].includes(") : (")) {
    lines[i] = lines[i].replace(") : (", ")}\n          {activeTab === 'orders' && (");
  }
}

fs.writeFileSync('apps/admin-dashboard/src/App.tsx', lines.join('\n'));
console.log('Fixed ternary part 2');
