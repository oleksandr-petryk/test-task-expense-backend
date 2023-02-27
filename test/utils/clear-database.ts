import { PrismaService } from '@Shared/modules/prisma/prisma.service';

export async function clearDatabase() {
  const prisma = new PrismaService();

  await prisma.transaction.deleteMany();
  await prisma.expenseCategory.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
}
