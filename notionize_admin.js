const fs = require('fs');

let c = fs.readFileSync('apps/admin-dashboard/src/App.tsx', 'utf8');

// Global Background & Text
c = c.replace(/min-h-screen bg-slate-900/g, 'min-h-screen bg-[#f7f6f3]');
c = c.replace(/min-h-screen bg-\[#F4F7FE\]/g, 'min-h-screen bg-[#f7f6f3]');
c = c.replace(/text-gray-800/g, 'text-[#37352f]');
c = c.replace(/text-gray-900/g, 'text-[#37352f]');
c = c.replace(/text-gray-500/g, 'text-[#9a9a97]');

// Login screen overhaul
c = c.replace(/bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex overflow-hidden min-h-\[500px\]/, 'bg-white border border-[#e9e9e7] rounded-lg shadow-sm w-full max-w-4xl flex overflow-hidden min-h-[500px]');
c = c.replace(/bg-slate-800 text-white p-12/g, 'bg-[#f7f6f3] text-[#37352f] p-12 border-r border-[#e9e9e7]');
c = c.replace(/text-white tracking-tight/g, 'text-[#37352f] tracking-tight');
c = c.replace(/text-slate-300/g, 'text-[#787774]');

// Sidebar overhaul
c = c.replace(/w-64 bg-slate-900 flex flex-col h-full border-r border-slate-800 shadow-xl/g, 'w-64 bg-[#f7f6f3] flex flex-col h-full border-r border-[#e9e9e7]');
c = c.replace(/className="p-4 border-t border-slate-800"/g, 'className="p-4 border-t border-[#e9e9e7]"');
c = c.replace(/className="bg-slate-800 rounded-xl p-4 flex items-center space-x-3 border border-slate-700"/g, 'className="bg-white rounded-md p-3 flex items-center space-x-3 border border-[#e9e9e7] shadow-sm"');
c = c.replace(/text-white/g, 'text-[#37352f]'); // Sidebar logo and names
// wait, fixing buttons that should be white text:
// I'll fix the "primary" buttons later in this script

// Tab buttons
c = c.replace(/'bg-blue-600 text-white shadow-lg shadow-blue-900\/50'/g, "'bg-white text-[#37352f] shadow-sm border border-[#e9e9e7]'");
c = c.replace(/'text-slate-400 hover:bg-slate-800 hover:text-white'/g, "'text-[#787774] hover:bg-[#efefef] hover:text-[#37352f]'");

// Rounding & Borders
c = c.replace(/rounded-2xl/g, 'rounded-lg');
c = c.replace(/rounded-xl/g, 'rounded-md');
c = c.replace(/border-gray-200/g, 'border-[#e9e9e7]');
c = c.replace(/border-gray-100/g, 'border-[#e9e9e7]');

// Primary Buttons (Make them Notion black)
c = c.replace(/bg-blue-600 text-white/g, 'bg-[#37352f] text-white');
c = c.replace(/hover:bg-blue-700/g, 'hover:bg-[#2f2e2a]');
c = c.replace(/bg-blue-50/g, 'bg-[#f7f6f3]');
c = c.replace(/text-blue-600/g, 'text-[#37352f]');
c = c.replace(/text-blue-800/g, 'text-[#37352f]');
c = c.replace(/border-blue-500/g, 'border-[#37352f]');

// Fix user section text
c = c.replace(/text-slate-400 font-medium/g, 'text-[#9a9a97] font-medium');

// Header
c = c.replace(/bg-white\/80 backdrop-blur-md/g, 'bg-white');

fs.writeFileSync('apps/admin-dashboard/src/App.tsx', c);
console.log('Admin dashboard Notionized');
