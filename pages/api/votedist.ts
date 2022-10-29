import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    const votes: number[] = [];

    while (votes.length === 0 || votes[votes.length - 1] > 0) {
      const n = votes.length;
      const voteCount = await prisma.image.count({
        where: {
          votes: {
            equals: n,
          },
        },
      });
      votes.push(voteCount);
    }

    // Return the votes
    res.status(200).json(votes);
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: ex });
  }
}
