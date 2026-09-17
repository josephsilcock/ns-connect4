-- CreateTable
CREATE TABLE "GameStatus" (
    "id" SERIAL NOT NULL,
    "board" JSONB NOT NULL,
    "state" TEXT NOT NULL,
    "currentPlayer" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameStatus_pkey" PRIMARY KEY ("id")
);
