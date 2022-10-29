import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const whereNotVideo = {
  AND: [
    {
      filename: {
        not: {
          endsWith: '.gif',
        },
      },
    },
    {
      filename: {
        not: {
          endsWith: '.mp4',
        },
      },
    },
    {
      filename: {
        not: {
          endsWith: '.webm',
        },
      },
    },
  ],
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    // Fetch two images
    const imagesA = await prisma.image.findMany({
      where: whereNotVideo,
      orderBy:
        Math.random() < 0.1
          ? [{ rating: 'desc' }, { votes: 'desc' }]
          : [{ votes: 'asc' }, { rating: 'desc' }],
      take: 50,
    });
    const imagesB = await prisma.image.findMany({
      where: whereNotVideo,
      orderBy:
        Math.random() < 0.1
          ? [{ rating: 'desc' }, { votes: 'desc' }]
          : [{ votes: 'asc' }, { rating: 'desc' }],
      take: 50,
    });

    // Take 2 random images from the list
    const shuffledA = [...imagesA].sort(() => 0.5 - Math.random());
    const shuffledB = [...imagesB]
      .sort(() => 0.5 - Math.random())
      .filter((now) => now.filename !== shuffledA[0].filename);
    const selected = [shuffledA[0], shuffledB[0]];

    // Return the images
    res.status(200).json(selected);
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: ex });
  }
}
