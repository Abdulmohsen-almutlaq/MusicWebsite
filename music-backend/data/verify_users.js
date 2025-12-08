const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Verifying all users...');
  try {
    const updated = await prisma.user.updateMany({
      where: { isVerified: false },
      data: { isVerified: true },
    });
    console.log(`Successfully verified ${updated.count} users.`);
  } catch (e) {
    console.error('Error verifying users:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();