/*
  Warnings:

  - The `externalMentions` column on the `Minute` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Minute" DROP COLUMN "externalMentions",
ADD COLUMN     "externalMentions" TEXT[];
