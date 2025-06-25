/*
  Warnings:

  - Changed the column `class` on the `User` table from a scalar field to a list field. If there are non-null values in that column, this step will fail.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "class" SET DATA TYPE "Class"[] USING "class"::text::"Class"[];
