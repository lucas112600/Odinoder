const fs = require('fs');

let c = fs.readFileSync('apps/admin-dashboard/src/App.tsx', 'utf8');

// 1. Update lucide-react imports
c = c.replace(
  /import \{ Package, AlertCircle, Building2 \} from 'lucide-react';/,
  "import { Package, AlertCircle, Building2, LayoutDashboard, ShoppingBag, Settings, QrCode, ClipboardList, LogOut, Link as LinkIcon } from 'lucide-react';"
);

// 2. Change the sidebar background and colors
c = c.replace(/className="w-64 bg-white flex flex-col h-full border-r border-gray-100 shadow-sm"/, 
              'className="w-64 bg-slate-900 flex flex-col h-full border-r border-slate-800 shadow-xl"');

// 3. Change Logo text color in sidebar
c = c.replace(/<h1 className="text-xl font-black text-gray-900 tracking-tight">營運總部<\/h1>/, 
              '<h1 className="text-xl font-black text-white tracking-tight">營運總部</h1>');

// 4. Update the Active tab buttons
c = c.replace(/`w-full flex items-center px-4 py-3 rounded-xl font-bold transition-all \$\{activeTab === 'orders' \? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'\}`/g,
              "`w-full flex items-center px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'orders' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`");

c = c.replace(/`w-full flex items-center px-4 py-3 rounded-xl font-bold transition-all \$\{activeTab === 'inventory' \? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'\}`/g,
              "`w-full flex items-center px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'inventory' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`");

c = c.replace(/`w-full flex items-center px-4 py-3 rounded-xl font-bold transition-all \$\{activeTab === 'products' \? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'\}`/g,
              "`w-full flex items-center px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'products' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`");

c = c.replace(/`w-full flex items-center px-4 py-3 rounded-xl font-bold transition-all \$\{activeTab === 'qrcodes' \? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'\}`/g,
              "`w-full flex items-center px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'qrcodes' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`");

c = c.replace(/`w-full flex items-center px-4 py-3 rounded-xl font-bold transition-all \$\{activeTab === 'settings' \? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'\}`/g,
              "`w-full flex items-center px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`");

// 5. Replace span icons with Lucide React icons
c = c.replace(/<span className="text-lg mr-3">.*?<\/span>/g, ''); // Remove the spans

c = c.replace(/營運數據分析/g, '<LayoutDashboard size={20} className="mr-3" /> 營運數據分析');
c = c.replace(/<Package size=\{20\} className=\{`mr-3 \$\{activeTab === 'inventory' \? 'text-blue-500' : 'text-gray-500'\}`\} \/>/g, 
              '<Package size={20} className="mr-3" />');
c = c.replace(/商品與配方設定/g, '<ShoppingBag size={20} className="mr-3" /> 商品與配方設定');
c = c.replace(/桌邊點餐設定/g, '<QrCode size={20} className="mr-3" /> 桌邊點餐設定');
c = c.replace(/門市基本資料/g, '<Settings size={20} className="mr-3" /> 門市基本資料');

// 6. Fix user profile area at bottom of sidebar
c = c.replace(/className="p-4 border-t border-gray-100"/, 'className="p-4 border-t border-slate-800"');
c = c.replace(/className="bg-gray-50 rounded-xl p-4 flex items-center space-x-3 border border-gray-100"/, 'className="bg-slate-800 rounded-xl p-4 flex items-center space-x-3 border border-slate-700"');
c = c.replace(/className="text-sm font-bold text-gray-800">系統管理員/, 'className="text-sm font-bold text-white">系統管理員');
c = c.replace(/className="text-xs text-gray-500 font-medium">\{tenantName/, 'className="text-xs text-slate-400 font-medium">{tenantName');

// 7. Change logout button
c = c.replace(/<button onClick=\{handleLogout\} className="text-xs text-blue-600 hover:text-blue-800 font-bold mt-1 underline">登出<\/button>/,
              '<button onClick={handleLogout} className="text-xs flex items-center text-red-400 hover:text-red-300 font-bold mt-1"><LogOut size={12} className="mr-1" />登出</button>');

// 8. Copy Link button
c = c.replace(/bg-indigo-50 text-indigo-700 rounded-xl font-bold hover:bg-indigo-100 transition shadow-sm border border-indigo-100/,
              'bg-blue-600/20 text-blue-400 rounded-xl font-bold hover:bg-blue-600/30 transition shadow-sm border border-blue-500/30');

c = c.replace(/複製點餐網址/, '<LinkIcon size={16} className="mr-2" /> 複製點餐網址');
c = c.replace(/🔗 <LinkIcon/, '<LinkIcon'); // Clean up leftover manually

fs.writeFileSync('apps/admin-dashboard/src/App.tsx', c);
console.log('Sidebar UI overhaul completed');
