import { Package, AlertCircle, Building2, Settings, QrCode } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://odinoder-api.onrender.com';
import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function App() {
  const [tenantId, setTenantId] = useState<string | null>(localStorage.getItem('admin_tenantId'));
  const [tenantName, setTenantName] = useState<string | null>(localStorage.getItem('admin_tenantName'));
  const [availableStores, setAvailableStores] = useState<any[]>([]);
  const [newStoreName, setNewStoreName] = useState('');

  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'settings' | 'qrcodes' | 'inventory'>('orders');
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [rawMaterials, setRawMaterials] = useState<any[]>([]);
  const [newMaterial, setNewMaterial] = useState({ name: '', stock: '', unit: 'g', safetyStock: '10', barcode: '' });
  const [scanBarcode, setScanBarcode] = useState('');
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [tables, setTables] = useState<string[]>([]);
  const [newTable, setNewTable] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 取得可登入的門市列表
  useEffect(() => {
    if (!tenantId) {
      fetch(`${API_BASE}/tenants`)
        .then(res => res.json())
        .then(setAvailableStores)
        .catch(e => console.error(e));
    }
  }, [tenantId]);

  // 新增門市
  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/tenants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newStoreName })
      });
      const newStore = await res.json();
      setAvailableStores([newStore, ...availableStores]);
      setNewStoreName('');
      alert('門市建立成功！');
    } catch (e) {
      alert('建立失敗');
    }
  };

  // 登入
  const handleLogin = (store: any) => {
    localStorage.setItem('admin_tenantId', store.id);
    localStorage.setItem('admin_tenantName', store.name);
    setTenantId(store.id);
    setTenantName(store.name);
  };

  // 刪除門市
  const handleDeleteStore = async (storeId: string) => {
    if (window.confirm('確定要刪除此門市嗎？此動作將連同該門市所有商品與訂單一併刪除，且無法復原！')) {
      try {
        await fetch(`${API_BASE}/tenants/${storeId}`, { method: 'DELETE' });
        setAvailableStores(availableStores.filter(s => s.id !== storeId));
      } catch (e) {
        alert('刪除失敗');
      }
    }
  };

  // 登出
  
  const fetchRawMaterials = async () => {
    if(!tenantId) return;
    try {
      const res = await fetch(`${API_BASE}/raw-materials/tenant/${tenantId}`);
      setRawMaterials(await res.json());
    } catch(e) {}
  };

  useEffect(() => {
    if (activeTab === 'inventory') fetchRawMaterials();
  }, [activeTab, tenantId]);

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/raw-materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newMaterial, stock: Number(newMaterial.stock), safetyStock: Number(newMaterial.safetyStock), tenantId })
      });
      if(res.ok) {
        setNewMaterial({ name: '', stock: '', unit: 'g', safetyStock: '10', barcode: '' });
        fetchRawMaterials();
        alert('原物料新增成功！');
      }
    } catch(e){}
  };

  const handleDeleteMaterial = async (id: string) => {
    if(!confirm('確定刪除此原物料？')) return;
    try {
      await fetch(`${API_BASE}/raw-materials/${id}`, { method: 'DELETE' });
      fetchRawMaterials();
    } catch(e){}
  };

  const handleUpdateStoreProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/tenants/${tenantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tenantName })
      });
      if(res.ok) {
        localStorage.setItem('admin_tenantName', tenantName || '');
        alert('門市資料已更新！');
      }
    } catch(e) {}
  };
  
  const handleLogout = () => {
    localStorage.removeItem('admin_tenantId');
    localStorage.removeItem('admin_tenantName');
    setTenantId(null);
  };

  // 原本抓取資料的邏輯改依賴 tenantId
  useEffect(() => {
    if (!tenantId) return;
    const fetchTenantDetails = async () => {
      try {
        const res = await fetch(`${API_BASE}/tenants/${tenantId}`);
        const data = await res.json();
        if (data.tables && data.tables.length > 0) {
          setTables(data.tables);
        } else {
          // If empty, sync default
          const defaultTables = ['1', '2', '3'];
          setTables(defaultTables);
          fetch(`${API_BASE}/tenants/${tenantId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tables: defaultTables })
          });
        }
      } catch (e) {}
    };
    fetchTenantDetails();

    const fetchProducts = async () => {
      const res = await fetch(`${API_BASE}/products/tenant/${tenantId}`);
      setProducts(await res.json());
    };
    

  const fetchOrders = async () => {
      const res = await fetch(`${API_BASE}/orders/tenant/${tenantId}`);
      setOrders(await res.json());
    };
    fetchProducts();
    fetchOrders();
  }, [tenantId]);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEditing = !!editingProduct.id;
      const url = isEditing ? `${API_BASE}/products/${editingProduct.id}` : `${API_BASE}/products`;
      const method = isEditing ? 'PATCH' : 'POST';
      
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tenantId, // 使用動態的 tenantId
          name: editingProduct.name, 
          category: editingProduct.category || '未分類',
          price: Number(editingProduct.price),
          imageUrl: editingProduct.imageUrl
        })
      });
      setEditingProduct(null);
      // 重新整理列表
      const res = await fetch(`${API_BASE}/products/tenant/${tenantId}`);
      setProducts(await res.json());
    } catch (e) {}
  };

  if (!tenantId) {
    return (
      <div className="min-h-screen bg-[#f7f6f3] flex items-center justify-center p-4 font-sans text-slate-800">
        <div className="bg-white border border-[#e9e9e7] rounded-lg shadow-sm w-full max-w-4xl flex overflow-hidden min-h-[500px]">
          <div className="w-1/2 bg-[#f7f6f3] text-[#37352f] p-12 border-r border-[#e9e9e7] flex flex-col justify-center">
            <h1 className="text-4xl font-black mb-4">營運總部 總營運管理</h1>
            <p className="text-[#787774] leading-relaxed font-medium">歡迎回到雲端 SaaS 門市管理系統。請在右側選擇您要管理的門市，或是建立全新的餐飲品牌據點。</p>
          </div>
          <div className="w-1/2 p-12 flex flex-col h-[500px] overflow-auto">
            <h2 className="text-2xl font-black text-[#37352f] mb-6">選擇門市登入</h2>
            <div className="space-y-3 flex-1">
              {availableStores.length === 0 ? <p className="text-sm text-gray-400">目前尚無任何門市資料</p> : availableStores.map(store => (
                <div key={store.id} className="w-full flex items-center justify-between px-5 py-4 border border-[#e9e9e7] rounded-lg hover:border-[#37352f] hover:bg-[#f7f6f3] transition group">
                  <div className="flex-1 cursor-pointer" onClick={() => handleLogin(store)}>
                    <p className="font-bold text-[#37352f] group-hover:text-[#37352f]">{store.name}</p>
                    <p className="text-xs text-gray-400 font-mono mt-1">ID: {store.id.split('-')[0].toUpperCase()}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-[#37352f] text-sm font-bold opacity-0 group-hover:opacity-100 transition cursor-pointer" onClick={() => handleLogin(store)}>登入 ➔</span>
                    <button onClick={() => handleDeleteStore(store.id)} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition" title="刪除門市">
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-8 border-t border-[#e9e9e7]">
              <h3 className="text-sm font-bold text-[#9a9a97] mb-3">或者建立新門市：</h3>
              <form onSubmit={handleCreateStore} className="flex space-x-2">
                <input type="text" placeholder="輸入新門市名稱" value={newStoreName} onChange={e => setNewStoreName(e.target.value)} required className="flex-1 border border-[#e9e9e7] px-4 py-2.5 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                <button type="submit" className="bg-gray-900 text-[#37352f] px-5 py-2.5 rounded-md font-bold text-sm shadow-md hover:bg-black transition active:scale-95">註冊</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 已經登入後的渲染...

  // 處理上傳圖示 (轉成 Base64)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingProduct({ ...editingProduct, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
  const completedOrders = orders.filter(o => o.status === 'COMPLETED').length;

  // 根據真實資料動態產生圖表 (按日期分組)
  const generateChartData = () => {
    const grouped: Record<string, number> = {};
    orders.forEach(o => {
      const date = new Date(o.createdAt).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' });
      grouped[date] = (grouped[date] || 0) + Number(o.totalAmount || 0);
    });
    const data = Object.keys(grouped).map(date => ({ name: date, sales: grouped[date] }));
    return data.length > 0 ? data : [{ name: '今日', sales: 0 }];
  };
  const chartData = generateChartData();

  return (
    <div className="flex h-screen bg-[#F4F7FE] font-sans text-[#37352f] overflow-hidden">
      {/* 左側 Sidebar 導覽 - 商用風格 */}
      <aside className="w-64 bg-white shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col z-20 print:hidden">
        <div className="h-20 flex items-center px-8 border-b border-[#e9e9e7]">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-[#37352f] font-black text-lg mr-3 shadow-md shadow-blue-200">O</div>
          <h1 className="text-xl font-black text-[#37352f] tracking-tight">營運總部</h1>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-2">
          <p className="px-4 text-xs font-bold text-gray-400 tracking-wider mb-2">營運管理</p>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center px-4 py-3 rounded-md font-bold transition-all ${activeTab === 'orders' ? 'bg-blue-600 text-[#37352f] shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-[#37352f]'}`}>
             營業數據分析
          </button>
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`w-full flex items-center px-4 py-3 rounded-md font-bold transition-all ${activeTab === 'inventory' ? 'bg-blue-600 text-[#37352f] shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-[#37352f]'}`}>
            <Package size={20} className="mr-3" /> 原物料庫存
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center px-4 py-3 rounded-md font-bold transition-all ${activeTab === 'products' ? 'bg-blue-600 text-[#37352f] shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-[#37352f]'}`}>
             商品目錄庫
          </button>
          <button 
            onClick={() => setActiveTab('qrcodes')}
            className={`w-full flex items-center px-4 py-3 rounded-md font-bold transition-all ${activeTab === 'qrcodes' ? 'bg-blue-600 text-[#37352f] shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-[#37352f]'}`}>
             桌位QR列印
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center px-4 py-3 rounded-md font-bold transition-all ${activeTab === 'settings' ? 'bg-blue-600 text-[#37352f] shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-[#37352f]'}`}>
             系統設定
          </button>
        </div>

        <div className="px-4 mb-4 mt-auto">
          <button 
            onClick={() => {
              const rawConsumerUrl = import.meta.env.VITE_CONSUMER_URL || 'http://localhost:3001';
              const consumerUrl = (rawConsumerUrl.endsWith('/') ? rawConsumerUrl.slice(0, -1) : rawConsumerUrl) + `/?store=${tenantId}`;
              navigator.clipboard.writeText(consumerUrl);
              alert('已複製消費者專屬點餐網址！\n\n' + consumerUrl);
            }}
            className="w-full flex items-center justify-center px-4 py-3 bg-blue-600/20 text-blue-400 rounded-md font-bold hover:bg-blue-600/30 transition shadow-sm border border-[#37352f]/30 active:scale-95 text-sm">
            🔗 複製專屬點餐網址
          </button>
        </div>

        <div className="p-4 border-t border-[#e9e9e7]">
          <div className="bg-white rounded-md p-3 flex items-center space-x-3 border border-[#e9e9e7] shadow-sm">
            <img src="https://ui-avatars.com/api/?name=Admin&background=1e3a8a&color=fff" alt="avatar" className="w-10 h-10 rounded-full shadow-sm" />
            <div>
              <p className="text-sm font-bold text-[#37352f]">系統管理員</p>
              <p className="text-xs text-[#9a9a97] font-medium">{tenantName || '未命名門市'}</p>
              <button onClick={handleLogout} className="text-xs text-[#37352f] hover:text-[#37352f] font-bold mt-1 underline">切換門市</button>
            </div>
          </div>
        </div>
      </aside>

      {/* 右側主要內容區塊 */}
      <main className="flex-1 flex flex-col h-full overflow-auto">
        <header className="h-20 bg-white sticky top-0 flex items-center justify-between px-8 z-10 border-b border-[#e9e9e7]">
          <h2 className="text-xl font-bold text-[#37352f]">
            {activeTab === 'orders' ? '營業數據分析 (Dashboard)' : activeTab === 'products' ? '商品目錄庫 (Products)' : activeTab === 'inventory' ? '原物料庫存 (Inventory)' : '系統設定 (Settings)'}
          </h2>
          <div className="flex items-center space-x-4">
            <button onClick={() => alert('目前沒有新的系統通知！')} className="relative w-10 h-10 bg-white border border-[#e9e9e7] rounded-full flex items-center justify-center text-[#9a9a97] shadow-sm hover:bg-gray-50 transition active:scale-95">
              🔔<span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        <div className="p-8">
          {activeTab === 'inventory' && (
            <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl mx-auto">
              <div className="mb-6 flex justify-between items-end">
                <div>
                  <h3 className="text-2xl font-black text-[#37352f]">進銷存：原物料管理</h3>
                  <p className="text-sm text-[#9a9a97] mt-1">管理各項原物料的目前庫存與安全庫存警報水位。</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-200 mb-8 bg-[#f7f6f3]/30">
                  <h4 className="font-bold text-[#37352f] mb-4 flex items-center"><QrCode size={18} className="mr-2"/> 條碼快速進貨 (Barcode Scanner)</h4>
                  <form onSubmit={handleScanSubmit} className="flex space-x-3">
                    <input type="text" value={scanBarcode} onChange={e => setScanBarcode(e.target.value)} placeholder="請將游標停在此處，並使用條碼掃描槍刷入..." className="flex-1 border border-blue-200 px-4 py-3 rounded-md font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-inner" autoFocus />
                    <button type="submit" className="bg-blue-600 text-[#37352f] px-6 py-3 rounded-md font-bold shadow-md hover:bg-[#2f2e2a] active:scale-95">送出條碼</button>
                  </form>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border border-[#e9e9e7] mb-8">
                <h4 className="font-bold text-[#37352f] mb-4">新增原物料</h4>
                <form onSubmit={handleCreateMaterial} className="flex space-x-4 items-end">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-[#9a9a97] mb-1.5">物料名稱 (例如: 牛奶, 珍珠)</label>
                    <input type="text" value={newMaterial.name} onChange={e => setNewMaterial({...newMaterial, name: e.target.value})} className="w-full border border-[#e9e9e7] bg-gray-50 px-4 py-2.5 rounded-md font-medium focus:outline-none focus:bg-white focus:border-[#37352f]" required/>
                  </div>
                  <div className="w-24">
                    <label className="block text-xs font-bold text-[#9a9a97] mb-1.5">當前庫存量</label>
                    <input type="number" value={newMaterial.stock} onChange={e => setNewMaterial({...newMaterial, stock: e.target.value})} className="w-full border border-[#e9e9e7] bg-gray-50 px-4 py-2.5 rounded-md font-medium focus:outline-none focus:bg-white focus:border-[#37352f]" required/>
                  </div>
                  <div className="w-24">
                    <label className="block text-xs font-bold text-[#9a9a97] mb-1.5">單位</label>
                    <input type="text" value={newMaterial.unit} onChange={e => setNewMaterial({...newMaterial, unit: e.target.value})} className="w-full border border-[#e9e9e7] bg-gray-50 px-4 py-2.5 rounded-md font-medium focus:outline-none focus:bg-white focus:border-[#37352f]" required/>
                  </div>
                  <div className="w-32">
                    <label className="block text-xs font-bold text-[#9a9a97] mb-1.5">安全警報水位</label>
                    <input type="number" value={newMaterial.safetyStock} onChange={e => setNewMaterial({...newMaterial, safetyStock: e.target.value})} className="w-full border border-[#e9e9e7] bg-gray-50 px-4 py-2.5 rounded-md font-medium focus:outline-none focus:bg-white focus:border-[#37352f]" required/>
                  </div>
                  <button type="submit" className="bg-blue-600 text-[#37352f] px-6 py-2.5 rounded-md font-bold shadow-md hover:bg-[#2f2e2a] active:scale-95 mb-[2px]">
                    + 新增物料
                  </button>
                </form>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-[#e9e9e7]">
                <h4 className="font-bold text-[#37352f] mb-4">現有庫存列表</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rawMaterials.map(m => {
                    const isLowStock = Number(m.stock) <= Number(m.safetyStock);
                    return (
                      <div key={m.id} className={`p-4 rounded-md border flex justify-between items-center transition ${isLowStock ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-[#e9e9e7]'}`}>
                        <div>
                          <h5 className="font-black text-[#37352f] text-lg flex items-center">
                            {m.name} 
                            {isLowStock && <AlertCircle size={16} className="text-red-500 ml-2" />}
                          </h5>
                          <p className="text-xs text-[#9a9a97] font-bold mt-1">安全水位: {m.safetyStock} {m.unit}</p>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <span className={`text-2xl font-black ${isLowStock ? 'text-red-600' : 'text-[#37352f]'}`}>
                            {m.stock} <span className="text-sm">{m.unit}</span>
                          </span>
                          <button onClick={() => handleDeleteMaterial(m.id)} className="text-xs text-red-500 font-bold hover:underline mt-2">移除</button>
                        </div>
                      </div>
                    );
                  })}
                  {rawMaterials.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-400 font-medium">目前尚未建立任何原物料</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl mx-auto">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-2xl font-black text-[#37352f]">商品目錄管理</h3>
                  <p className="text-sm text-[#9a9a97] mt-1">在這裡新增或修改您的門市菜單與商品圖片。</p>
                </div>
                <button 
                  onClick={() => setEditingProduct({ name: '', price: '' })}
                  className="bg-blue-600 text-[#37352f] px-6 py-2.5 rounded-md font-bold hover:bg-[#2f2e2a] transition shadow-lg shadow-blue-200 active:scale-95">
                  ➕ 新增商品
                </button>
              </div>

              {/* 編輯/新增商品 Modal 表單 (直接內嵌展開) */}
              {editingProduct && (
                <div className="bg-white p-6 rounded-lg shadow-lg border border-blue-100 ring-4 ring-blue-50 relative animate-in slide-in-from-top-4">
                  <button onClick={() => setEditingProduct(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-black">✕</button>
                  <h4 className="text-lg font-bold text-[#37352f] mb-4">{editingProduct.id ? '編輯商品資料' : '建立新商品'}</h4>
                  
                  <form onSubmit={handleSaveProduct} className="flex space-x-6">
                    {/* 上傳圖片按鈕 */}
                    <div className="shrink-0 flex flex-col items-center justify-center">
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 cursor-pointer hover:bg-gray-100 overflow-hidden relative group transition">
                        {editingProduct.imageUrl ? (
                          <img src={editingProduct.imageUrl} alt="preview" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl text-gray-400 group-hover:scale-110 transition">📷</span>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                          <span className="text-[#37352f] text-xs font-bold">更換圖片</span>
                        </div>
                      </div>
                      <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                    </div>

                    <div className="flex-1 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-[#9a9a97] mb-1.5">分類 (Category)</label>
          <input type="text" className="w-full border border-[#e9e9e7] bg-gray-50 px-4 py-2.5 rounded-md focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-medium transition" value={editingProduct.category || ''} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})} placeholder="主食, 飲料" required/>
        </div>
        <div>
          <label className="block text-xs font-bold text-[#9a9a97] mb-1.5">商品名稱</label>
                        <input type="text" className="w-full border border-[#e9e9e7] bg-gray-50 px-4 py-2.5 rounded-md focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-medium transition" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} required/>
        </div>
      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#9a9a97] mb-1.5">標準售價 (NT$)</label>
                        <input type="number" className="w-full border border-[#e9e9e7] bg-gray-50 px-4 py-2.5 rounded-md focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-medium transition" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: e.target.value})} required/>
                      </div>
                    </div>
                    
                    <div className="shrink-0 flex items-end">
                      <button type="submit" className="bg-gray-900 text-[#37352f] px-8 py-3 rounded-md font-bold hover:bg-black transition shadow-md active:scale-95 h-[46px]">
                        儲存變更
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* 商品列表 Data Table */}
              <div className="bg-white rounded-lg shadow-sm border border-[#e9e9e7] overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-[#e9e9e7] text-xs font-bold text-[#9a9a97] uppercase tracking-wider">
                      <th className="py-4 px-6 w-20">圖示</th>
                      <th className="py-4 px-6">商品名稱 (Name)</th>
                      <th className="py-4 px-6">SKU (ID)</th>
                      <th className="py-4 px-6 text-right">標準售價 (Price)</th>
                      <th className="py-4 px-6 text-center w-28">操作 (Action)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {products.length === 0 ? (
                      <tr><td colSpan={5} className="py-12 text-center text-gray-400 font-medium">系統目前沒有任何商品</td></tr>
                    ) : products.map(p => (
                      <tr key={p.id} className="hover:bg-[#f7f6f3]/50 transition-colors group">
                        <td className="py-3 px-6">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 border border-[#e9e9e7] flex items-center justify-center overflow-hidden">
                            {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" /> : <span className="text-gray-400 text-xs">無圖</span>}
                          </div>
                        </td>
                        <td className="py-3 px-6 font-bold text-[#37352f]">{p.name}</td>
                        <td className="py-3 px-6 text-xs text-gray-400 font-mono">{p.id.split('-')[0].toUpperCase()}</td>
                        <td className="py-3 px-6 font-black text-[#37352f] text-right">NT$ {p.price}</td>
                        <td className="py-3 px-6 text-center">
                          <button onClick={() => setEditingProduct(p)} className="text-[#37352f] hover:text-[#37352f] bg-[#f7f6f3] hover:bg-blue-100 px-4 py-1.5 rounded-lg text-xs font-bold transition">
                            編輯
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-in fade-in duration-300 max-w-6xl mx-auto">
              {/* 營業數據圖表 */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-sm border border-[#e9e9e7]">
                  <div className="mb-6 flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-bold text-[#37352f]">營業額趨勢 (Revenue Trend)</h2>
                      <p className="text-xs text-[#9a9a97] mt-1">近七日歷史營收分析</p>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                      <Bar dataKey="sales" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-700 to-indigo-800 p-6 rounded-lg shadow-lg shadow-blue-900/20 text-[#37352f] flex flex-col justify-center relative overflow-hidden h-[155px]">
                    <div className="relative z-10">
                      <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-2">本日總營業額</p>
                      <p className="text-4xl font-black">NT$ {totalRevenue}</p>
                    </div>
                    <div className="absolute -right-6 -bottom-6 text-9xl opacity-10">💰</div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-[#e9e9e7] h-[155px] flex flex-col justify-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">出餐達成率</p>
                    <p className="text-3xl font-black text-[#37352f]">
                      {orders.length > 0 ? Math.round((completedOrders / orders.length) * 100) : 0}% 
                      <span className="text-sm text-gray-400 ml-2 font-bold">({completedOrders}/{orders.length}筆)</span>
                    </p>
                    <div className="w-full bg-gray-100 h-2 rounded-full mt-4 overflow-hidden">
                      <div className="bg-green-500 h-full rounded-full transition-all duration-1000" style={{ width: `${orders.length > 0 ? (completedOrders / orders.length) * 100 : 0}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 歷史訂單列表 */}
              <section className="bg-white p-6 rounded-lg shadow-sm border border-[#e9e9e7]">
                <h2 className="text-lg font-bold text-[#37352f] mb-6">即時訂單流 (Order Stream)</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#e9e9e7] text-xs font-bold text-[#9a9a97] uppercase tracking-wider bg-gray-50">
                        <th className="py-4 px-6 rounded-tl-lg">訂單編號 (Order ID)</th>
                        <th className="py-4 px-6">時間 (Time)</th>
                        <th className="py-4 px-6">狀態 (Status)</th>
                        <th className="py-4 px-6">總金額 (Total)</th>
                        <th className="py-4 px-6 rounded-tr-lg">訂單明細 (Items)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {orders.length === 0 ? (
                        <tr><td colSpan={5} className="py-12 text-center text-gray-400 font-medium">目前尚無資料</td></tr>
                      ) : orders.map(o => (
                        <tr key={o.id} className="hover:bg-gray-50 transition">
                          <td className="py-4 px-6 font-mono text-sm font-bold text-gray-700">#{o.id.split('-')[0].toUpperCase()}</td>
                          <td className="py-4 px-6 text-sm text-[#9a9a97] font-medium">{new Date(o.createdAt).toLocaleString()}</td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 rounded-full font-bold text-xs ${o.status === 'COMPLETED' ? 'bg-green-100 text-green-700 border border-green-200' : o.status === 'PREPARING' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-orange-100 text-orange-700 border border-orange-200'}`}>
                              {o.status === 'COMPLETED' ? '已完成' : o.status === 'PREPARING' ? '準備中' : '等待接單'}
                            </span>
                          </td>
                          <td className="py-4 px-6 font-black text-[#37352f]">NT$ {o.totalAmount}</td>
                          <td className="py-4 px-6 text-xs text-[#9a9a97] font-medium leading-relaxed">
                            {o.items?.map((i: any) => `${i.product?.name || '未知商品'} x${i.quantity}`).join(', ')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}
          
          {activeTab === 'qrcodes' && (
            <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl mx-auto print:max-w-none print:m-0 print:p-0">
              <div className="mb-6 flex justify-between items-end print:hidden">
                <div>
                  <h3 className="text-2xl font-black text-[#37352f]">桌位 QR Code 管理</h3>
                  <p className="text-sm text-[#9a9a97] mt-1">大量產生專屬桌號條碼，供門市列印與佈置</p>
                </div>
                <div className="flex space-x-3">
                  <form onSubmit={async (e) => { 
                      e.preventDefault(); 
                      if(newTable) { 
                        const nt = [...tables, newTable];
                        setTables(nt); 
                        setNewTable(''); 
                        await fetch(`${API_BASE}/tenants/${tenantId}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ tables: nt })
                        });
                      } 
                    }} className="flex">
                    <input type="text" placeholder="新增桌號..." value={newTable} onChange={e => setNewTable(e.target.value)} className="border border-[#e9e9e7] px-3 py-2 rounded-l-xl text-sm focus:outline-none focus:border-[#37352f] w-32" />
                    <button type="submit" className="bg-gray-100 px-4 py-2 text-sm font-bold border border-l-0 border-[#e9e9e7] rounded-r-xl hover:bg-gray-200">新增</button>
                  </form>
                  <button onClick={() => window.print()} className="bg-blue-600 text-[#37352f] px-6 py-2 rounded-md font-bold shadow-md hover:bg-[#2f2e2a] active:scale-95">
                    🖨️ 列印全部
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-8 print:grid-cols-4 print:gap-4 print:w-full">
                {tables.map(table => (
                  <div key={table} className="bg-white p-6 rounded-lg shadow-sm border border-[#e9e9e7] flex flex-col items-center print:border-gray-400 print:shadow-none print:p-4">
                    <p className="text-2xl font-black text-[#37352f] mb-4 tracking-widest">{table}桌</p>
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`${(import.meta.env.VITE_CONSUMER_URL || 'http://localhost:3001').replace(/\/$/, '')}/?store=${tenantId}&table=${table}`)}`} 
                      alt={`Table ${table} QR`}
                      className="w-48 h-48 print:w-40 print:h-40"
                    />
                    <p className="text-xs text-gray-400 mt-4 text-center break-all px-2 print:text-[10px] print:text-black">
                      掃描此條碼開始點餐
                    </p>
                    <button onClick={async () => {
                        const nt = tables.filter(t => t !== table);
                        setTables(nt);
                        await fetch(`${API_BASE}/tenants/${tenantId}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ tables: nt })
                        });
                      }} className="mt-4 text-xs text-red-500 font-bold hover:underline print:hidden">
                      移除此桌號
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}


          {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto">
              <div className="mb-6">
                <h3 className="text-2xl font-black text-[#37352f]">系統設定</h3>
                <p className="text-sm text-[#9a9a97] mt-1">管理<Settings size={20} className="mr-3" /> 門市基本資料與硬體設備連線狀態。</p>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-sm border border-[#e9e9e7] space-y-8">
                <form onSubmit={handleUpdateStoreProfile} className="mb-8">
                  <h4 className="text-lg font-bold text-[#37352f] mb-4 flex items-center"><Building2 size={20} className="mr-2 text-[#37352f]" /> <Settings size={20} className="mr-3" /> 門市基本資料維護</h4>
                  <div className="flex flex-col space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">門市名稱</label>
                      <input type="text" value={tenantName || ''} onChange={e => setTenantName(e.target.value)} className="w-full border border-[#e9e9e7] bg-white px-4 py-2.5 rounded-md font-medium focus:outline-none focus:border-[#37352f]" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">營業狀態</label>
                      <select className="w-full border border-[#e9e9e7] bg-white px-4 py-2.5 rounded-md font-medium focus:outline-none focus:border-[#37352f]">
                        <option value="open">🟢 正常營業中</option>
                        <option value="closed">🔴 暫停營業 (打烊)</option>
                      </select>
                    </div>
                    <button type="submit" className="bg-gray-900 text-[#37352f] px-6 py-2.5 rounded-md font-bold shadow-md hover:bg-black active:scale-95 w-32 mt-2">
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

