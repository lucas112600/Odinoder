import React from 'react';

export default function OrderingPage() {
  // 假設的假資料 (未來會從剛剛寫好的 NestJS API 撈取)
  const products = [
    { id: 1, name: '招牌滷肉飯', price: 50, desc: '特製滷汁，入口即化，傳承三十年的好味道', tag: '人氣' },
    { id: 2, name: '香煎排骨飯', price: 90, desc: '現點現炸，肉汁飽滿外酥內嫩' },
    { id: 3, name: '燙青菜', price: 40, desc: '時令新鮮蔬菜，搭配清爽蒜香醬油' },
    { id: 4, name: '珍珠奶茶', price: 60, desc: '黃金比例，茶香與奶香完美交融' },
  ];

  return (
    <main className="min-h-screen bg-gray-50 pb-24 font-sans text-gray-800">
      {/* 頂部導覽與店家資訊 (Header) */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-5 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">美味食堂</h1>
            <div className="flex items-center space-x-2 mt-1">
              <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">內用</span>
              <p className="text-sm text-gray-500 font-medium">桌號: 5</p>
            </div>
          </div>
          {/* 模擬 LINE 頭像登入 */}
          <button className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full border border-gray-200 overflow-hidden shadow-sm active:scale-95 transition">
            <span className="text-lg">👤</span>
          </button>
        </div>
        
        {/* 分類導覽 (Tabs) */}
        <div className="flex overflow-x-auto px-4 py-3 space-x-3 hide-scrollbar border-t border-gray-100">
          <button className="whitespace-nowrap px-4 py-1.5 bg-blue-600 text-white rounded-full text-sm font-semibold shadow-sm shadow-blue-200">主廚推薦</button>
          <button className="whitespace-nowrap px-4 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm font-medium active:bg-gray-200">主食</button>
          <button className="whitespace-nowrap px-4 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm font-medium active:bg-gray-200">小菜</button>
          <button className="whitespace-nowrap px-4 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm font-medium active:bg-gray-200">飲料</button>
        </div>
      </header>

      {/* 產品列表 (Menu List) */}
      <div className="p-4 space-y-4">
        {products.map((p) => (
          <div key={p.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
            <div className="flex-1 pr-4">
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-gray-800 text-lg">{p.name}</h3>
                {p.tag && (
                  <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold tracking-wide">
                    {p.tag}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed line-clamp-2">{p.desc}</p>
              <p className="text-blue-600 font-black mt-2 text-lg">NT$ {p.price}</p>
            </div>
            <div className="shrink-0">
              <button className="w-10 h-10 bg-gray-50 border border-gray-200 text-blue-600 rounded-full flex items-center justify-center text-xl font-medium shadow-sm hover:bg-blue-50 hover:text-blue-700 active:scale-90 transition-transform">
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 底部浮動購物車 (Floating Cart) */}
      <div className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-100 px-5 py-4 pb-8 flex justify-between items-center shadow-[0_-8px_20px_-10px_rgba(0,0,0,0.1)] z-20">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-blue-100">
              🛒
            </div>
            {/* 購物車數量 Badge */}
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 border-2 border-white text-white text-xs w-6 h-6 flex items-center justify-center rounded-full font-bold shadow-sm">
              2
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">總計金額</p>
            <p className="text-xl font-black text-gray-800">NT$ 140</p>
          </div>
        </div>
        <button className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-blue-300 hover:bg-blue-700 active:scale-95 transition-transform tracking-wide">
          前往結帳
        </button>
      </div>
    </main>
  );
}
