let prisma = null;

try {
  const { PrismaClient } = await import("@prisma/client");
  prisma = new PrismaClient();
} catch {
  try {
    const { PrismaClient } = await import("../../generated/prisma/client.ts");
    const { PrismaPg } = await import("@prisma/adapter-pg");
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL
    });
    prisma = new PrismaClient({ adapter });
  } catch {
    prisma = null;
  }
}

export const isDatabaseReady = () => Boolean(prisma);

export default prisma;
