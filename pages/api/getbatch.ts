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
    // Count the number of images
    const imageCount = await prisma.image.count({
      where: whereNotVideo,
    });

    // Sample a random image from the top percentiles
    const percentiles = [0.0, 0.1, 0.25, 0.5, 0.75, 0.95];
    const offsets = percentiles.map(
      (p) =>
        // Get nth percentile item
        Math.floor(p * imageCount) +
        // Get surrounding 5%
        Math.floor(Math.random() * (imageCount * 0.05))
    );
    const imgPercentiles = await Promise.all(
      offsets.map((offset) =>
        prisma.image.findFirst({
          where: whereNotVideo,
          orderBy: [{ rating: 'desc' }, { votes: 'asc' }],
          skip: offset,
        })
      )
    ).then((images) => images.filter((image) => image !== null));

    // Get a list of least-voted images
    const imgLeastVoted = await prisma.image.findMany({
      where: whereNotVideo,
      orderBy: [{ votes: 'asc' }, { rating: 'desc' }],
      take: 6,
    });

    const images = [...imgPercentiles, ...imgLeastVoted]
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value)
      .slice(0, 6);

    // Return the images
    res.status(200).json(images);
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: ex });
  }
}
