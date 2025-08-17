-- DropForeignKey
ALTER TABLE "CourseMaterial" DROP CONSTRAINT "CourseMaterial_uploadedById_fkey";

-- AlterTable
ALTER TABLE "CourseMaterial" ALTER COLUMN "uploadedById" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "CourseMaterial" ADD CONSTRAINT "CourseMaterial_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
