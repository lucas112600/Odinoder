const fs = require('fs');

let c = fs.readFileSync('apps/liff-consumer/src/app/page.tsx', 'utf8');

const earlyReturn = `  if (!tenantId) {
    return <div className="p-8 text-center mt-20"><h1 className="text-2xl font-bold mb-4">歡迎光臨</h1><p>請掃描桌面 QR Code 進行點餐</p></div>;
  }`;

// Remove the early return from the top
c = c.replace(earlyReturn, '');
// For fallback if my exact match doesn't work due to encoding/CRLF:
c = c.replace(/  if \(\!tenantId\) \{\s*return <div className="p-8 text-center mt-20">.*?<\/div>;\s*\}/, '');

// Insert it right before the main return (
c = c.replace(
  /  const presetTags = \['少冰', '去冰', '熱', '無糖', '微糖', '半糖', '加辣', '不加蔥', '不加香菜'\];\s*return \(/,
  `  const presetTags = ['少冰', '去冰', '熱', '無糖', '微糖', '半糖', '加辣', '不加蔥', '不加香菜'];\n\n  if (!tenantId) {
    return <div className="p-8 text-center mt-20"><h1 className="text-2xl font-bold mb-4">歡迎光臨</h1><p>請掃描桌面 QR Code 進行點餐</p></div>;
  }\n\n  return (`
);

// We should also wrap useEffect fetch with `if(!tenantId) return;`
c = c.replace(
  /useEffect\(\(\) => \{\n    fetch/,
  "useEffect(() => {\n    if (!tenantId) return;\n    fetch"
);

fs.writeFileSync('apps/liff-consumer/src/app/page.tsx', c);
console.log('Fixed React hook violation');
