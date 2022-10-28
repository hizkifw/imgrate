import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
const glicko2 = require("glicko2");

const prisma = new PrismaClient();

export type VoteRequest = {
  left: string;
  right: string;
  outcome: "left" | "right" | "tie";
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
    const { left, right, outcome } = req.body as VoteRequest;

    // Fetch the images
    const leftImage = await prisma.image.findUnique({
      where: { filename: left },
    });
    const rightImage = await prisma.image.findUnique({
      where: { filename: right },
    });

    // Update the ratings
    const ranking = new glicko2.Glicko2(glickoSettings);
    const leftPlayer = ranking.makePlayer(
      leftImage!.rating,
      leftImage!.deviation,
      leftImage!.volatility
    );
    const rightPlayer = ranking.makePlayer(
      rightImage!.rating,
      rightImage!.deviation,
      rightImage!.volatility
    );
    ranking.updateRatings([
      [
        leftPlayer,
        rightPlayer,
        outcome === "left" ? 1 : outcome === "right" ? 0 : 0.5,
      ],
    ]);

    // Update the database
    await prisma.$transaction([
      prisma.image.update({
        where: { filename: left },
        data: {
          rating: leftPlayer.getRating(),
          deviation: leftPlayer.getRd(),
          volatility: leftPlayer.getVol(),
          votes: { increment: 1 },
        },
      }),
      prisma.image.update({
        where: { filename: right },
        data: {
          rating: rightPlayer.getRating(),
          deviation: rightPlayer.getRd(),
          volatility: rightPlayer.getVol(),
          votes: { increment: 1 },
        },
      }),
    ]);
    res.status(200).json({ success: true });
  } catch (ex) {
    res.status(500).json({ error: ex });
  }
}
