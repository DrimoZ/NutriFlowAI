import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 12);

  await prisma.user.upsert({
    where: { email: 'demo@nutriflow.ai' },
    update: { name: 'Demo User', passwordHash },
    create: { email: 'demo@nutriflow.ai', name: 'Demo User', passwordHash },
  });
}

main().finally(() => prisma.$disconnect());
