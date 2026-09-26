const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tenantId = '11111111-1111-1111-1111-111111111111';
  
  const existing = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!existing) {
    await prisma.tenant.create({
      data: {
        id: tenantId,
        name: '美味食堂 (Demo)',
        subscriptionPlan: 'PRO'
      }
    });
    console.log('✅ 預設店家 (Tenant) 已經建立成功！');
  } else {
    console.log('⚡ 預設店家已存在。');
  }
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
