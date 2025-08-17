-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "description" TEXT,
ADD COLUMN     "durationWeeks" INTEGER,
ADD COLUMN     "teacherId" TEXT;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
