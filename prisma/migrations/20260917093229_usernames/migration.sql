/*
  Warnings:

  - You are about to drop the column `playerOneWin` on the `Games` table. All the data in the column will be lost.
  - You are about to drop the column `playerTwoWin` on the `Games` table. All the data in the column will be lost.
  - Added the required column `playerOneName` to the `Games` table without a default value. This is not possible if the table is not empty.
  - Added the required column `playerTwoName` to the `Games` table without a default value. This is not possible if the table is not empty.
  - Added the required column `winner` to the `Games` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Games" DROP COLUMN "playerOneWin",
DROP COLUMN "playerTwoWin",
ADD COLUMN     "playerOneName" TEXT NOT NULL,
ADD COLUMN     "playerTwoName" TEXT NOT NULL,
ADD COLUMN     "winner" TEXT NOT NULL;
