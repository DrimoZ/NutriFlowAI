import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.user.upsert({ where: { email: 'demo@nutriflow.ai' }, update: {}, create: { email: 'demo@nutriflow.ai', name: 'Demo User', passwordHash: 'demo-hash' } });
}
main().finally(() => prisma.$disconnect());
