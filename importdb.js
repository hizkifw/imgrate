// Look for files in the public/images directory and import them into the
// database.

const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const dir = path.join(__dirname, "public", "images");

fs.readdir(dir, async (err, files) => {
  if (err) {
    console.error(err);
    return;
  }

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isFile()) {
      try {
        const image = await prisma.image.create({
          data: {
            filename: file,
            rating: 1500,
            deviation: 200,
            volatility: 0.06,
            votes: 0,
          },
        });
        console.log(image);
      } catch (e) {
        console.error("Skipped", file);
      }
    }
  }
});
