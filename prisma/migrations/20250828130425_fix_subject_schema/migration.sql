/*
  Warnings:

  - You are about to drop the column `class` on the `Subject` table. All the data in the column will be lost.
  - Added the required column `gradeId` to the `Subject` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Subject" DROP COLUMN "class",
ADD COLUMN     "code" TEXT,
ADD COLUMN     "gradeId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
