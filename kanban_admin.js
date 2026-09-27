const fs = require('fs');

let c = fs.readFileSync('apps/admin-dashboard/src/App.tsx', 'utf8');

// 1. Add Socket.io import
c = c.replace(
  /import \{ Package, AlertCircle, Building2, Settings, QrCode \} from 'lucide-react';/,
  "import { Package, AlertCircle, Building2, Settings, QrCode, CheckCircle, Clock, XCircle, CreditCard } from 'lucide-react';\nimport { io } from 'socket.io-client';"
);

// 2. Add Socket.io effect for real-time orders
c = c.replace(
  /const fetchOrders = async \(\) => \{[\s\S]*?fetchOrders\(\);\n    \}\n  \}, \[tenantId\]\);/s,
  `const fetchOrders = async () => {
      try {
        const res = await fetch(\`\${API_BASE}/orders/tenant/\${tenantId}\`);
        const data = await res.json();
        setOrders(data);
      } catch (e) {}
    };

    if (tenantId) {
      fetchTenantDetails();
      fetchProducts();
      fetchRawMaterials();
      fetchOrders();

      const socket = io(API_BASE);
      socket.on('connect', () => socket.emit('joinTenant', tenantId));
      socket.on('newOrder', (o) => setOrders(prev => [o, ...prev]));
      socket.on('orderStatusUpdated', (o) => setOrders(prev => prev.map(order => order.id === o.id ? o : order)));
      
      return () => { socket.disconnect(); };
    }
  }, [tenantId]);`
);

// 3. Add order action handlers
c = c.replace(
  /const handleLogout = \(\) => \{/s,
  `const updateOrderStatus = async (id: string, status: string) => {
    try {
      await fetch(\`\${API_BASE}/orders/\${id}/status\`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch(e) {}
  };

  const handleLogout = () => {`
);

// 4. Change Sidebar tab name
c = c.replace(/<LayoutDashboard size=\{20\} className="mr-3" \/> 營運數據分析/, '<CreditCard size={20} className="mr-3" /> 收銀與接單管理');
c = c.replace(/\? '營運數據分析 \(Dashboard\)' :/, "? '收銀與接單 (Cashier & Orders)' :");

// 5. Overhaul the "orders" tab UI
const oldOrdersUI = /\{activeTab === 'orders' && \([\s\S]*?<\/section>\n              <\/div>\n            \)\}/s;
const newOrdersUI = `{activeTab === 'orders' && (
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
                  {/* 待接單 (PENDING) */}
                  <div className="bg-[#f7f6f3] rounded-lg border border-[#e9e9e7] p-4 flex flex-col h-[70vh]">
                    <h4 className="font-bold text-[#37352f] mb-4 flex items-center"><AlertCircle size={18} className="mr-2 text-yellow-600"/> 待確認 (新訂單)</h4>
                    <div className="flex-1 overflow-auto space-y-4 pr-2">
                      {orders.filter(o => o.status === 'PENDING').map(order => (
                        <div key={order.id} className="bg-white p-4 rounded-md shadow-sm border border-[#e9e9e7]">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-black text-lg text-[#37352f]">{order.id.split('-')[0].toUpperCase()}</span>
                            <span className="text-xs font-bold bg-yellow-100 text-yellow-800 px-2 py-1 rounded">{order.table}</span>
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

                  {/* 製作中 (PREPARING) */}
                  <div className="bg-[#f7f6f3] rounded-lg border border-[#e9e9e7] p-4 flex flex-col h-[70vh]">
                    <h4 className="font-bold text-[#37352f] mb-4 flex items-center"><Clock size={18} className="mr-2 text-blue-600"/> 製作中 (未結帳)</h4>
                    <div className="flex-1 overflow-auto space-y-4 pr-2">
                      {orders.filter(o => o.status === 'PREPARING').map(order => (
                        <div key={order.id} className="bg-white p-4 rounded-md shadow-sm border border-[#e9e9e7]">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-black text-lg text-[#37352f]">{order.id.split('-')[0].toUpperCase()}</span>
                            <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded">{order.table}</span>
                          </div>
                          <div className="text-sm text-[#37352f] mb-4 space-y-1">
                            {order.items?.map((item: any) => (
                              <div key={item.id} className="flex justify-between">
                                <span>{item.quantity}x {item.product?.name}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between items-center pt-3 border-t border-[#e9e9e7]">
                            <span className="font-black text-lg text-blue-600">NT$ {order.totalAmount}</span>
                            <div className="flex space-x-2">
                              <button onClick={() => updateOrderStatus(order.id, 'VOIDED')} className="text-red-500 font-bold text-sm px-2 hover:underline">作廢</button>
                              <button onClick={() => updateOrderStatus(order.id, 'COMPLETED')} className="bg-blue-600 text-white px-4 py-2 rounded font-bold text-sm hover:bg-blue-700">結帳 / 出餐</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 已完成 (COMPLETED) */}
                  <div className="bg-[#f7f6f3] rounded-lg border border-[#e9e9e7] p-4 flex flex-col h-[70vh]">
                    <h4 className="font-bold text-[#37352f] mb-4 flex items-center"><CheckCircle size={18} className="mr-2 text-green-600"/> 已結帳 (出餐完畢)</h4>
                    <div className="flex-1 overflow-auto space-y-4 pr-2">
                      {orders.filter(o => o.status === 'COMPLETED').map(order => (
                        <div key={order.id} className="bg-white p-4 rounded-md shadow-sm border border-[#e9e9e7] opacity-60">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-black text-lg text-[#37352f]">{order.id.split('-')[0].toUpperCase()}</span>
                            <span className="text-xs font-bold bg-green-100 text-green-800 px-2 py-1 rounded">{order.table}</span>
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
            )}`;

c = c.replace(oldOrdersUI, newOrdersUI);

fs.writeFileSync('apps/admin-dashboard/src/App.tsx', c);
console.log('Replaced dashboard with Kanban order flow');
