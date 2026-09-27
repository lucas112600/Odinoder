const { PrismaClient } = require('./apps/backend/node_modules/@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    const tables = await prisma.$queryRaw\`SELECT table_name FROM information_schema.tables WHERE table_schema='public'\`;
    console.log('Tables:', tables);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
