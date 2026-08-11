import type { Request, Response } from "express";
import * as stayRepository from "../repository/stay.js";
import type { UpdateStayInput } from "../repository/stay.js";
import { geocode } from "../integration/geocoding.js";

type IdParams = { id: string }; // NOTE: 더 나은 방법은 없나?

// TODO: 공통 함수로 리팩토링
function getUserId(req: Request, res: Response): string | undefined {
  if (!req.userId) {
    res.status(401).json({ message: "Unauthorized" });
    return undefined;
  }
  return req.userId;
}

export async function createStay(req: Request, res: Response) {
  const userId = getUserId(req, res);
  if (!userId) return;

  // TODO: 유효성 검증
  const {
    city,
    country,
    startAt,
    endAt,
    expectedEndAt,
    comment,
    accommodation,
  } = req.body ?? {};

  const coords = await geocode(city, country);

  try {
    const stay = await stayRepository.create({
      userId,
      city,
      country,
      startAt,
      endAt,
      expectedEndAt,
      comment,
      accommodation,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
    });

    res.status(201).json(stay);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong." });
  }
}

export async function getStays(req: Request, res: Response) {
  const userId = getUserId(req, res);
  if (!userId) return;

  const stays = await stayRepository.findAllByUserId(userId);
  res.status(200).json(stays);
}

export async function getStayById(
  req: Request<IdParams>,
  res: Response,
): Promise<void> {
  const userId = getUserId(req, res);
  if (!userId) return;

  const { id } = req.params;
  const stay = await stayRepository.findOneByIdAndUserId(id, userId);
  if (!stay) {
    res.status(404).json({ message: "Stay not found." });
    return;
  }
  res.status(200).json(stay);
}

export async function removeStay(
  req: Request<IdParams>,
  res: Response,
): Promise<void> {
  const userId = getUserId(req, res);
  if (!userId) return;

  const { id } = req.params;
  const deletedCount = await stayRepository.remove(id, userId);
  if (deletedCount == 0) {
    res.status(404).json({ message: "Something went wrong." });
  } else {
    res.sendStatus(204);
  }
}

export async function updateStay(
  req: Request<IdParams>,
  res: Response,
): Promise<void> {
  const userId = getUserId(req, res);
  if (!userId) return;

  const { id } = req.params;
  const {
    city,
    country,
    startAt,
    endAt,
    expectedEndAt,
    comment,
    accommodation,
  } = req.body ?? {};

  // NOTE: undefined인 params를 strip 해줘야 한다.
  const params = Object.fromEntries(
    Object.entries({
      city,
      country,
      startAt,
      endAt,
      expectedEndAt,
      comment,
      accommodation,
    }).filter(([_, value]) => !!value),
  ) as UpdateStayInput;

  if (Object.keys(params).length === 0) {
    res.status(400).json({ message: "No updatable fields provided." });
    return;
  }

  if (params.city || params.country) {
    // NOTE: 둘 중 하나만 변경하는 경우 geoCode 계산을 위해 다른 하나도 필요하다.
    const prev = await stayRepository.findOneByIdAndUserId(id, userId);
    if (!prev) {
      res.status(404).json({ message: "Stay not found." });
      return;
    }
    const city = params.city ?? prev.city;
    const country = params.country ?? prev.country;
    const coords = await geocode(city, country);
    params.lat = coords?.lat ?? null;
    params.lng = coords?.lng ?? null;
  }

  const affectedCount = await stayRepository.update(id, userId, params);
  if (affectedCount == 1) {
    const stay = await stayRepository.findOneByIdAndUserId(id, userId);
    res.status(200).json(stay);
  } else {
    res.status(404).json({ message: "Stay not found." });
  }
}
