import * as stayRepository from "../data/stay.js";

export async function createStay(req, res) {
  // TODO: lat, lng 정보 = 입력받은 city name 일치하는지 검증
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

export async function removeStay(req, res) {}

export async function updateStay(req, res) {}
