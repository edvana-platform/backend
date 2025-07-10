/*
  Warnings:

  - You are about to drop the column `class` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[phone]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `firstName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "class",
DROP COLUMN "name",
ADD COLUMN     "firstName" TEXT NOT NULL DEFAULT 'Default',
ADD COLUMN     "gradeLevels" "Class"[],
ADD COLUMN     "lastName" TEXT NOT NULL DEFAULT 'User',
ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "studentClass" "Class",
ADD COLUMN     "subjectSpecialties" TEXT[],
ADD COLUMN     "teacherClasses" "Class"[];

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
