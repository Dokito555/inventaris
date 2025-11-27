/*
  Warnings:

  - You are about to drop the column `duration` on the `Borrow` table. All the data in the column will be lost.
  - Added the required column `borrowed_at` to the `Borrow` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Borrow" DROP COLUMN "duration",
ADD COLUMN     "borrowed_at" TIMESTAMP(3) NOT NULL;
