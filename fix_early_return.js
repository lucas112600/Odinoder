const fs = require('fs');

let c = fs.readFileSync('apps/liff-consumer/src/app/page.tsx', 'utf8');

c = c.replace(
  /const presetTags = \[.*?\];\s*return \(/s,
  `const presetTags = ['少冰', '去冰', '熱', '無糖', '微糖', '半糖', '加辣', '不加蔥', '不加香菜'];\n\n  if (!tenantId) {
    return <div className="p-8 text-center mt-20"><h1 className="text-2xl font-bold mb-4">歡迎光臨</h1><p>請掃描桌面 QR Code 進行點餐</p></div>;
  }\n\n  return (`
);

fs.writeFileSync('apps/liff-consumer/src/app/page.tsx', c);
console.log('Fixed missing early return due to encoding');
