const fs = require('fs');

let lines = fs.readFileSync('apps/admin-dashboard/src/App.tsx', 'utf8').split('\n');

for(let i=0; i<lines.length; i++) {
  if (lines[i].includes("{activeTab === 'orders' && (") && lines[i].includes(")}")) {
    // This is the broken one at 404.
    // Replace `)}` and `{activeTab === 'orders' && (` with `) : (`
    lines[i] = lines[i].replace(")}\n          {activeTab === 'orders' && (", ") : ("); // Oh, they are on separate lines now, because I injected a newline in `fix_brackets3.js`.
  }
}

// Wait, the string in my previous replace was: `)}\n          {activeTab === 'orders' && (`
// Let's just find exactly that string in the whole file and replace the FIRST occurrence back to `) : (` because the ternary operator is `editingProduct.imageUrl ? ( ... ) : ( ... )`.

let c = fs.readFileSync('apps/admin-dashboard/src/App.tsx', 'utf8');
c = c.replace(")}\n          {activeTab === 'orders' && (", ") : (");
fs.writeFileSync('apps/admin-dashboard/src/App.tsx', c);
console.log('Fixed broken ternary replacement');
