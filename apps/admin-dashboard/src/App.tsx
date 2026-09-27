import { History, Search, Package, AlertCircle, Building2, Settings, QrCode, CheckCircle, Clock, ShoppingCart, Plus, Minus } from 'lucide-react';
import { io } from 'socket.io-client';

const rawApiUrl = import.meta.env.VITE_API_URL || 'https://odinoder-api.onrender.com';
const API_BASE = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;
import React, { useState, useEffect, useRef } from 'react';


export default function App() {
  const [tenantId, setTenantId] = useState<string | null>(localStorage.getItem('admin_tenantId'));
  const [tenantName, setTenantName] = useState<string | null>(localStorage.getItem('admin_tenantName'));
  const [shiftData, setShiftData] = useState<any>({ total: 0, orderCount: 0 });
  const [availableStores, setAvailableStores] = useState<any[]>([]);
  const [newStoreName, setNewStoreName] = useState('');

  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'settings' | 'qrcodes' | 'inventory' | 'pos' | 'history'>('orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [tenderedAmount, setTenderedAmount] = useState<number | ''>('');
  const [taxId, setTaxId] = useState('');
  const [isAwaitingPayment, setIsAwaitingPayment] = useState(false);
  const [paymentStatusMsg, setPaymentStatusMsg] = useState('');
  const [mobileBarcode, setMobileBarcode] = useState('');
  const [cart, setCart] = useState<{product: any, quantity: number}[]>([]);
  const [walkInTable, setWalkInTable] = useState('外帶');
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [rawMaterials, setRawMaterials] = useState<any[]>([]);
  const [newMaterial, setNewMaterial] = useState({ name: '', stock: '', unit: 'g', safetyStock: '10', barcode: '' });
  const [scanBarcode, setScanBarcode] = useState('');
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [tables, setTables] = useState<string[]>([]);
  const [presetTags, setPresetTags] = useState<string>('少冰,去冰,熱,無糖,微糖,半糖,加辣,不加蔥,不加香菜');
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

  
  const handleCloseShift = async () => {
    if (!window.confirm('確定要執行交班結算嗎？這會結算當前的營收並開啟新的班表，此操作無法復原。')) return;
    try {
      const res = await fetch(`${API_BASE}/tenants/${tenantId}/close-shift`, { method: 'POST' });
      if (res.ok) {
        alert('結班成功！已封存當前營收，系統重新開始計算下一班的帳務。');
        // Refresh shift data
        const shiftRes = await fetch(`${API_BASE}/tenants/${tenantId}/active-shift`);
        setShiftData(await shiftRes.json());
      }
    } catch(e) {
      alert('結班失敗');
    }
  };

  const handleUpdateStoreProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/tenants/${tenantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tenantName, presetTags: presetTags.split(',').map(s => s.trim()).filter(Boolean) })
      });
      if(res.ok) {
        localStorage.setItem('admin_tenantName', tenantName || '');
        alert('門市資料已更新！');
      }
    } catch(e) {}
  };
  
  
  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!scanBarcode) return;
    const item = rawMaterials.find(rm => rm.barcode === scanBarcode);
    if (item) {
      const addAmt = window.prompt(`找到物料 [${item.name}] (目前庫存: ${item.stock} ${item.unit})\n請輸入要進貨的數量:`);
      if(addAmt && !isNaN(Number(addAmt))) {
        try {
          await fetch(`${API_BASE}/raw-materials/${item.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stock: item.stock + Number(addAmt) })
          });
          fetchRawMaterials();
        } catch(err) {}
      }
    } else {
      alert('系統找不到此條碼！請在下方新增該原物料。');
      setNewMaterial({...newMaterial, barcode: scanBarcode});
    }
    setScanBarcode('');
  };
  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        return { ...item, quantity: Math.max(0, item.quantity + delta) };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  
  const handlePOSCheckout = () => {
    if (cart.length === 0) return;
    setTenderedAmount(cartTotal);
    setPaymentMethod('cash');
    setTaxId('');
    setShowCheckoutModal(true);
    setIsAwaitingPayment(false);
    setPaymentStatusMsg('');
    setMobileBarcode('');
  };

  
  const finalizeOrder = async () => {
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          tableNumber: walkInTable,
          orderType: 'POS',
          totalAmount: cartTotal,
          status: 'PENDING',
          items: cart.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            subtotal: Number(item.product.price) * item.quantity
          }))
        })
      });
      if(res.ok) {
        setCart([]);
        setShowCheckoutModal(false);
        setIsAwaitingPayment(false);
        alert('結帳成功！收據已列印，訂單已送至廚房看板。');
        setActiveTab('orders');
      }
    } catch(e) {
      alert('系統異常，無法建立訂單');
      setIsAwaitingPayment(false);
    }
  };

  const submitCheckout = async () => {
    if (paymentMethod === 'credit') {
      setIsAwaitingPayment(true);
      setPaymentStatusMsg('正在嘗試連線至實體刷卡機 (COM Port)...');
      
      // 正規實體刷卡機 (EDC) 連線邏輯：透過本機 WebSocket 中介程式與硬體溝通
      try {
        const ws = new WebSocket('ws://127.0.0.1:9090'); // 本機刷卡機中介程式標準 Port
        
        // 設定 3 秒連線超時，如果沒接機器會報錯
        const timeout = setTimeout(() => {
          ws.close();
          alert('實體刷卡機連線逾時！請確認刷卡機已開機，且 USB/COM 傳輸線已正確連接。');
          setIsAwaitingPayment(false);
        }, 3000);

        ws.onopen = () => {
          clearTimeout(timeout);
          setPaymentStatusMsg('請引導客人在刷卡機上感應或插入信用卡...');
          // 傳送標準 ECR 交易指令 (SALE)
          ws.send(JSON.stringify({ action: 'SALE', amount: cartTotal, taxId }));
        };
        
        ws.onmessage = (e) => {
          const response = JSON.parse(e.data);
          if (response.status === 'SUCCESS') {
            setPaymentStatusMsg('刷卡成功！正在列印簽單與收據...');
            finalizeOrder();
          } else {
            alert('交易失敗：' + (response.message || '卡片餘額不足或異常'));
            setIsAwaitingPayment(false);
          }
        };
        
        ws.onerror = () => {
          clearTimeout(timeout);
          alert('無法偵測到實體刷卡機！\n(若為測試環境，請確認本地端 EDC 中介服務是否有啟動)');
          setIsAwaitingPayment(false);
        };
      } catch(e) {
        alert('刷卡機服務未啟動');
        setIsAwaitingPayment(false);
      }
      return;
    }

    if (paymentMethod === 'mobile') {
      if (!mobileBarcode) return alert('請掃描客人的付款條碼！');
      setIsAwaitingPayment(true);
      setPaymentStatusMsg('正在向 LINE Pay / 街口支付 伺服器發送扣款請求...');
      
      // 正規行動支付 B2B API 呼叫 (通常是 POS 掃描客人條碼後，由後端發起扣款)
      try {
        // 實際商用環境中，這裡會呼叫後端的 /payments/scan 進行扣款
        const paymentRes = await fetch(`${API_BASE}/payments/scan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ barcode: mobileBarcode, amount: cartTotal })
        });
        
        // 由於我們尚未在後端輸入真實 LINE Pay API Key，這裡若回傳 404/500，會進入 catch 或非 ok 處理
        if (paymentRes.ok) {
          finalizeOrder();
        } else {
          alert('行動支付扣款失敗！API 金鑰未設定或條碼無效。');
          setIsAwaitingPayment(false);
        }
      } catch(e) {
        alert('行動支付伺服器連線失敗');
        setIsAwaitingPayment(false);
      }
      return;
    }

    // 現金結帳直接送出
    finalizeOrder();
  };



  const updateOrderStatus = async (id: string, status: string) => {
    try {
      await fetch(`${API_BASE}/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
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
          const shiftRes = await fetch(`${API_BASE}/tenants/${tenantId}/active-shift`);
          if (shiftRes.ok) {
            setShiftData(await shiftRes.json());
          }

        const res = await fetch(`${API_BASE}/tenants/${tenantId}`);
        const data = await res.json();
        if (data.presetTags) { setPresetTags(data.presetTags.join(',')); }
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
    try {
      const res = await fetch(`${API_BASE}/orders/tenant/${tenantId}`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch(err) {}
  };

  if (tenantId) {
    fetchProducts();
    fetchOrders();

    const socket = io(API_BASE);
    socket.on('connect', () => socket.emit('joinTenant', tenantId));
    socket.on('newOrder', (o) => setOrders(prev => [o, ...prev]));
    socket.on('orderStatusUpdated', (o) => setOrders(prev => prev.map(order => order.id === o.id ? o : order)));
    
    return () => { socket.disconnect(); };
  }  }, [tenantId]);

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
            <h1 className="text-4xl font-black mb-4 text-[#37352f]">{tenantName || 'Odinoder'} 營運總部</h1>
            <p className="text-[#787774] leading-relaxed font-medium">請選擇要登入的營運門市，或於下方新增門市據點以開始使用系統。</p>
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
                <button type="submit" className="bg-[#37352f] text-white px-5 py-2.5 rounded-md font-bold text-sm shadow-md hover:bg-black transition active:scale-95">註冊</button>
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
            className={`w-full flex items-center justify-center md:justify-start px-2 md:px-4 py-3 rounded-md font-bold transition-all ${activeTab === 'orders' ? 'bg-[#37352f] text-white shadow-sm' : 'text-[#9a9a97] hover:bg-[#efefef] hover:text-[#37352f]'}`}>
             營業數據分析
          </button>
            <button 
              onClick={() => setActiveTab('pos')}
              className={`w-full flex items-center justify-center md:justify-start px-2 md:px-4 py-3 rounded-md font-bold transition-all ${activeTab === 'pos' ? 'bg-[#37352f] text-white shadow-sm' : 'text-[#9a9a97] hover:bg-[#efefef] hover:text-[#37352f]'}`}>
              <ShoppingCart size={20} className="mr-3 shrink-0" /> <span className="hidden md:inline whitespace-nowrap">櫃檯收銀 (POS)</span>
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`w-full flex items-center justify-center md:justify-start px-2 md:px-4 py-3 rounded-md font-bold transition-all ${activeTab === 'history' ? 'bg-[#37352f] text-white shadow-sm' : 'text-[#9a9a97] hover:bg-[#efefef] hover:text-[#37352f]'}`}>
              <History size={20} className="mr-3 shrink-0" /> <span className="hidden md:inline whitespace-nowrap">歷史紀錄與查詢</span>
            </button>
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`w-full flex items-center justify-center md:justify-start px-2 md:px-4 py-3 rounded-md font-bold transition-all ${activeTab === 'inventory' ? 'bg-[#37352f] text-white shadow-sm' : 'text-[#9a9a97] hover:bg-[#efefef] hover:text-[#37352f]'}`}>
            <Package size={20} className="mr-3" /> 原物料庫存
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center justify-center md:justify-start px-2 md:px-4 py-3 rounded-md font-bold transition-all ${activeTab === 'products' ? 'bg-[#37352f] text-white shadow-sm' : 'text-[#9a9a97] hover:bg-[#efefef] hover:text-[#37352f]'}`}>
             商品目錄庫
          </button>
          <button 
            onClick={() => setActiveTab('qrcodes')}
            className={`w-full flex items-center justify-center md:justify-start px-2 md:px-4 py-3 rounded-md font-bold transition-all ${activeTab === 'qrcodes' ? 'bg-[#37352f] text-white shadow-sm' : 'text-[#9a9a97] hover:bg-[#efefef] hover:text-[#37352f]'}`}>
             桌位QR列印
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center justify-center md:justify-start px-2 md:px-4 py-3 rounded-md font-bold transition-all ${activeTab === 'settings' ? 'bg-[#37352f] text-white shadow-sm' : 'text-[#9a9a97] hover:bg-[#efefef] hover:text-[#37352f]'}`}>
             系統設定
          </button>
        </div>

        <div className="px-4 mb-4 mt-auto">
          <button 
            onClick={() => {
              const rawConsumerUrl = import.meta.env.VITE_CONSUMER_URL || 'https://odinoder.pages.dev';
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
            {activeTab === 'orders' ? '接單看板 (Kanban)' : activeTab === 'products' ? '商品目錄庫 (Products)' : activeTab === 'inventory' ? '原物料庫存 (Inventory)' : '系統設定 (Settings)'}
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

              <div className="bg-white p-6 rounded-lg shadow-sm border border-[#e9e9e7] mb-8 bg-[#f7f6f3]/30">
                  <h4 className="font-bold text-[#37352f] mb-4 flex items-center"><QrCode size={18} className="mr-2"/> 條碼快速進貨 (Barcode Scanner)</h4>
                  <form onSubmit={handleScanSubmit} className="flex space-x-3">
                    <input type="text" value={scanBarcode} onChange={e => setScanBarcode(e.target.value)} placeholder="請將游標停在此處，並使用條碼掃描槍刷入..." className="flex-1 border border-[#e9e9e7] px-4 py-3 rounded-md font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-inner" autoFocus />
                    <button type="submit" className="bg-[#37352f] text-white px-6 py-3 rounded-md font-bold shadow-md hover:bg-[#2f2e2a] active:scale-95">送出條碼</button>
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
                  <button type="submit" className="bg-[#37352f] text-white px-6 py-2.5 rounded-md font-bold shadow-md hover:bg-[#2f2e2a] active:scale-95 mb-[2px]">
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
                  className="bg-[#37352f] text-white px-6 py-2.5 rounded-md font-bold hover:bg-[#2f2e2a] transition shadow-lg shadow-blue-200 active:scale-95">
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
                      <button type="submit" className="bg-[#37352f] text-white px-8 py-3 rounded-md font-bold hover:bg-black transition shadow-md active:scale-95 h-[46px]">
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
                          <button onClick={() => setEditingProduct(p)} className="text-[#37352f] hover:text-[#37352f] bg-[#f7f6f3] hover:bg-[#e9e9e7] px-4 py-1.5 rounded-lg text-xs font-bold transition">
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
              <div className="animate-in fade-in duration-300 max-w-6xl mx-auto flex flex-col h-full">
                <div className="mb-6 flex justify-between items-end">
                  <div>
                    <h3 className="text-2xl font-black text-[#37352f]">收銀與接單作業</h3>
                    <p className="text-sm text-[#9a9a97] mt-1">即時處理顧客線上點餐、確認結帳與出餐進度</p>
                  </div>
                  <div className="flex space-x-4">
                    <div className="bg-white px-4 py-2 rounded-md shadow-sm border border-[#e9e9e7] flex flex-col items-center">
                      <span className="text-xs font-bold text-[#9a9a97]">今日營收</span>
                      <span className="text-lg font-black text-[#37352f]">NT$ {orders.filter(o => o.status === 'COMPLETED' && new Date(o.createdAt).toDateString() === new Date().toDateString()).reduce((sum, o) => sum + Number(o.totalAmount || 0), 0)}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 flex-1 items-start">
                  <div className="bg-[#f7f6f3] rounded-lg border border-[#e9e9e7] p-4 flex flex-col h-[70vh]">
                    <h4 className="font-bold text-[#37352f] mb-4 flex items-center"><AlertCircle size={18} className="mr-2 text-yellow-600"/> 待確認 (新訂單)</h4>
                    <div className="flex-1 overflow-auto space-y-4 pr-2">
                      {orders.filter(o => o.status === 'PENDING').map(order => (
                        <div key={order.id} className="bg-white p-4 rounded-md shadow-sm border border-[#e9e9e7]">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-black text-lg text-[#37352f]">{order.id.split('-')[0].toUpperCase()}</span>
                            <span className="text-xs font-bold bg-yellow-100 text-yellow-800 px-2 py-1 rounded">{order.tableNumber || (order.orderType === "DINE_IN" ? "內用" : (order.orderType === "TAKEOUT" ? "外帶" : order.orderType)) || "外帶"}</span>
                          </div>
                          <div className="text-sm text-[#37352f] mb-4 space-y-1">
                            {order.items?.map((item: any) => (
                              <div key={item.id} className="flex justify-between">
                                <span>{item.quantity}x {item.product?.name}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between items-center pt-3 border-t border-[#e9e9e7]">
                            <span className="font-black text-lg">NT$ {order.totalAmount}</span>
                            <button onClick={() => updateOrderStatus(order.id, 'PREPARING')} className="bg-[#37352f] text-white px-4 py-2 rounded font-bold text-sm hover:bg-[#2f2e2a]">確認接單</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#f7f6f3] rounded-lg border border-[#e9e9e7] p-4 flex flex-col h-[70vh]">
                    <h4 className="font-bold text-[#37352f] mb-4 flex items-center"><Clock size={18} className="mr-2 text-blue-600"/> 製作中 (未結帳)</h4>
                    <div className="flex-1 overflow-auto space-y-4 pr-2">
                      {orders.filter(o => o.status === 'PREPARING').map(order => (
                        <div key={order.id} className="bg-white p-4 rounded-md shadow-sm border border-[#e9e9e7]">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-black text-lg text-[#37352f]">{order.id.split('-')[0].toUpperCase()}</span>
                            <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded">{order.tableNumber || (order.orderType === "DINE_IN" ? "內用" : (order.orderType === "TAKEOUT" ? "外帶" : order.orderType)) || "外帶"}</span>
                          </div>
                          <div className="text-sm text-[#37352f] mb-4 space-y-1">
                            {order.items?.map((item: any) => (
                              <div key={item.id} className="flex justify-between">
                                <span>{item.quantity}x {item.product?.name}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between items-center pt-3 border-t border-[#e9e9e7]">
                            <span className="font-black text-lg text-[#37352f]">NT$ {order.totalAmount}</span>
                            <div className="flex space-x-2">
                              <button onClick={() => updateOrderStatus(order.id, 'VOIDED')} className="text-red-500 font-bold text-sm px-2 hover:underline">作廢</button>
                              <button onClick={() => updateOrderStatus(order.id, 'COMPLETED')} className="bg-[#37352f] text-white px-4 py-2 rounded font-bold text-sm hover:bg-[#2f2e2a]">結帳 / 出餐</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#f7f6f3] rounded-lg border border-[#e9e9e7] p-4 flex flex-col h-[70vh]">
                    <h4 className="font-bold text-[#37352f] mb-4 flex items-center"><CheckCircle size={18} className="mr-2 text-green-600"/> 已結帳 (出餐完畢)</h4>
                    <div className="flex-1 overflow-auto space-y-4 pr-2">
                      {orders.filter(o => o.status === 'COMPLETED').map(order => (
                        <div key={order.id} className="bg-white p-4 rounded-md shadow-sm border border-[#e9e9e7] opacity-60">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-black text-lg text-[#37352f]">{order.id.split('-')[0].toUpperCase()}</span>
                            <span className="text-xs font-bold bg-green-100 text-green-800 px-2 py-1 rounded">{order.tableNumber || (order.orderType === "DINE_IN" ? "內用" : (order.orderType === "TAKEOUT" ? "外帶" : order.orderType)) || "外帶"}</span>
                          </div>
                          <div className="flex justify-between items-center pt-2">
                            <span className="font-bold text-sm">NT$ {order.totalAmount}</span>
                            <span className="text-xs font-bold text-gray-400">{new Date(order.createdAt).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'pos' && (
              <div className="flex space-x-6 h-full max-w-7xl mx-auto animate-in fade-in duration-300">
                {/* 左側商品區 */}
                <div className="flex-1 bg-[#f7f6f3] p-4 md:p-6 rounded-lg border border-[#e9e9e7] overflow-auto h-auto lg:h-[80vh] min-h-[50vh]">
                  <h3 className="text-xl font-black text-[#37352f] mb-6">點餐區</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                    {products.map(p => (
                      <div key={p.id} onClick={() => !p.isSoldOut && addToCart(p)} className={`bg-white p-4 rounded-lg border border-[#e9e9e7] shadow-sm flex flex-col items-center justify-center text-center transition ${p.isSoldOut ? 'opacity-50 grayscale' : 'cursor-pointer hover:border-[#37352f] active:scale-95'}`}>
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="w-16 h-16 object-cover rounded-md mb-3" />
                        ) : (
                          <div className="w-16 h-16 bg-[#f7f6f3] rounded-md mb-3 flex items-center justify-center text-[#9a9a97] text-xs">無圖</div>
                        )}
                        <h4 className="font-bold text-[#37352f] text-sm mb-1">{p.name}</h4>
                        <span className="text-[#37352f] font-black">NT$ {p.price}</span>
                        {p.isSoldOut && <span className="text-xs text-red-500 font-bold mt-1">售完</span>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 右側購物車區 */}
                <div className="w-full lg:w-96 bg-white p-4 md:p-6 rounded-lg border border-[#e9e9e7] shadow-sm flex flex-col h-auto lg:h-[80vh] shrink-0">
                  <h3 className="text-xl font-black text-[#37352f] mb-4 flex items-center justify-between">
                    結帳明細
                    <span className="bg-[#f7f6f3] px-3 py-1 rounded text-sm text-[#9a9a97]">{cart.reduce((s, i)=>s+i.quantity,0)} 項</span>
                  </h3>
                  
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-[#9a9a97] mb-1">桌號 / 識別碼 (例如: 外帶, 3桌)</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {['外帶', '內用', ...tables].map(t => (
                        <button type="button" key={t} onClick={() => setWalkInTable(t)} className={`px-3 py-1.5 rounded-md text-xs font-bold border transition ${walkInTable === t ? 'bg-[#37352f] text-white border-[#37352f]' : 'bg-white text-[#37352f] border-[#e9e9e7] hover:bg-[#f7f6f3]'}`}>{t}</button>
                      ))}
                    </div>
                    <input type="text" value={walkInTable} onChange={e => setWalkInTable(e.target.value)} className="w-full border border-[#e9e9e7] bg-[#f7f6f3] px-3 py-2 rounded-md font-bold focus:outline-none focus:bg-white focus:border-[#37352f]" />
                  </div>

                  <div className="flex-1 overflow-auto space-y-3 pr-2 mb-4">
                    {cart.length === 0 ? (
                      <div className="text-center text-[#9a9a97] mt-10 text-sm font-medium">購物車是空的</div>
                    ) : cart.map(item => (
                      <div key={item.product.id} className="flex justify-between items-center py-2 border-b border-[#e9e9e7] last:border-0">
                        <div className="flex-1">
                          <h5 className="font-bold text-[#37352f] text-sm">{item.product.name}</h5>
                          <p className="text-xs text-[#9a9a97]">NT$ {item.product.price}</p>
                        </div>
                        <div className="flex items-center space-x-3 bg-[#f7f6f3] rounded-md px-2 py-1">
                          <button onClick={() => updateCartQuantity(item.product.id, -1)} className="text-[#9a9a97] hover:text-[#37352f]"><Minus size={16} /></button>
                          <span className="font-black text-sm text-[#37352f] w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateCartQuantity(item.product.id, 1)} className="text-[#9a9a97] hover:text-[#37352f]"><Plus size={16} /></button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-[#e9e9e7]">
                    <div className="flex justify-between items-end mb-6">
                      <span className="text-sm font-bold text-[#9a9a97]">總金額</span>
                      <span className="text-3xl font-black text-[#37352f]">NT$ {cartTotal}</span>
                    </div>
                    <button 
                      onClick={handlePOSCheckout}
                      disabled={cart.length === 0}
                      className={`w-full py-4 rounded-md font-bold text-lg transition ${cart.length > 0 ? 'bg-[#37352f] text-white hover:bg-[#2f2e2a] shadow-md active:scale-95' : 'bg-[#e9e9e7] text-[#9a9a97] cursor-not-allowed'}`}>
                      確認結帳
                    </button>
                  </div>
                </div>
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
                  <button onClick={() => window.print()} className="bg-[#37352f] text-white px-6 py-2 rounded-md font-bold shadow-md hover:bg-[#2f2e2a] active:scale-95">
                    🖨️ 列印全部
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-8 print:grid-cols-4 print:gap-4 print:w-full">
                {tables.map(table => (
                  <div key={table} className="bg-white p-6 rounded-lg shadow-sm border border-[#e9e9e7] flex flex-col items-center print:border-gray-400 print:shadow-none print:p-4">
                    <p className="text-2xl font-black text-[#37352f] mb-4 tracking-widest">{table}桌</p>
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`${(import.meta.env.VITE_CONSUMER_URL || 'https://odinoder.pages.dev').replace(/\/$/, '')}/?store=${tenantId}&table=${table}`)}`} 
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


          
            {activeTab === 'history' && (
              <div className="animate-in fade-in duration-300 max-w-6xl mx-auto h-full flex flex-col">
                <div className="mb-6 flex justify-between items-end">
                  <div>
                    <h3 className="text-2xl font-black text-[#37352f]">歷史訂單查詢</h3>
                    <p className="text-sm text-[#9a9a97] mt-1">搜尋與檢視所有歷史訂單明細</p>
                  </div>
                  <div className="relative w-72">
                    <Search size={18} className="absolute left-3 top-3 text-[#9a9a97]" />
                    <input 
                      type="text" 
                      placeholder="搜尋訂單編號或桌號..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-[#e9e9e7] rounded-md font-bold text-sm focus:outline-none focus:border-[#37352f]"
                    />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-[#e9e9e7] overflow-hidden flex-1 flex flex-col">
                  <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#f7f6f3] border-b border-[#e9e9e7] text-[#9a9a97] text-xs uppercase tracking-wider">
                          <th className="py-4 px-6 font-bold">訂單編號</th>
                          <th className="py-4 px-6 font-bold">桌號 / 類型</th>
                          <th className="py-4 px-6 font-bold">時間</th>
                          <th className="py-4 px-6 font-bold">狀態</th>
                          <th className="py-4 px-6 font-bold">點餐內容</th>
                          <th className="py-4 px-6 font-bold text-right">總金額</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders
                          .filter(o => 
                            o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (o.tableNumber || '').toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .map(order => (
                          <tr key={order.id} className="border-b border-[#e9e9e7] hover:bg-[#f7f6f3]/50 transition group">
                            <td className="py-4 px-6 font-mono text-sm text-[#37352f]">{order.id.split('-')[0].toUpperCase()}</td>
                            <td className="py-4 px-6">
                              <span className="text-xs font-bold bg-gray-200 text-gray-800 px-2 py-1 rounded">
                                {order.tableNumber || (order.orderType === 'DINE_IN' ? '內用' : (order.orderType === 'TAKEOUT' ? '外帶' : order.orderType)) || '外帶'}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-sm text-[#9a9a97]">{new Date(order.createdAt).toLocaleString()}</td>
                            <td className="py-4 px-6">
                              {order.status === 'PENDING' && <span className="text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-1 rounded">待確認</span>}
                              {order.status === 'PREPARING' && <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">製作中</span>}
                              {order.status === 'COMPLETED' && <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">已完成</span>}
                              {order.status === 'VOIDED' && <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">已作廢</span>}
                            </td>
                            <td className="py-4 px-6 text-sm text-[#37352f]">
                              {order.items?.map((item: any) => `${item.quantity}x ${item.product?.name}`).join(', ')}
                            </td>
                            <td className="py-4 px-6 text-right font-black text-[#37352f]">NT$ {order.totalAmount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto">
              <div className="mb-6">
                <h3 className="text-2xl font-black text-[#37352f]">系統設定</h3>
                <p className="text-sm text-[#9a9a97] mt-1">管理 <Settings size={20} className="mr-3 shrink-0 inline" /> <span className="hidden md:inline whitespace-nowrap">門市基本資料與硬體設備連線狀態。</span></p>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-sm border border-[#e9e9e7] space-y-8">
                <form onSubmit={handleUpdateStoreProfile} className="mb-8">
                  <h4 className="text-lg font-bold text-[#37352f] mb-4 flex items-center"><Building2 size={20} className="mr-2 text-[#37352f]" /> <Settings size={20} className="mr-3 shrink-0 inline" /> <span className="hidden md:inline whitespace-nowrap">門市基本資料維護</span></h4>
                  <div className="flex flex-col space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">門市名稱</label>
                      <input type="text" value={tenantName || ''} onChange={e => setTenantName(e.target.value)} className="w-full border border-[#e9e9e7] bg-white px-4 py-2.5 rounded-md font-medium focus:outline-none focus:border-[#37352f]" />
                    </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">快速點餐口味與備註 (請用逗號分隔)</label>
                        <input type="text" value={presetTags} onChange={e => setPresetTags(e.target.value)} placeholder="少冰,去冰,無糖..." className="w-full border border-[#e9e9e7] bg-white px-4 py-2.5 rounded-md font-medium focus:outline-none focus:border-[#37352f]" />
                        <p className="text-xs text-gray-400 mt-1">客人用手機掃碼點餐時，可以快速點選的按鈕選項。</p>
                      </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">營業狀態</label>
                      <select className="w-full border border-[#e9e9e7] bg-white px-4 py-2.5 rounded-md font-medium focus:outline-none focus:border-[#37352f]">
                        <option value="open">🟢 正常營業中</option>
                        <option value="closed">🔴 暫停營業 (打烊)</option>
                      </select>
                    </div>
                    <button type="submit" className="bg-[#37352f] text-white px-6 py-2.5 rounded-md font-bold shadow-md hover:bg-black active:scale-95 w-32 mt-2">
                      儲存變更
                    </button>
                  </div>
                </form>
              </div>

                <div className="bg-white p-8 rounded-lg shadow-sm border border-[#e9e9e7] mt-8">
                  <h4 className="text-lg font-bold text-[#37352f] mb-4 flex items-center">
                    <Clock size={20} className="mr-3 shrink-0 text-[#37352f]" /> 每日結單與交接班 (Z-Report)
                  </h4>
                  <div className="bg-[#f7f6f3] border border-[#e9e9e7] rounded-md p-6 max-w-md font-mono text-sm">
                    <div className="text-center mb-4 border-b border-dashed border-gray-400 pb-4">
                      <h5 className="font-black text-lg mb-1">{tenantName || '門市'} 結帳交班單</h5>
                      <p className="text-gray-500">列印時間: {new Date().toLocaleString()}</p>
                    </div>
                    <div className="space-y-2 mb-4 border-b border-dashed border-gray-400 pb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">期初準備金 (Float)</span>
                        <span className="font-bold">NT$ 0</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">已結帳單數</span>
                        <span className="font-bold">{shiftData.orderCount} 筆</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">內含營業稅額 (5%)</span>
                        <span className="font-bold">NT$ {Math.round(shiftData.total * 0.05)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">淨營業額 (Net)</span>
                        <span className="font-bold">NT$ {shiftData.total - Math.round(shiftData.total * 0.05)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-2 mb-4 bg-gray-200 px-2 rounded">
                      <span className="font-bold text-gray-800 text-base">班表營業總額 (Gross)</span>
                      <span className="font-black text-xl text-[#37352f]">NT$ {shiftData.total}</span>
                    </div>
                    <button 
                      onClick={handleCloseShift} 
                      className="w-full bg-[#37352f] text-white px-6 py-3 rounded-md font-bold shadow-md hover:bg-black active:scale-95 transition mt-2 font-sans">
                      結算並清空收銀機 (Z-Report)
                    </button>
                  </div>
                </div>

            </div>
          )}
        </div>
      
        {showCheckoutModal && (
          <div className="fixed inset-0 bg-[#37352f]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden border border-[#e9e9e7]">
              <div className="bg-[#f7f6f3] px-6 py-4 border-b border-[#e9e9e7] flex justify-between items-center">
                <h2 className="text-xl font-black text-[#37352f]">結帳付款 (標準 POS)</h2>
                <button onClick={() => setShowCheckoutModal(false)} className="text-[#9a9a97] hover:text-[#37352f]"><AlertCircle size={20} /></button>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-md border border-gray-100">
                  <span className="text-gray-500 font-bold">應收總額</span>
                  <span className="text-3xl font-black text-[#37352f]">NT$ {cartTotal}</span>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">支付方式</label>
                  <div className="flex gap-2">
                    <button onClick={() => setPaymentMethod('cash')} className={`flex-1 py-2 rounded font-bold border transition ${paymentMethod === 'cash' ? 'bg-[#37352f] text-white border-[#37352f]' : 'bg-white text-gray-600 border-[#e9e9e7] hover:bg-gray-50'}`}>現金</button>
                    <button onClick={() => setPaymentMethod('credit')} className={`flex-1 py-2 rounded font-bold border transition ${paymentMethod === 'credit' ? 'bg-[#37352f] text-white border-[#37352f]' : 'bg-white text-gray-600 border-[#e9e9e7] hover:bg-gray-50'}`}>信用卡</button>
                    <button onClick={() => setPaymentMethod('mobile')} className={`flex-1 py-2 rounded font-bold border transition ${paymentMethod === 'mobile' ? 'bg-[#37352f] text-white border-[#37352f]' : 'bg-white text-gray-600 border-[#e9e9e7] hover:bg-gray-50'}`}>行動支付</button>
                  </div>
                </div>

                
                {paymentMethod === 'mobile' && (
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
                    <label className="block text-sm font-bold text-blue-800 mb-2">請使用實體掃碼槍掃描客人條碼</label>
                    <input 
                      type="text" 
                      autoFocus
                      value={mobileBarcode} 
                      onChange={e => setMobileBarcode(e.target.value)} 
                      placeholder="掃描 LINE Pay / 街口 / 台灣Pay 條碼..." 
                      className="w-full border border-blue-300 px-3 py-2.5 rounded-md font-mono text-lg focus:border-blue-500 focus:ring-2 ring-blue-200 focus:outline-none" 
                    />
                    <p className="text-xs text-blue-600 mt-2">提示：游標停在此處時，直接按下實體條碼槍的按鈕即可。</p>
                  </div>
                )}
                {paymentMethod === 'credit' && (
                  <div className="bg-gray-100 border border-gray-300 p-6 rounded-md flex flex-col items-center justify-center space-y-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center animate-pulse">
                      <CheckCircle className="text-gray-400" />
                    </div>
                    <p className="text-sm font-bold text-gray-600 text-center">準備連線實體刷卡機 (EDC)<br/><span className="text-xs font-normal">請確認設備已透過 USB 或 COM Port 連接至本電腦</span></p>
                  </div>
                )}
                {paymentMethod === 'cash' && (
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-bold text-gray-700 mb-2">實收金額</label>
                      <input type="number" value={tenderedAmount} onChange={e => setTenderedAmount(Number(e.target.value) || '')} className="w-full border border-[#e9e9e7] px-3 py-2.5 rounded-md font-bold text-lg focus:border-[#37352f] focus:outline-none" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-bold text-gray-700 mb-2">找零</label>
                      <div className="w-full bg-gray-100 border border-transparent px-3 py-2.5 rounded-md font-black text-lg text-green-600">
                        NT$ {Math.max(0, (Number(tenderedAmount) || 0) - cartTotal)}
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">統一編號 (選填)</label>
                  <input type="text" maxLength={8} value={taxId} onChange={e => setTaxId(e.target.value)} placeholder="8碼數字統編" className="w-full border border-[#e9e9e7] px-3 py-2 rounded-md font-medium focus:border-[#37352f] focus:outline-none" />
                </div>
              </div>
              <div className="p-4 bg-gray-50 border-t border-[#e9e9e7] flex gap-3">
                <button onClick={() => setShowCheckoutModal(false)} className="flex-1 py-3 bg-white border border-[#e9e9e7] text-gray-600 font-bold rounded-md hover:bg-gray-100">取消</button>
                <button onClick={submitCheckout} disabled={isAwaitingPayment || (paymentMethod === 'cash' && (Number(tenderedAmount) || 0) < cartTotal)} className="flex-[2] py-3 bg-[#37352f] text-white font-bold rounded-md hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all">
                  {isAwaitingPayment ? (
                    <div className="flex items-center justify-center">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                      {paymentStatusMsg || '硬體同步中...'}
                    </div>
                  ) : '確認收款並連線設備'}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

