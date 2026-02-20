import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.item.upsert({
    where: { id: 'seed-item-1' },
    update: {},
    create: {
      id: 'seed-item-1',
      title: 'Sample Item 1',
      description: 'First sample item for testing favorites',
    },
  });
  await prisma.item.upsert({
    where: { id: 'seed-item-2' },
    update: {},
    create: {
      id: 'seed-item-2',
      title: 'Sample Item 2',
      description: 'Second sample item',
    },
  });
  await prisma.item.upsert({
    where: { id: 'seed-item-3' },
    update: {},
    create: {
      id: 'seed-item-3',
      title: 'Sample Item 3',
      description: 'Third sample item',
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
