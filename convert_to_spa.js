const fs = require('fs');

// 1. Read the current dynamic page
let c = fs.readFileSync('apps/liff-consumer/src/app/[tenantId]/page.tsx', 'utf8');

// 2. Replace tenantId parsing
c = c.replace(
  /const params = useParams\(\);\n\s*const searchParams = useSearchParams\(\);\n\s*const tenantId = params\.tenantId as string;/,
  `const searchParams = useSearchParams();\n  const tenantId = searchParams.get('store');`
);

// 3. Handle cases where tenantId is missing
c = c.replace(
  /const tableNumber = searchParams\.get\('table'\) \|\| '未指定桌號';/,
  `const tableNumber = searchParams.get('table') || '未指定桌號';\n\n  if (!tenantId) {\n    return <div className="p-8 text-center mt-20"><h1 className="text-2xl font-bold mb-4">歡迎使用 Odinoder</h1><p>請掃描店家專屬 QR Code 開始點餐</p></div>;\n  }`
);

// 4. Overwrite src/app/page.tsx
fs.writeFileSync('apps/liff-consumer/src/app/page.tsx', c);

// 5. Delete the [tenantId] folder
fs.rmSync('apps/liff-consumer/src/app/[tenantId]', { recursive: true, force: true });

// 6. Put back output: 'export'
const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;`;
fs.writeFileSync('apps/liff-consumer/next.config.mjs', nextConfig);

console.log('Conversion to Query Param routing completed!');
