let prisma = null;

try {
  const { PrismaClient } = await import("@prisma/client");
  prisma = new PrismaClient();
} catch {
  prisma = null;
}

export const isDatabaseReady = () => Boolean(prisma);

export default prisma;
