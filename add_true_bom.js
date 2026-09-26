const fs = require('fs');
let c = fs.readFileSync('apps/admin-dashboard/src/App.tsx', 'utf8');

// 1. Initialize recipes array when editing
c = c.replace(
  /onClick=\{\(\) => setEditingProduct\(\{ name: '', price: '' \}\)\}/,
  `onClick={() => setEditingProduct({ name: '', price: '', category: '', recipes: [] })}`
);
c = c.replace(
  /onClick=\{\(\) => setEditingProduct\(p\)\}/,
  `onClick={() => setEditingProduct({...p, recipes: p.recipeItems?.map((r:any)=>({rawMaterialId: r.rawMaterialId, amount: String(r.amount)})) || []})}`
);

// 2. Add BOM UI in the Edit Modal
if (!c.includes('BOM 配方設定')) {
  const bomUI = `
                      <div className="pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-xs font-bold text-gray-500">BOM 配方設定 (選填：自動扣庫存)</label>
                          <button type="button" onClick={() => setEditingProduct({...editingProduct, recipes: [...(editingProduct.recipes||[]), {rawMaterialId: '', amount: ''}]})} className="text-xs text-blue-600 font-bold hover:underline">+ 加入配方物料</button>
                        </div>
                        {editingProduct.recipes?.map((r:any, idx:number) => (
                          <div key={idx} className="flex space-x-2 mb-2">
                            <select value={r.rawMaterialId} onChange={e => {
                                const newR = [...editingProduct.recipes];
                                newR[idx].rawMaterialId = e.target.value;
                                setEditingProduct({...editingProduct, recipes: newR});
                              }} className="flex-1 border border-gray-200 bg-gray-50 px-2 py-1.5 rounded-lg text-sm font-medium focus:outline-none focus:border-blue-500">
                              <option value="">選擇原物料...</option>
                              {rawMaterials.map(rm => <option key={rm.id} value={rm.id}>{rm.name} ({rm.unit})</option>)}
                            </select>
                            <input type="number" placeholder="消耗量" value={r.amount} onChange={e => {
                                const newR = [...editingProduct.recipes];
                                newR[idx].amount = e.target.value;
                                setEditingProduct({...editingProduct, recipes: newR});
                              }} className="w-24 border border-gray-200 bg-gray-50 px-2 py-1.5 rounded-lg text-sm font-medium focus:outline-none focus:border-blue-500" />
                            <button type="button" onClick={() => {
                                const newR = editingProduct.recipes.filter((_:any, i:number) => i !== idx);
                                setEditingProduct({...editingProduct, recipes: newR});
                              }} className="text-red-500 font-bold px-2">X</button>
                          </div>
                        ))}
                      </div>
  `;

  c = c.replace(
    /<div className="shrink-0 flex items-end">/,
    bomUI + '\n                      <div className="shrink-0 flex items-end">'
  );
}

// 3. Update the Product Card to show Recipes
if (!c.includes('配方綁定:')) {
  c = c.replace(
    /<p className="text-blue-600 font-black mt-1">NT\$ \{Number\(p\.price\)\}<\/p>/,
    `<p className="text-blue-600 font-black mt-1">NT$ {Number(p.price)}</p>
                    {p.recipeItems && p.recipeItems.length > 0 && (
                      <p className="text-xs text-gray-500 font-medium mt-2">配方綁定: {p.recipeItems.map((r:any)=>r.rawMaterial?.name).join(', ')}</p>
                    )}`
  );
}

fs.writeFileSync('apps/admin-dashboard/src/App.tsx', c);
console.log('Admin Product UI updated with true BOM linking');
