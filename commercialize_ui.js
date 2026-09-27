const fs = require('fs');

function replaceInFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  for (const [search, replace] of replacements) {
    // using split join to replace all occurrences without regex escaping hassle
    content = content.split(search).join(replace);
  }
  fs.writeFileSync(filePath, content);
}

// 1. Admin Dashboard App.tsx
replaceInFile('apps/admin-dashboard/src/App.tsx', [
  ['📦 原物料庫存', '原物料庫存管理'],
  ['🍔 商品設定', '商品與配方設定'],
  ['📱 專屬 QR 碼', '桌邊點餐設定'],
  ['🏪 門市設定', '門市基本資料'],
  ['📊 營運報表', '營運數據分析'],
  ['Odinoder 總管理後台', '餐飲營運總管理中心'],
  ['Odinoder', '營運總部'],
  ['店長 (Admin)', '系統管理員'],
  ['✨', ''],
  ['🍔', ''],
  ['🎉', ''],
  ['🚀', ''],
  ['👉', ''],
  ['請在右側選擇您要管理的門市，或是建立一個全新的餐飲服務據點。', '請於右側選擇營業據點，或建立全新營業區域。']
]);

// 2. Admin Dashboard index.html
replaceInFile('apps/admin-dashboard/index.html', [
  ['<title>Vite + React + TS</title>', '<title>總管理中心 | 餐飲營運系統</title>'],
  ['<title>Admin Dashboard</title>', '<title>總管理中心 | 餐飲營運系統</title>']
]);

// 3. POS Tablet App.tsx
replaceInFile('apps/pos-tablet/src/App.tsx', [
  ['Odinoder Logo', 'System Logo'],
  ['Odinoder KDS', 'KDS'],
  ['Odinoder POS', 'POS'],
  ['Odinoder', 'POS'],
  ['KDS 吧台設備綁定', 'POS / KDS 終端設備授權'],
  ['請選擇此設備要綁定哪家實體門市', '請選擇本設備要授權之營業門市'],
  ['🍔', ''],
  ['✨', ''],
  ['👉', ''],
  ['🎉', '']
]);

// 4. POS Tablet index.html
replaceInFile('apps/pos-tablet/index.html', [
  ['<title>Vite + React + TS</title>', '<title>POS 接單系統 | 終端設備</title>'],
  ['<title>POS Tablet</title>', '<title>POS 接單系統 | 終端設備</title>']
]);

// 5. Consumer page.tsx
replaceInFile('apps/liff-consumer/src/app/page.tsx', [
  ['Odinoder', ''],
  ['歡迎使用線上點餐系統', '歡迎光臨'],
  ['請掃描店家專屬 QR Code 開始點餐', '請掃描桌面 QR Code 進行點餐'],
  ['🛒', ''],
  ['🍔', ''],
  ['✨', ''],
  ['🎉', '']
]);

// 6. Consumer layout.tsx
replaceInFile('apps/liff-consumer/src/app/layout.tsx', [
  ['Odinoder - 快速點餐系統', '線上點餐系統'],
  ['Odinoder', '線上點餐系統']
]);

console.log('Commercialization UI update completed');
