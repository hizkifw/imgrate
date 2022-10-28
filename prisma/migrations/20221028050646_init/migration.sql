-- CreateTable
CREATE TABLE "Image" (
    "filename" TEXT NOT NULL PRIMARY KEY,
    "rating" REAL NOT NULL,
    "deviation" REAL NOT NULL,
    "volatility" REAL NOT NULL,
    "votes" INTEGER NOT NULL
);
