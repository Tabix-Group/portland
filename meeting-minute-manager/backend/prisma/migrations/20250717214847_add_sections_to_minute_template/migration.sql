/*
  Warnings:

  - Added the required column `sections` to the `MinuteTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MinuteTemplate" ADD COLUMN     "sections" JSONB NOT NULL;
