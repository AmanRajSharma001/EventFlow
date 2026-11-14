// Load environment variables like DATABASE_URL from the .env file
import "dotenv/config";

// In Prisma 7, the query engine does not connect to PostgreSQL on its own.
// Instead, it uses an "adapter" (PrismaPg) as a bridge between Prisma
// and the standard Node.js PostgreSQL driver ("pg") to run queries.
import { PrismaPg } from "@prisma/adapter-pg";

// Import the generated Prisma client TypeScript file.
// Node 24 natively strips TypeScript types, so we can import it directly.
import { PrismaClient } from "../../generated/prisma/client.ts";

let prisma = null;

try {
  // Create an adapter using our PostgreSQL connection URL
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });

  // Initialize the Prisma client using the PostgreSQL adapter
  prisma = new PrismaClient({ adapter });
} catch (error) {
  // If the database fails to initialize, log the real error message
  console.error("Error initializing Prisma Client:", error?.message || error);
  prisma = null;
}

// Helper function used by controllers to check if the database is ready
export const isDatabaseReady = () => Boolean(prisma);

// Export the singleton Prisma client instance for use throughout the app
export default prisma;
