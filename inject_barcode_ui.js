const fs = require('fs');
let c = fs.readFileSync('apps/admin-dashboard/src/App.tsx', 'utf8');

c = c.replace(
  /const \[newMaterial, setNewMaterial\] = useState\(\{ name: '', stock: '', unit: 'g', safetyStock: '10' \}\);/,
  "const [newMaterial, setNewMaterial] = useState({ name: '', stock: '', unit: 'g', safetyStock: '10', barcode: '' });\n  const [scanBarcode, setScanBarcode] = useState('');"
);

// handleCreateMaterial body reset
c = c.replace(
  /setNewMaterial\(\{ name: '', stock: '', unit: 'g', safetyStock: '10' \}\);/,
  "setNewMaterial({ name: '', stock: '', unit: 'g', safetyStock: '10', barcode: '' });"
);

// Inject handleScanSubmit after handleCreateMaterial
c = c.replace(
  /const handleCreateMaterial = async \(e: React\.FormEvent\) => \{[\s\S]*?alert\('原物料新增成功'\);\n      \}\n    \} catch \(e\) \{\}\n  \};/s,
  `$&

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!scanBarcode) return;
    const item = rawMaterials.find(rm => rm.barcode === scanBarcode);
    if (item) {
      const addAmt = window.prompt(\`找到物料 [\${item.name}] (目前庫存: \${item.stock} \${item.unit})\\n請輸入要進貨的數量:\`);
      if(addAmt && !isNaN(Number(addAmt))) {
        try {
          await fetch(\`\${API_BASE}/raw-materials/\${item.id}\`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stock: item.stock + Number(addAmt) })
          });
          fetchRawMaterials();
        } catch(e) {}
      }
    } else {
      alert('系統找不到此條碼！請在下方新增該原物料。');
      setNewMaterial({...newMaterial, barcode: scanBarcode});
    }
    setScanBarcode('');
  };`
);

// Inject UI for quick scan before the creation form
c = c.replace(
  /<div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">/,
  `<div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-200 mb-8 bg-blue-50/30">
                  <h4 className="font-bold text-blue-800 mb-4 flex items-center"><QrCode size={18} className="mr-2"/> 條碼快速進貨 (Barcode Scanner)</h4>
                  <form onSubmit={handleScanSubmit} className="flex space-x-3">
                    <input type="text" value={scanBarcode} onChange={e => setScanBarcode(e.target.value)} placeholder="請將游標停在此處，並使用條碼掃描槍刷入..." className="flex-1 border border-blue-200 px-4 py-3 rounded-xl font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-inner" autoFocus />
                    <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-blue-700 active:scale-95">送出條碼</button>
                  </form>
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">`
);

// Inject barcode field in creation form
c = c.replace(
  /<div className="w-24">\s*<label className="block text-xs font-bold text-gray-500 mb-1\.5">初始庫存<\/label>/,
  `<div className="w-32">
                      <label className="block text-xs font-bold text-gray-500 mb-1.5">商品條碼 (可選)</label>
                      <input type="text" value={newMaterial.barcode || ''} onChange={e => setNewMaterial({...newMaterial, barcode: e.target.value})} className="w-full border border-gray-200 bg-gray-50 px-4 py-2.5 rounded-xl font-mono focus:outline-none focus:bg-white focus:border-blue-500" placeholder="掃描或輸入"/>
                    </div>
                    $&`
);

// Inject QrCode back to imports if missing
c = c.replace(
  /import \{ Package, AlertCircle, Building2, Settings \} from 'lucide-react';/,
  "import { Package, AlertCircle, Building2, Settings, QrCode } from 'lucide-react';"
);

fs.writeFileSync('apps/admin-dashboard/src/App.tsx', c);
console.log('Injected quick scan feature');
