-- CreateTable
CREATE TABLE "Games" (
    "id" SERIAL NOT NULL,
    "playerOneWin" BOOLEAN NOT NULL DEFAULT false,
    "playerTwoWin" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Games_pkey" PRIMARY KEY ("id")
);
