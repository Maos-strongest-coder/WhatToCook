import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CATEGORIES = [
  'vegetables',
  'fruit',
  'dairy',
  'meat',
  'fish',
  'grains',
  'spices',
  'drinks',
  'other',
];

async function main() {
  for (const name of CATEGORIES) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`Seeded ${CATEGORIES.length} categories.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
