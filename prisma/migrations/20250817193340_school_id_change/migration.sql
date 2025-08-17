/*
  Warnings:

  - You are about to drop the column `studentSchoolId` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_studentSchoolId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "studentSchoolId",
ADD COLUMN     "schoolId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;
