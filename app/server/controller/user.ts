import type { Request, Response } from "express";
import * as userRepository from "../repository/user.js";
import * as stayRepository from "../repository/stay.js";

type ShareCodeParams = { shareCode: string };

export async function getStaysByShareCode(
  req: Request<ShareCodeParams>,
  res: Response,
): Promise<void> {
  const { shareCode } = req.params;

  const user = await userRepository.findByShareCode(shareCode);
  if (!user) {
    res.status(404).json({ message: "User not found." });
    return;
  }

  const stays = await stayRepository.findAllByUserId(user.id);
  res.status(200).json(stays);
}
