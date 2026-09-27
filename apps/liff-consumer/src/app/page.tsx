'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { ShoppingCart, CheckCircle, Clock, X, MessageSquare, Plus, Minus } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://odinoder-api.onrender.com';

interface CartItem {
  cartItemId: string;
  product: any;
  quantity: number;
  tags: string[];
  remark: string;
}

function OrderingContent() {
  const searchParams = useSearchParams();
  const tenantId = searchParams.get('store');
  const tableNumber = searchParams.get('table') || '未指定桌號';


  
  const [products, setProducts] = useState<any[]>([]);
  const [tenantName, setTenantName] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('全部');
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  
  // 客製化 Modal 狀態
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [customRemark, setCustomRemark] = useState('');
  const [customQty, setCustomQty] = useState(1);

  useEffect(() => {
    if (!tenantId) return;
    fetch(`${API_BASE}/tenants/${tenantId}`)
      .then(res => res.json())
      .then(data => setTenantName(data.name || ''))
      .catch(e => console.error(e));

    fetch(`${API_BASE}/products/tenant/${tenantId}`)
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(e => console.error('無法載入菜單', e));
  }, [tenantId]);

  const categories = ['全部', ...Array.from(new Set(products.map(p => p.category || '未分類')))];
  const filteredProducts = activeCategory === '全部' ? products : products.filter(p => (p.category || '未分類') === activeCategory);

  const totalItems = cart.reduce((a, b) => a + b.quantity, 0);
  const totalPrice = cart.reduce((total, item) => total + (Number(item.product.price) * item.quantity), 0);

  // 開啟客製化面板
  const openCustomModal = (product: any) => {
    setSelectedProduct(product);
    setCustomTags([]);
    setCustomRemark('');
    setCustomQty(1);
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    const newItem: CartItem = {
      cartItemId: Math.random().toString(36).substring(2, 9),
      product: selectedProduct,
      quantity: customQty,
      tags: customTags,
      remark: customRemark
    };
    setCart(prev => [...prev, newItem]);
    setSelectedProduct(null);
  };

  const handleRemoveFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const toggleTag = (tag: string) => {
    setCustomTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleCheckout = async () => {
    if (totalItems === 0) return alert('請先選擇餐點！');
    setShowPayment(true);
  };

  const confirmPaymentAndOrder = async () => {
    setIsSubmitting(true);
    const orderItems = cart.map(item => ({
      productId: item.product.id,
      quantity: item.quantity,
      subtotal: Number(item.product.price) * item.quantity,
      selectedModifiers: { tags: item.tags, remark: item.remark } // 將備註與標籤送出
    }));

    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: tenantId,
          userId: null,
          orderType: tableNumber === '未指定桌號' ? '外帶' : 'DINE_IN',
          tableNumber: tableNumber === '未指定桌號' ? null : tableNumber,
          totalAmount: totalPrice,
          status: 'PENDING',
          items: { create: orderItems }
        }),
      });

      if (res.ok) {
        setShowPayment(false);
        setCart([]);
        setOrderComplete(true);
        setTimeout(() => setOrderComplete(false), 5000);
      } else {
        alert('送出失敗，請稍後再試');
      }
    } catch (error) {
      alert('發生錯誤');
    } finally {
      setIsSubmitting(false);
    }
  };

  const presetTags = ['少冰', '去冰', '熱', '半糖', '微糖', '無糖', '加辣', '不要蔥', '不要香菜'];

  return (
    <main className="min-h-screen bg-gray-50 pb-32 font-sans text-gray-800 flex flex-col relative">
      <header className="bg-white shadow-sm sticky top-0 z-10 px-5 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black text-gray-800">{tenantName ? `${tenantName} 點餐系統` : '線上點餐系統'}</h1>
          <div className="flex items-center space-x-2 mt-1">
            <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-bold flex items-center">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>營業中
            </span>
            <p className="text-sm text-gray-600 font-bold">{tableNumber !== '未指定桌號' ? `📍 桌號: ${tableNumber}` : '🛍️ 外帶'}</p>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-gray-100 px-4 py-3 overflow-x-auto whitespace-nowrap hide-scrollbar flex space-x-3 sticky top-[68px] z-10 shadow-sm">
        {categories.map(cat => (
          <button 
            key={cat} 
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition ${activeCategory === cat ? 'bg-gray-900 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto relative p-4 space-y-4">
        {orderComplete && (
          <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-[100] flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
            <CheckCircle size={64} className="text-green-500 mb-4" />
            <h2 className="text-2xl font-black text-gray-900 mb-2">訂單已送出！</h2>
            <p className="text-gray-500">廚房已收到您的訂單，正在為您準備中。</p>
            <p className="text-sm text-gray-400 mt-8">5秒後自動回到菜單...</p>
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <Clock size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">目前尚無餐點</p>
          </div>
        ) : (
          filteredProducts.map((p) => (
            <div key={p.id} onClick={() => !p.isSoldOut && openCustomModal(p)} className={`bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center transition ${p.isSoldOut ? 'opacity-50 grayscale' : 'cursor-pointer active:scale-[0.98] hover:border-blue-200'}`}>
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold text-xs">無圖片</div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg leading-tight">{p.name}</h3>
                  <p className="text-blue-600 font-black mt-1">NT$ {Number(p.price)}</p>
                  {p.isSoldOut && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold mt-2 inline-block">售完</span>}
                </div>
              </div>
              
              {!p.isSoldOut && (
                <div className="bg-blue-50 text-blue-700 w-10 h-10 rounded-full flex items-center justify-center font-black shadow-sm border border-blue-100 shrink-0 ml-4">
                  +
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 購物車抽屜預覽區 (僅列出已點商品) */}
      {cart.length > 0 && !showPayment && (
        <div className="fixed bottom-24 left-4 right-4 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 max-h-[40vh] overflow-y-auto z-40">
          <h4 className="font-bold text-gray-800 border-b border-gray-100 pb-2 mb-2 flex items-center">
            <ShoppingCart size={16} className="mr-2" /> 購物車內容
          </h4>
          <div className="space-y-3">
            {cart.map(item => (
              <div key={item.cartItemId} className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-sm">{item.product.name} x {item.quantity}</p>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed mt-0.5">
                    {[...item.tags, item.remark].filter(Boolean).join(', ')}
                  </p>
                </div>
                <div className="flex items-center space-x-3 ml-2">
                  <span className="font-black text-gray-900 text-sm shrink-0">NT$ {Number(item.product.price) * item.quantity}</span>
                  <button onClick={() => handleRemoveFromCart(item.cartItemId)} className="w-6 h-6 bg-red-50 text-red-500 rounded flex items-center justify-center hover:bg-red-100"><X size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalItems > 0 && (
        <div className="fixed bottom-6 left-4 right-4 z-50">
          <div className="bg-gray-900 text-white p-4 rounded-2xl flex justify-between items-center shadow-2xl">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <ShoppingCart size={24} className="text-gray-400" />
                <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-gray-900">
                  {totalItems}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 font-bold">總計金額</span>
                <span className="font-black text-xl leading-none">NT$ {totalPrice}</span>
              </div>
            </div>
            <button 
              onClick={handleCheckout} 
              disabled={isSubmitting} 
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black shadow-lg shadow-blue-900/50 active:scale-95 transition flex items-center"
            >
              {isSubmitting ? '處理中...' : '送出訂單'}
            </button>
          </div>
        </div>
      )}

      {/* 客製化選項 Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[80] flex flex-col justify-end">
          <div className="bg-white rounded-t-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="relative h-48 bg-gray-100 shrink-0">
              {selectedProduct.imageUrl ? (
                <img src={selectedProduct.imageUrl} className="w-full h-full object-cover" alt={selectedProduct.name} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">無圖片</div>
              )}
              <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full text-white flex items-center justify-center hover:bg-black/70">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-black text-gray-900">{selectedProduct.name}</h3>
                  <p className="text-blue-600 font-black text-xl mt-1">NT$ {Number(selectedProduct.price)}</p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center"><MessageSquare size={16} className="mr-2" /> 快速口味與喜好</h4>
                <div className="flex flex-wrap gap-2">
                  {presetTags.map(tag => (
                    <button key={tag} onClick={() => toggleTag(tag)} className={`px-4 py-2 border rounded-xl font-bold text-sm transition ${customTags.includes(tag) ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-white border-gray-200 text-gray-600'}`}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h4 className="font-bold text-gray-800 mb-3">其他備註指示</h4>
                <textarea 
                  value={customRemark}
                  onChange={e => setCustomRemark(e.target.value)}
                  placeholder="例如：過敏原、醬料分開..."
                  className="w-full border border-gray-200 rounded-xl p-4 font-medium text-sm focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition h-24 resize-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-6">
                <div className="flex items-center space-x-4 bg-gray-50 rounded-2xl p-1 border border-gray-200">
                  <button onClick={() => setCustomQty(q => Math.max(1, q-1))} className="w-12 h-12 bg-white rounded-xl shadow-sm text-gray-600 flex items-center justify-center font-bold"><Minus size={20}/></button>
                  <span className="font-black text-xl w-6 text-center">{customQty}</span>
                  <button onClick={() => setCustomQty(q => q+1)} className="w-12 h-12 bg-white rounded-xl shadow-sm text-gray-600 flex items-center justify-center font-bold"><Plus size={20}/></button>
                </div>
                <button onClick={handleAddToCart} className="flex-1 ml-4 bg-blue-600 text-white h-14 rounded-2xl font-black text-lg shadow-xl shadow-blue-900/30 active:scale-95 transition">
                  加入購物車
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 確認結帳 Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[90] flex flex-col justify-end">
          <div className="bg-white rounded-t-3xl p-6 animate-in slide-in-from-bottom-full duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-gray-900">確認結帳</h3>
              <button onClick={() => setShowPayment(false)} className="text-gray-400 font-bold bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-200"><X size={18} /></button>
            </div>
            
            <div className="mb-6 p-4 bg-gray-50 rounded-2xl flex justify-between items-center border border-gray-100">
              <span className="text-gray-500 font-bold">應付總額</span>
              <span className="text-3xl font-black text-gray-900">NT$ {totalPrice}</span>
            </div>

            <button onClick={confirmPaymentAndOrder} disabled={isSubmitting} className="w-full py-4 rounded-2xl font-black text-lg text-white bg-gray-900 shadow-xl shadow-gray-900/40 active:scale-95 transition flex items-center justify-center">
              {isSubmitting ? '送出訂單中...' : '送出並於櫃檯結帳'}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default function OrderingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderingContent />
    </Suspense>
  );
}
