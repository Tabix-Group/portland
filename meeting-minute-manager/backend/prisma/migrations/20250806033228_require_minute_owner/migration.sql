/*
  Warnings:

  - Made the column `createdById` on table `Minute` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Minute" DROP CONSTRAINT "Minute_createdById_fkey";

-- AlterTable
ALTER TABLE "Minute" ALTER COLUMN "createdById" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Minute" ADD CONSTRAINT "Minute_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
