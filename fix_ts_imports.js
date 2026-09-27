const fs = require('fs');

let c = fs.readFileSync('apps/admin-dashboard/src/App.tsx', 'utf8');

// Remove unused lucide icons that are crashing the CI
c = c.replace(
  /LayoutDashboard, ShoppingBag, Settings, QrCode, ClipboardList, LogOut, Link as LinkIcon/,
  'LogOut, Link as LinkIcon'
);

// Oh wait, LogOut and LinkIcon are also failing because they didn't get used.
// "error TS6133: 'LogOut' is declared but its value is never read."
// "error TS6133: 'LinkIcon' is declared but its value is never read."
// Let's remove them completely.
c = c.replace(
  /, LogOut, Link as LinkIcon/,
  ''
);

c = c.replace(
  /LayoutDashboard, ShoppingBag, Settings, QrCode, ClipboardList/,
  ''
);

fs.writeFileSync('apps/admin-dashboard/src/App.tsx', c);
console.log('Fixed unused imports crashing the CI');
