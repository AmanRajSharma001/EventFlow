// This script tests if our PostgreSQL database connection is working.
// Useful for health checks and verifying setup in development.
import prisma from "../src/config/prisma.js";

async function main() {
  try {
    // Run a basic raw SQL query to test the connection
    const result = await prisma.$queryRaw`SELECT 1 AS ok`;
    console.log("Database connection test succeeded:", result);
  } catch (error) {
    console.error("Database connection test failed:", error?.message || error);
    process.exitCode = 1;
  } finally {
    // Close the database connection pool so the Node process can exit cleanly
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

main();
