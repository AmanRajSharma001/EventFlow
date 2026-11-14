import "dotenv/config";

let prisma = null;

if (process.env.DATABASE_URL) {
  try {
    const { PrismaPg } = await import("@prisma/adapter-pg");
    const { PrismaClient } = await import("../../generated/prisma/client.ts");
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL
    });
    prisma = new PrismaClient({ adapter });
  } catch {
    prisma = null;
  }
}

export const isDatabaseReady = () => Boolean(process.env.DATABASE_URL && prisma);

export default prisma;
