const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Checking AccessRequests...');
  const requests = await prisma.accessRequest.findMany();
  console.log('All Requests:', JSON.stringify(requests, null, 2));
  
  console.log('Checking Users with Role Admin...');
  const admins = await prisma.user.findMany({ where: { role: 'admin' } });
  console.log('Admins:', JSON.stringify(admins, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
