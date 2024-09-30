-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "key" TEXT,
ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT false;
