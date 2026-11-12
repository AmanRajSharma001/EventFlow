// Load environment variables from .env file
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Configuration for Prisma 7
// Tells Prisma where to find the schema, where migrations live,
// and which database connection string to use.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: env("DATABASE_URL") },
});
