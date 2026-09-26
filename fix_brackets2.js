const fs = require('fs');

let c = fs.readFileSync('apps/admin-dashboard/src/App.tsx', 'utf8');

// The safest way is to just grab the raw source up to `<div className="p-8">`,
// and then close everything cleanly. But we don't want to lose the actual components (Orders, Products, Inventory).

// The repo was freshly cloned by Vercel/Render, but locally we are in our workspace.
// If I just run `git checkout origin/main -- apps/admin-dashboard/src/App.tsx`, wait, `origin/main` has the broken version because the user pushed it when it was broken.

// Let's just fix the syntax errors manually by removing the duplicate/corrupted chunks.
// Look at the lines 500-700.
// I will delete lines 604 to 693 and replace them with a clean Settings block.
const lines = c.split('\n');

// Find where `activeTab === 'settings' && (` starts
const settingsStart = lines.findIndex(l => l.includes("activeTab === 'settings' && ("));
// Find where it ends before `</main>`
const mainEnd = lines.findIndex(l => l.includes("</main>"));

const cleanSettings = `
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto">
              <div className="mb-6">
                <h3 className="text-2xl font-black text-gray-900">系統設定</h3>
                <p className="text-sm text-gray-500 mt-1">管理門市基本資料與硬體設備連線狀態。</p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 space-y-8">
                <form onSubmit={handleUpdateStoreProfile} className="mb-8">
                  <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><Building2 size={20} className="mr-2 text-blue-600" /> 門市基本資料維護</h4>
                  <div className="flex flex-col space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">門市名稱</label>
                      <input type="text" value={tenantName || ''} onChange={e => setTenantName(e.target.value)} className="w-full border border-gray-200 bg-white px-4 py-2.5 rounded-xl font-medium focus:outline-none focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">營業狀態</label>
                      <select className="w-full border border-gray-200 bg-white px-4 py-2.5 rounded-xl font-medium focus:outline-none focus:border-blue-500">
                        <option value="open">🟢 正常營業中</option>
                        <option value="closed">🔴 暫停營業 (打烊)</option>
                      </select>
                    </div>
                    <button type="submit" className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-black active:scale-95 w-32 mt-2">
                      儲存變更
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
`;

if (settingsStart !== -1 && mainEnd !== -1) {
  lines.splice(settingsStart, (mainEnd - settingsStart) + 4, ...cleanSettings.split('\n'));
}

// Now let's fix the `products` ternary.
// Currently: `{activeTab === 'products' ? (`
// Let's change it to `{activeTab === 'products' && (`
for(let i=0; i<lines.length; i++) {
  if (lines[i].includes("{activeTab === 'products' ? (")) {
    lines[i] = lines[i].replace("{activeTab === 'products' ? (", "{activeTab === 'products' && (");
  }
}

// Currently: `) : (` for orders.
// We need to change `) : (` to `)}\n{activeTab === 'orders' && (`
for(let i=0; i<lines.length; i++) {
  if (lines[i].includes(") : (") && lines[i+1] && lines[i+1].includes("營業數據圖表")) {
    lines[i] = lines[i].replace(") : (", ")}\n          {activeTab === 'orders' && (");
  }
}

// Also fix `import { ... Building2, Printer`
// Add it if missing.
const importsIndex = lines.findIndex(l => l.includes('import { ArrowRight, Trash2'));
if (importsIndex !== -1 && !lines[importsIndex].includes('Building2')) {
  lines[importsIndex] = lines[importsIndex].replace('import { ArrowRight, Trash2, Package, AlertCircle', 'import { ArrowRight, Trash2, Package, AlertCircle, Building2, Printer');
}

fs.writeFileSync('apps/admin-dashboard/src/App.tsx', lines.join('\n'));
console.log('Fixed ternary and brackets in App.tsx');
