/*
  Warnings:

  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" TEXT;
UPDATE "User" SET "password" = '123456' WHERE "password" IS NULL;
ALTER TABLE "User" ALTER COLUMN "password" SET NOT NULL;
