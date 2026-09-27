const fs = require('fs');
let c = fs.readFileSync('apps/admin-dashboard/src/App.tsx', 'utf8');

c = c.replace(
  /className="min-h-screen bg-\[#F4F7FE\] flex items-center justify-center p-4 font-sans text-gray-800"/,
  'className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-slate-800"'
);

c = c.replace(
  /className="bg-white rounded-3xl shadow-xl w-full max-w-4xl flex overflow-hidden min-h-\[500px\]"/,
  'className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex overflow-hidden min-h-[500px]"'
);

c = c.replace(
  /className="w-1\/2 bg-blue-600 text-white p-12 flex flex-col justify-center"/,
  'className="w-1/2 bg-slate-800 text-white p-12 flex flex-col justify-center"'
);

c = c.replace(
  /className="text-blue-100 leading-relaxed font-medium"/,
  'className="text-slate-300 leading-relaxed font-medium"'
);

fs.writeFileSync('apps/admin-dashboard/src/App.tsx', c);
console.log('Admin login UI updated');
