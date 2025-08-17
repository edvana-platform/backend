/*
  Warnings:

  - You are about to drop the column `teacherId` on the `Subject` table. All the data in the column will be lost.
  - Changed the type of `class` on the `Subject` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Subject" DROP CONSTRAINT "Subject_teacherId_fkey";

-- AlterTable
ALTER TABLE "Subject" DROP COLUMN "teacherId",
ADD COLUMN     "userId" TEXT,
DROP COLUMN "class",
ADD COLUMN     "class" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
