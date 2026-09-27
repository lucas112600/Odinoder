const fs = require('fs');

let c = fs.readFileSync('apps/admin-dashboard/src/App.tsx', 'utf8');

// 1. Remove unused lucide icons
c = c.replace(/, XCircle, CreditCard /, ' ');

// 2. Remove recharts import
c = c.replace(/import \{ BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid \} from 'recharts';\n/, '');

// 3. Remove chartData, totalRevenue, completedOrders logic
c = c.replace(/const totalRevenue = orders\.reduce[\s\S]*?return data\.reverse\(\);\n  \};\n\n  const chartData = generateChartData\(\);/s, '');

// Clean up any stray refs to XCircle or CreditCard if they were the only ones
c = c.replace(/XCircle, /g, '');
c = c.replace(/CreditCard, /g, '');
c = c.replace(/CreditCard/g, ''); // wait, did I use CreditCard in the JSX?
// Let's check if CreditCard was actually used. I thought I used it for the tab name, but in the previous fix I overwrote the Sidebar tabs back to original probably?
// No, if TS says it's never read, it means it's not used in JSX. So it's safe to remove from imports.

fs.writeFileSync('apps/admin-dashboard/src/App.tsx', c);
console.log('Removed all unused variables to satisfy strict TS compiler');
