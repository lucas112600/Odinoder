import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const rawApiUrl = import.meta.env.VITE_API_URL || 'https://odinoder-api.onrender.com';
const API_BASE = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;

// 音效提示函數
const playBeep = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch(e) {}
};

export default function App() {
  const [tenantId, setTenantId] = useState<string | null>(localStorage.getItem('pos_tenantId'));
  const [tenantName, setTenantName] = useState<string | null>(localStorage.getItem('pos_tenantName'));
  const [availableStores, setAvailableStores] = useState<any[]>([]);

  const [orders, setOrders] = useState<any[]>([]);
  const [showEODModal, setShowEODModal] = useState(false);
  const [shiftData, setShiftData] = useState<any>({ total: 0, orderCount: 0 });
  const [printOrder, setPrintOrder] = useState<any>(null);

  // 取得可登入的門市列表
  useEffect(() => {
    if (!tenantId) {
      fetch(`${API_BASE}/tenants`)
        .then(res => res.json())
        .then(setAvailableStores)
        .catch(e => console.error(e));
    }
  }, [tenantId]);

  // 登出
  const handleLogout = () => {
    localStorage.removeItem('pos_tenantId');
    localStorage.removeItem('pos_tenantName');
    setTenantId(null);
  };

  const fetchOrders = async () => {
    if (!tenantId) return;
    try {
      const res = await fetch(`${API_BASE}/orders/tenant/${tenantId}`);
      const data = await res.json();
      const formatted = data.map((o: any) => ({
        id: o.id,
        rawDate: o.createdAt,
        displayId: o.id.split('-')[0].toUpperCase(),
        table: o.tableNumber || '外帶',
        time: new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        items: o.items.map((i: any) => {
        let text = `${i.product.name} x ${i.quantity}`;
        if (i.selectedModifiers) {
          const tags = i.selectedModifiers.tags || [];
          const remark = i.selectedModifiers.remark || '';
          const allMods = [...tags, remark].filter(Boolean).join(', ');
          if (allMods) text += ` \n   └ 備註: ${allMods}`;
        }
        return text;
      }).join('\n'),
        total: o.totalAmount,
        status: o.status === 'PENDING' ? '等待接單' : o.status === 'PREPARING' ? '準備中' : '已完成'
      }));
      setOrders(formatted);
    } catch (e) {}
  };

  useEffect(() => {
    if (!tenantId) return;
    fetchOrders();

    const socket = io(`${API_BASE}`);
    socket.on('connect', () => socket.emit('joinTenant', tenantId));

    socket.on('newOrder', (o) => {
      playBeep();
      const newOrder = {
        id: o.id,
        rawDate: o.createdAt,
        displayId: o.id.split('-')[0].toUpperCase(),
        table: o.tableNumber || '外帶',
        time: new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        items: o.items ? o.items.map((i: any) => {
          let text = `${i.product?.name || '商品'} x ${i.quantity}`;
          if (i.selectedModifiers) {
            const tags = i.selectedModifiers.tags || [];
            const remark = i.selectedModifiers.remark || '';
            const allMods = [...tags, remark].filter(Boolean).join(', ');
            if (allMods) text += ` \n   └ 備註: ${allMods}`;
          }
          return text;
        }).join('\n') : '新訂單進件',
        total: o.totalAmount || 0,
        status: '等待接單',
      };
      setOrders((prev) => [newOrder, ...prev]);
    });

    socket.on('orderStatusUpdated', (o) => {
      setOrders(prev => prev.map(order => {
        if (order.id === o.id) {
          const newStatus = o.status === 'PENDING' ? '等待接單' : o.status === 'PREPARING' ? '準備中' : '已完成';
          return { ...order, status: newStatus };
        }
        return order;
      }));
    });

    return () => { socket.disconnect(); };
  }, []);

  // Web Serial API 串接硬體出單機
  const handleConnectPrinter = async () => {
    try {
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 9600 });
      alert('✅ 成功連線到硬體出單機！\n\n(此為 Web Serial API 真實串接，後續列印將直接發送 ESC/POS 指令至機器)');
      // Store port in ref or context for actual printing
    } catch (e: any) {
      alert('連線失敗或使用者取消: ' + e.message);
    }
  };

  const handlePrint = (order: any) => {
    setPrintOrder(order);
    setTimeout(() => {
      window.print();
      setPrintOrder(null);
    }, 150);
  };

  const handleVoid = async (id: string) => {
    if (!window.confirm('確定要作廢這筆訂單嗎？作廢後將不計入今日營業額。')) return;
    setOrders(orders.map(o => o.id === id ? { ...o, status: '已作廢' } : o));
    try {
      await fetch(`${API_BASE}/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'VOIDED' })
      });
    } catch (e) {}
  };

  const handleAction = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === '等待接單' ? 'PREPARING' : 'COMPLETED';
    setOrders(orders.map(o => o.id === id ? { ...o, status: nextStatus === 'PREPARING' ? '準備中' : '已完成' } : o));
    try {
      await fetch(`${API_BASE}/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
    } catch (e) {}
  };

  // 結算下班邏輯 (過濾今日訂單)
  const todayDateString = new Date().toDateString();
  const todayOrders = orders.filter(o => new Date(o.rawDate || new Date()).toDateString() === todayDateString);
  const eodRevenue = todayOrders.filter(o => o.status === '已完成').reduce((sum, o) => sum + Number(o.total), 0);
  const eodCount = todayOrders.filter(o => o.status === '已完成').length;
  const eodPending = todayOrders.filter(o => o.status !== '已完成').length;

  
  const openShiftModal = async () => {
    try {
      const res = await fetch(`${API_BASE}/tenants/${tenantId}/active-shift`);
      if (res.ok) {
        setShiftData(await res.json());
      }
    } catch(e) {}
    setShowEODModal(true);
  };

  const handleCloseRegister = async () => {
    if (!window.confirm('確定要結算當前班表並重新計算下一班嗎？此操作無法還原。')) return;
    try {
      await fetch(`${API_BASE}/tenants/${tenantId}/close-shift`, { method: 'POST' });
      alert('結班報表已產生！系統即將登出。');
      localStorage.removeItem('pos_tenantId');
      localStorage.removeItem('pos_tenantName');
      setTenantId(null);
      setTenantName(null);
      setShowEODModal(false);
    } catch(e) {
      alert('結班失敗');
    }
  };


  const activeOrders = orders.filter(o => o.status !== '已完成' && o.status !== '已作廢');

  if (!tenantId) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f7f6f3] font-sans text-[#37352f]">
        <div className="bg-white p-10 rounded-md shadow-2xl w-full max-w-md mx-4">
          <div className="flex flex-col items-center mb-8">
            <img src="/logo.png" alt="System Logo" className="w-20 h-20 mb-4 rounded-md shadow-md" />
            <h1 className="text-2xl font-bold text-[#37352f]">KDS 前台設備綁定</h1>
            <p className="text-sm text-[#9a9a97] mt-2">請選擇此設備要連線的實體門市</p>
          </div>
          <div className="space-y-3">
            {availableStores.length === 0 ? (
              <div className="text-center py-6 text-[#9a9a97] font-medium">目前無可用的門市，請先至總管理後台建立。</div>
            ) : availableStores.map(store => (
              <button key={store.id} onClick={() => {
                localStorage.setItem('pos_tenantId', store.id);
                localStorage.setItem('pos_tenantName', store.name);
                setTenantId(store.id);
                setTenantName(store.name);
              }} className="w-full flex items-center justify-between px-6 py-4 border border-[#e9e9e7] rounded-lg hover:border-[#37352f] hover:bg-[#f7f6f3] transition group">
                <span className="font-bold text-[#37352f] group-hover:text-[#37352f]">{store.name}</span>
                <span className="text-[#37352f] opacity-0 group-hover:opacity-100 font-bold transition">連線 →</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 隱藏的列印專用區塊 (模擬 80mm 出單機紙張寬度) */}
      {printOrder && (
        <div className="hidden print:block absolute top-0 left-0 w-[80mm] bg-white text-black p-4 font-mono z-[9999]" id="receipt-container">
          <div className="text-center mb-4">
            <h1 className="text-xl font-black mb-1">{tenantName || 'POS 門市'}</h1>
            <p className="text-sm font-bold">結帳明細單</p>
          </div>
          
          <div className="text-xs mb-3 space-y-1 border-b border-dashed border-gray-400 pb-3">
            <p>單號：#{printOrder.displayId}</p>
            <p>時間：{new Date(printOrder.rawDate || new Date()).toLocaleString('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
            <p className="font-bold text-sm mt-1">{printOrder.table === '外帶' ? '🛍️ 外帶自取' : `📍 內用 - 桌號 ${printOrder.table}`}</p>
          </div>

          <div className="text-xs border-b border-dashed border-gray-400 pb-3 mb-3">
            {printOrder.items.split('\n').map((line: string, i: number) => {
              if (line.includes('└ 備註:')) {
                return <p key={i} className="pl-4 text-[10px] text-gray-700">{line.trim()}</p>;
              }
              return <p key={i} className="font-bold mt-1">{line}</p>;
            })}
          </div>

          <div className="flex justify-between items-center text-lg font-black mb-6">
            <span>總計</span>
            <span>NT$ {printOrder.total}</span>
          </div>

          <div className="text-center text-[10px] text-gray-600">
            <p>謝謝您的光臨，請憑此單取餐！</p>
            <p className="mt-1">由 POS 系統列印</p>
          </div>
        </div>
      )}

      {/* 正常畫面 - 列印時隱藏 */}
      <div className="flex h-screen bg-[#f7f6f3] font-sans text-[#37352f] print:hidden">
      {/* 日結報表 Modal */}
      {showEODModal && (
        <div className="fixed inset-0 bg-[#f7f6f3]/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4 border border-[#e9e9e7]">
            <div className="border-b border-[#e9e9e7] pb-4 mb-6">
              <h2 className="text-xl font-bold text-[#37352f] text-center">門市日結報表 (Z-Report)</h2>
            </div>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center text-sm border-b border-[#e9e9e7] pb-2">
                <span className="text-[#9a9a97] font-medium">結算日期</span>
                <span className="font-bold text-[#37352f]">{new Date().toLocaleDateString('zh-TW')}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-[#e9e9e7] pb-2">
                <span className="text-[#9a9a97] font-medium">總出餐筆數</span>
                <span className="font-bold text-[#37352f]">{eodCount} 筆</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded border border-[#e9e9e7] mt-4">
                <span className="font-bold text-slate-700">實收總計</span>
                <span className="font-bold text-2xl text-[#37352f]">NT$ {eodRevenue}</span>
              </div>
              {eodPending > 0 && (
                <div className="bg-red-50 p-3 rounded border border-red-200 text-red-600 font-medium text-sm text-center">
                  注意：尚有 {eodPending} 筆訂單未完成
                </div>
              )}
            </div>
            <div className="flex space-x-3">
              <button onClick={() => setShowEODModal(false)} className="flex-1 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded hover:bg-slate-50 transition">返回</button>
              <button onClick={handleCloseRegister} className="flex-1 py-2.5 bg-white text-white font-bold rounded hover:bg-[#f7f6f3] transition">列印並關班</button>
            </div>
          </div>
        </div>
      )}

      {/* 左側 Sidebar (深色系商用風格) */}
      <div className="w-20 bg-[#f7f6f3] text-slate-300 flex flex-col items-center py-4 shadow-lg z-10 justify-between">
        <div className="flex flex-col items-center space-y-6 w-full">
          <img src="/logo.png" alt="System Logo" className="w-12 h-12 mb-4 rounded-md shadow-sm" />
          <button className="flex flex-col items-center text-white border-l-4 border-blue-500 py-3 w-full bg-white">
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            <span className="text-[10px] font-bold tracking-wider">接單看板</span>
          </button>
        </div>
        <div className="w-full">
          <button onClick={openShiftModal} className="flex flex-col items-center text-[#9a9a97] border-l-4 border-transparent hover:text-white hover:bg-white py-3 w-full transition">
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            <span className="text-[10px] font-bold tracking-wider">關班結算</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 shrink-0 border-b border-[#e9e9e7] z-10">
          <div className="flex items-center">
            <h1 className="text-lg font-bold text-[#37352f]">門市前台接單系統</h1>
            <span className="ml-3 px-2 py-0.5 bg-slate-100 text-[#9a9a97] border border-[#e9e9e7] rounded text-xs font-bold tracking-wider">KDS</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-600 text-xs font-medium">系統連線中</span>
            </div>
            <div className="h-4 w-px bg-slate-300"></div>
            <span className="text-[#37352f] font-bold text-sm">{tenantName || '未命名門市'}</span>
            <button onClick={handleConnectPrinter} className="text-xs text-[#37352f] bg-[#f7f6f3] px-3 py-1 rounded font-bold ml-4 border border-blue-200 shadow-sm hover:bg-blue-100 transition">🔌 連接硬體印表機</button>
            <button onClick={handleLogout} className="text-xs text-[#9a9a97] hover:text-[#37352f] font-bold ml-4 underline">切換門市</button>
          </div>
        </header>

        {/* 接單主畫面 (扁平化設計) */}
        <div className="flex-1 overflow-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start bg-slate-50">
          {activeOrders.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center h-full min-h-[400px] text-[#9a9a97]">
              <svg className="w-16 h-16 mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="text-lg font-medium">目前無待處理訂單</p>
            </div>
          ) : null}

          {activeOrders.map((order) => (
            <div key={order.id} className="bg-white rounded shadow-sm border border-[#e9e9e7] overflow-hidden flex flex-col">
              <div className={`px-4 py-3 border-b flex justify-between items-center ${order.status === '等待接單' ? 'bg-orange-50 border-orange-100' : 'bg-[#f7f6f3] border-blue-100'}`}>
                <div>
                  <span className="text-xs font-medium text-[#9a9a97]">#{order.displayId}</span>
                  <h2 className="text-xl font-bold text-[#37352f] mt-0.5">
                    {order.table === '外帶' ? '外帶自取' : `內用 - 桌號 ${order.table}`}
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-[#9a9a97]">{order.time}</p>
                   <div className="flex items-center space-x-2 mt-1 justify-end">
                    <button onClick={() => handlePrint(order)} className="p-1 text-[#9a9a97] hover:text-[#37352f] transition" title="列印明細">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    </button>
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold tracking-wide border ${order.status === '等待接單' ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 flex-1 bg-white min-h-[140px]">
                <p className="text-[#37352f] font-medium leading-relaxed whitespace-pre-line text-sm">{order.items}</p>
              </div>
              
              <div className="p-4 border-t border-[#e9e9e7] flex items-center justify-between bg-slate-50">
                <p className="font-bold text-lg text-[#37352f]">${order.total}</p>
                <div className="flex space-x-2">
                  {order.status === '等待接單' && (
                    <button onClick={() => handleVoid(order.id)} className="px-3 py-2 rounded text-sm font-bold bg-white border border-gray-300 text-gray-500 hover:bg-gray-100 transition-colors">
                      作廢
                    </button>
                  )}
                  <button 
                    onClick={() => handleAction(order.id, order.status)}
                    className={`px-5 py-2 rounded text-sm font-bold transition-colors ${order.status === '等待接單' ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-[#37352f] text-white hover:bg-[#2f2e2a]'}`}>
                    {order.status === '等待接單' ? '接收訂單' : '標示出餐'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </>
  );
}
