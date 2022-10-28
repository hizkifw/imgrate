import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    // Fetch two images with the least votes
    const images = await prisma.image.findMany({
      orderBy: [{ votes: "asc" }, { rating: "desc" }],
      take: 2,
    });

    // Return the images
    res.status(200).json(images);
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: ex });
  }
}
