import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    // Get skip and take from query
    const { skip, take } = req.query;

    // Fetch two images with the least votes
    const images = await prisma.image.findMany({
      orderBy: { rating: "desc" },
      skip: skip ? parseInt(skip as string) : 0,
      take: take ? parseInt(take as string) : 100,
    });

    // Return the images
    res.status(200).json(images);
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: ex });
  }
}
