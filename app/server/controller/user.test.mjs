import { afterEach, describe, expect, jest } from "@jest/globals";

const mockUserRepository = {
  findByShareCode: jest.fn(),
};

const mockStayRepository = {
  findAllByUserId: jest.fn(),
};

await jest.unstable_mockModule(
  "../repository/user.js",
  () => mockUserRepository,
);

await jest.unstable_mockModule(
  "../repository/stay.js",
  () => mockStayRepository,
);

const userRepository = await import("../repository/user.js");
const stayRepository = await import("../repository/stay.js");
const { getStaysByShareCode } = await import("./user.js");

const user = {
  id: "abcdefghhr",
  shareCode: "ABCDabcd",
  email: "testuser@example.com",
  passwordHash: "$1$1$1fakehash",
  createdAt: "2026-08-16",
};

const stays = [
  {
    id: "ABCD1234abc",
    userId: user.id,
    city: "Seoul",
    country: "South Korea",
    startAt: "2026-08-01",
    endAt: null,
    expectedEndAt: "2026-08-16",
    comment: null,
    accommodation: "Seoul hostel",
    lat: 123.123,
    lng: 123.123,
  },
];

describe("user controller test", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("For a valid shareCode, return stay with 200 status", async () => {
    const req = {
      userId: user.id,
      params: {
        shareCode: user.shareCode,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    userRepository.findByShareCode.mockResolvedValue(user);
    stayRepository.findAllByUserId.mockResolvedValue(stays);

    await getStaysByShareCode(req, res);

    expect(userRepository.findByShareCode).toHaveBeenCalledWith(user.shareCode);
    expect(stayRepository.findAllByUserId).toHaveBeenCalledWith(user.id);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(stays);
  });

  test("For a invalid sharedCode, return 404", async () => {
    const req = { userId: user.id, params: { shareCode: user.shareCode } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    userRepository.findByShareCode.mockResolvedValue(undefined);

    await getStaysByShareCode(req, res);

    expect(stayRepository.findAllByUserId).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found." });
  });

  test("When user has no stays, return 200 with empty array", async () => {
    const req = { userId: user.id, params: { shareCode: user.shareCode } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    userRepository.findByShareCode.mockResolvedValue(user);
    stayRepository.findAllByUserId.mockResolvedValue([]);

    await getStaysByShareCode(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([]);
  });
});
