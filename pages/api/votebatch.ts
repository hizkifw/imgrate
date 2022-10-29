import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
// import glicko2 from 'glicko2';
const glicko2 = require('glicko2');

const prisma = new PrismaClient();

export type VoteRequest = {
  left: string;
  right: string;
  outcome: 'left' | 'right' | 'tie';
};

var glickoSettings = {
  // tau : "Reasonable choices are between 0.3 and 1.2, though the system should
  //      be tested to decide which value results in greatest predictive accuracy."
  tau: 0.5,
  // rating : default rating
  rating: 1500,
  //rd : Default rating deviation
  //     small number = good confidence on the rating accuracy
  rd: 200,
  //vol : Default volatility (expected fluctation on the player rating)
  vol: 0.06,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    // Parse the request body
    const votes = req.body as VoteRequest[];
    const ranking = new glicko2.Glicko2(glickoSettings);
    const images = Array.from(
      new Set(
        votes.map((v) => v.left).concat(votes.map((v) => v.right))
      ).values()
    );
    const players: { [key: string]: any } = {};

    // Fetch the players
    for (const image of images) {
      const player = await prisma.image.findUnique({
        where: {
          filename: image,
        },
      });
      if (player)
        players[image] = ranking.makePlayer(
          player.rating,
          player.deviation,
          player.volatility
        );
    }

    const outcomes = [];
    for (const vote of votes) {
      const { left, right, outcome } = vote;

      outcomes.push([
        players[left],
        players[right],
        outcome === 'left' ? 1 : outcome === 'right' ? 0 : 0.5,
      ]);
    }
    ranking.updateRatings(outcomes);

    await prisma.$transaction(
      Object.entries(players).map(([filename, player]) =>
        prisma.image.update({
          where: { filename },
          data: {
            rating: player.getRating(),
            deviation: player.getRd(),
            volatility: player.getVol(),
            votes: {
              increment: votes.filter(
                (v) => v.left === filename || v.right === filename
              ).length,
            },
          },
        })
      )
    );

    res.status(200).json({ success: true });
  } catch (ex) {
    res.status(500).json({ error: ex });
  }
}
