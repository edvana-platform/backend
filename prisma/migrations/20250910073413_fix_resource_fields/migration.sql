/*
  Warnings:

  - You are about to drop the column `gradeId` on the `Resource` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Resource" DROP CONSTRAINT "Resource_gradeId_fkey";

-- AlterTable
ALTER TABLE "Resource" DROP COLUMN "gradeId",
ADD COLUMN     "gradeIds" TEXT[];

-- CreateTable
CREATE TABLE "_ResourceGrades" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ResourceGrades_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ResourceGrades_B_index" ON "_ResourceGrades"("B");

-- AddForeignKey
ALTER TABLE "_ResourceGrades" ADD CONSTRAINT "_ResourceGrades_A_fkey" FOREIGN KEY ("A") REFERENCES "Grade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ResourceGrades" ADD CONSTRAINT "_ResourceGrades_B_fkey" FOREIGN KEY ("B") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
