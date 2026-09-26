const fs = require('fs');
let c = fs.readFileSync('apps/admin-dashboard/src/App.tsx', 'utf8');

// The QR Code generation logic in settings was just an input and an img tag.
// Let's replace the whole Settings UI ternary fallback with proper conditional rendering.
// Previously it ended with: `{activeTab === 'products' ? ( ... ) : ( <div className="space-y-6 ..."> ... </div> )}`
// I will extract the Settings UI and QR UI into distinct blocks.

// First, change `{activeTab === 'products' ? (` to `{activeTab === 'products' && (`
c = c.replace(/\{activeTab === 'products' \? \(/, `{activeTab === 'products' && (`);

// At the end of the products block, there is a `) : (` which leads into Settings.
// I will replace `) : (` with `)}\n\n          {activeTab === 'settings' && (`
c = c.replace(/\)\s*:\s*\(\s*<div className="space-y-6 animate-in fade-in duration-300 max-w-xl mx-auto">/, `)}\n\n          {activeTab === 'settings' && (\n            <div className="space-y-6 animate-in fade-in duration-300 max-w-xl mx-auto">`);

// Remove the QR code section from the settings block
c = c.replace(
  /<div>\s*<h4 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2 flex items-center"><Printer size=\{20\} className="mr-2 text-blue-600" \/>列印桌號專屬 QR Code<\/h4>[\s\S]*?<\/div>/,
  ``
);

// Add the dedicated QR codes block at the end of the main content div
const qrCodesBlock = `
          {activeTab === 'qrcodes' && (
            <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl mx-auto">
              <div className="flex justify-between items-end print:hidden">
                <div>
                  <h3 className="text-2xl font-black text-gray-900">列印桌號專屬 QR Code</h3>
                  <p className="text-sm text-gray-500 mt-1">為每張桌子產生專屬點餐連結，並一次列印出來貼在桌上。</p>
                </div>
                <div className="flex space-x-3">
                  <button onClick={() => window.print()} className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-black active:scale-95 flex items-center">
                    <Printer size={18} className="mr-2" /> 列印全部 QR Code
                  </button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 print:hidden mb-6">
                <form onSubmit={(e) => { e.preventDefault(); if (newTable && !tables.includes(newTable)) { setTables([...tables, newTable]); setNewTable(''); } }} className="flex items-end space-x-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5">新增桌號/區域</label>
                    <input type="text" value={newTable} onChange={e => setNewTable(e.target.value)} placeholder="例如: VIP包廂" className="w-64 border border-gray-200 bg-gray-50 px-4 py-2.5 rounded-xl font-medium focus:outline-none focus:bg-white focus:border-blue-500" />
                  </div>
                  <button type="submit" className="bg-blue-50 text-blue-600 border border-blue-200 px-6 py-2.5 rounded-xl font-bold shadow-sm hover:bg-blue-100 active:scale-95 mb-[2px]">
                    + 加入列表
                  </button>
                </form>
              </div>

              {/* 列印預覽與畫布 */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 print:grid-cols-3 print:gap-8 print:w-[210mm] print:mx-auto">
                {tables.map(table => {
                  const url = \`http://localhost:3001/\${tenantId}?table=\${encodeURIComponent(table)}\`;
                  return (
                    <div key={table} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center justify-center text-center relative group print:shadow-none print:border-gray-400">
                      <button onClick={() => setTables(tables.filter(t => t !== table))} className="absolute top-2 right-2 text-gray-300 hover:text-red-500 print:hidden opacity-0 group-hover:opacity-100 transition"><Trash2 size={16} /></button>
                      <h4 className="text-xl font-black text-gray-900 mb-4 tracking-wider">{table} 桌</h4>
                      <img src={\`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=\${encodeURIComponent(url)}\`} alt={\`QR \${table}\`} className="w-32 h-32 mb-4 print:w-40 print:h-40" />
                      <p className="text-[10px] text-gray-400 font-mono break-all px-2 leading-tight">掃碼立即點餐</p>
                      <p className="text-[10px] text-gray-400 font-bold mt-1 print:hidden">{tenantName}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}`;

c = c.replace(
  /<\/div>\s*<\/main>\s*<\/div>\s*\);\s*\}\s*$/,
  `</div>\n${qrCodesBlock}\n        </div>\n      </main>\n    </div>\n  );\n}\n`
);

// We need to add print styles to the index.html or global css so everything else is hidden.
// Admin dashboard Tailwind will handle `print:hidden` nicely on other elements.
// I need to ensure sidebar is `print:hidden` and header is `print:hidden`.
c = c.replace(
  /<header className="h-20 bg-white\/80 backdrop-blur-md sticky top-0 flex items-center justify-between px-8 z-10 border-b border-gray-100">/,
  `<header className="h-20 bg-white/80 backdrop-blur-md sticky top-0 flex items-center justify-between px-8 z-10 border-b border-gray-100 print:hidden">`
);

c = c.replace(
  /<aside className="w-64 bg-white shadow-\[4px_0_24px_rgba\(0,0,0,0\.02\)\] flex flex-col z-20 print:hidden">/,
  `<aside className="w-64 bg-white shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col z-20 print:hidden">`
);

fs.writeFileSync('apps/admin-dashboard/src/App.tsx', c);
console.log('Admin Dashboard QR Code tab rewritten');
