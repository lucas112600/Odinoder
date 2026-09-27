const fs = require('fs');

// POS Tablet
let pos = fs.readFileSync('apps/pos-tablet/src/App.tsx', 'utf8');

pos = pos.replace(/bg-slate-900/g, 'bg-[#f7f6f3]');
pos = pos.replace(/bg-slate-800/g, 'bg-white');
pos = pos.replace(/text-slate-800/g, 'text-[#37352f]');
pos = pos.replace(/text-slate-900/g, 'text-[#37352f]');
pos = pos.replace(/text-slate-500/g, 'text-[#9a9a97]');
pos = pos.replace(/text-slate-400/g, 'text-[#9a9a97]');
pos = pos.replace(/bg-\[#eceff1\]/g, 'bg-[#f7f6f3]');
pos = pos.replace(/bg-white rounded-xl shadow-2xl/g, 'bg-white rounded-lg shadow-sm border border-[#e9e9e7]');
pos = pos.replace(/rounded-xl/g, 'rounded-md');
pos = pos.replace(/rounded-2xl/g, 'rounded-lg');
pos = pos.replace(/border-slate-200/g, 'border-[#e9e9e7]');
pos = pos.replace(/border-slate-100/g, 'border-[#e9e9e7]');

// POS Primary Buttons
pos = pos.replace(/bg-blue-600/g, 'bg-[#37352f]');
pos = pos.replace(/text-white/g, 'text-white');
pos = pos.replace(/hover:bg-blue-700/g, 'hover:bg-[#2f2e2a]');
pos = pos.replace(/bg-blue-50/g, 'bg-[#f7f6f3]');
pos = pos.replace(/hover:border-blue-500/g, 'hover:border-[#37352f]');
pos = pos.replace(/text-blue-600/g, 'text-[#37352f]');
pos = pos.replace(/text-blue-800/g, 'text-[#37352f]');

fs.writeFileSync('apps/pos-tablet/src/App.tsx', pos);
console.log('POS Tablet Notionized');


// Consumer App
let consumer = fs.readFileSync('apps/liff-consumer/src/app/page.tsx', 'utf8');

consumer = consumer.replace(/bg-gray-50/g, 'bg-[#f7f6f3]');
consumer = consumer.replace(/text-gray-800/g, 'text-[#37352f]');
consumer = consumer.replace(/text-gray-900/g, 'text-[#37352f]');
consumer = consumer.replace(/text-gray-500/g, 'text-[#9a9a97]');
consumer = consumer.replace(/text-gray-400/g, 'text-[#9a9a97]');
consumer = consumer.replace(/bg-white rounded-2xl shadow-sm border border-gray-100/g, 'bg-white rounded-lg shadow-sm border border-[#e9e9e7]');
consumer = consumer.replace(/rounded-2xl/g, 'rounded-lg');
consumer = consumer.replace(/rounded-xl/g, 'rounded-md');
consumer = consumer.replace(/rounded-t-3xl/g, 'rounded-t-lg');
consumer = consumer.replace(/border-gray-200/g, 'border-[#e9e9e7]');
consumer = consumer.replace(/border-gray-100/g, 'border-[#e9e9e7]');

// Consumer Primary Buttons
consumer = consumer.replace(/bg-blue-600/g, 'bg-[#37352f]');
consumer = consumer.replace(/text-white/g, 'text-white');
consumer = consumer.replace(/hover:bg-blue-700/g, 'hover:bg-[#2f2e2a]');
consumer = consumer.replace(/bg-blue-50/g, 'bg-[#f7f6f3]');
consumer = consumer.replace(/text-blue-600/g, 'text-[#37352f]');
consumer = consumer.replace(/border-blue-500/g, 'border-[#37352f]');
consumer = consumer.replace(/border-blue-200/g, 'border-[#37352f]');
consumer = consumer.replace(/bg-gray-900/g, 'bg-[#37352f]');
consumer = consumer.replace(/shadow-gray-900\/40/g, 'shadow-sm');

fs.writeFileSync('apps/liff-consumer/src/app/page.tsx', consumer);
console.log('Consumer App Notionized');
