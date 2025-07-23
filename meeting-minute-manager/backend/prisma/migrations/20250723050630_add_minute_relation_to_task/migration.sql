-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "minuteId" TEXT;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_minuteId_fkey" FOREIGN KEY ("minuteId") REFERENCES "Minute"("id") ON DELETE SET NULL ON UPDATE CASCADE;
