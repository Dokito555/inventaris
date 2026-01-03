/*
  Warnings:

  - Made the column `return_date` on table `Borrow` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Borrow" ALTER COLUMN "return_date" SET NOT NULL;
