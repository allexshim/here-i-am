import * as stayRepository from "../data/stay.js";

// TODO: TypeScript로 리팩토링?
export async function createStay(req, res) {
  // TODO: city, country 입력 > lat, lng 찾아오는 구글맵 API 연동
  const {
    city,
    country,
    start_at,
    end_at,
    expected_end_at,
    comment,
    accommodation,
  } = req.body;
  try {
    const id = await stayRepository.create({
      city,
      country,
      start_at,
      end_at,
      expected_end_at,
      comment,
      accommodation,
    });
    const newStay = await stayRepository.findById(id);
    res.status(201).json(newStay);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong." });
  }
}

export async function getStays(req, res) {
  const stays = await stayRepository.findAll();
  res.status(200).json(stays);
}

export async function getStayById(req, res) {
  const { id } = req.params;
  const stay = await stayRepository.findById(id);
  res.status(200).json(stay);
}

export async function removeStay(req, res) {
  const { id } = req.params;
  const deletedCount = await stayRepository.remove(id);
  if (deletedCount == 0) {
    res.status(404).json({ message: "Something went wrong." });
  } else {
    res.sendStatue(204);
  }
}

export async function updateStay(req, res) {
  const { id, expected_end_at, end_at, start_at, comment, accommodation } =
    req.params;

  const affectedCount = await stayRepository.update(id, {
    expected_end_at,
    end_at,
    start_at,
    comment,
    accommodation,
  });
  if (affectedCount == 1) {
    const stay = await stayRepository.findById(id);
    res.status(200).json(stay);
  } else {
    res.status(404).json({ message: "Something went wrong." });
  }
}
