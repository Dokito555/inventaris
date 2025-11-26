/*
  Warnings:

  - You are about to drop the column `phone_number` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `item_id` on the `Borrow` table. All the data in the column will be lost.
  - You are about to drop the column `teacher_id` on the `Borrow` table. All the data in the column will be lost.
  - Added the required column `phoneNumber` to the `Admin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itemId` to the `Borrow` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teacherId` to the `Borrow` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Borrow" DROP CONSTRAINT "Borrow_item_id_fkey";

-- DropForeignKey
ALTER TABLE "Borrow" DROP CONSTRAINT "Borrow_teacher_id_fkey";

-- AlterTable
ALTER TABLE "Admin" DROP COLUMN "phone_number",
ADD COLUMN     "phoneNumber" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Borrow" DROP COLUMN "item_id",
DROP COLUMN "teacher_id",
ADD COLUMN     "itemId" TEXT NOT NULL,
ADD COLUMN     "teacherId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_token_idx" ON "Session"("token");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Borrow" ADD CONSTRAINT "Borrow_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Borrow" ADD CONSTRAINT "Borrow_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
