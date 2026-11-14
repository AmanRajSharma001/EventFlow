import config from "./env.js";

let prisma = null;

if (process.env.DATABASE_URL) {
  try {
    const { PrismaPg } = await import("@prisma/adapter-pg");
    const { PrismaClient } = await import("../../generated/prisma/client.ts");
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL
    });
    prisma = new PrismaClient({ adapter });
  } catch (error) {
    console.error("[Prisma Init Error] Failed to initialize Prisma client:", error?.message || error);
    prisma = null;
  }
}

export const isDatabaseReady = () => Boolean(process.env.DATABASE_URL && prisma);

export async function checkDatabaseConnection() {
  if (!isDatabaseReady()) {
    return {
      connected: false,
      error: process.env.DATABASE_URL ? "Prisma client initialization failed" : "DATABASE_URL not configured"
    };
  }
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { connected: true };
  } catch (err) {
    return {
      connected: false,
      error: err?.message || "Database connection test failed"
    };
  }
}

export default prisma;
