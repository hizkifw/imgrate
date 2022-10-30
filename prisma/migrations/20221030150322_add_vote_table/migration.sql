-- CreateTable
CREATE TABLE "Vote" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "left" TEXT NOT NULL,
    "right" TEXT NOT NULL,
    "outcome" INTEGER NOT NULL
);
