-- AlterTable
ALTER TABLE "Resource" ADD COLUMN     "fileName" TEXT;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_fileName_fkey" FOREIGN KEY ("fileName") REFERENCES "File"("name") ON DELETE SET NULL ON UPDATE CASCADE;
