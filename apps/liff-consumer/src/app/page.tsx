export default function Home() {
  return (
    <div className="flex flex-col h-screen items-center justify-center bg-gray-50 text-gray-800 p-8 text-center">
      <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-4xl mb-6 shadow-xl shadow-blue-200">
        O
      </div>
      <h1 className="text-2xl font-black mb-2">歡迎使用 Odinoder 點餐系統</h1>
      <p className="text-gray-500 font-medium">請使用 LINE 掃描實體門市桌上的專屬 QR Code 以開始點餐！</p>
      
      <div className="mt-12 p-6 bg-white border border-gray-200 rounded-2xl shadow-sm text-sm text-gray-400">
        <p>開發者提示：</p>
        <p>請前往網址: <code className="bg-gray-100 px-2 py-1 rounded text-gray-600">http://localhost:3001/您的-Tenant-ID</code></p>
      </div>
    </div>
  );
}
