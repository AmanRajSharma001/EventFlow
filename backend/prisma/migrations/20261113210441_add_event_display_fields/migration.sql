-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "coordinator" TEXT,
ADD COLUMN     "department" TEXT,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "price" TEXT NOT NULL DEFAULT 'Free',
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
