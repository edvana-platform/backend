/*
  Warnings:

  - You are about to drop the column `subject` on the `CourseMaterial` table. All the data in the column will be lost.
  - Added the required column `subjectId` to the `CourseMaterial` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CourseMaterial" DROP COLUMN "subject",
ADD COLUMN     "subjectId" TEXT NOT NULL,
ADD COLUMN     "topicId" TEXT;

-- CreateIndex
CREATE INDEX "CourseMaterial_subjectId_idx" ON "CourseMaterial"("subjectId");

-- CreateIndex
CREATE INDEX "CourseMaterial_topicId_idx" ON "CourseMaterial"("topicId");

-- AddForeignKey
ALTER TABLE "CourseMaterial" ADD CONSTRAINT "CourseMaterial_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseMaterial" ADD CONSTRAINT "CourseMaterial_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
