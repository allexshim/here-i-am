import { afterEach, describe, expect, jest } from "@jest/globals";

const mockStayRepository = {
  findAllByUserId: jest.fn(),
  findOneByIdAndUserId: jest.fn(),
  create: jest.fn(),
  remove: jest.fn(),
  update: jest.fn(),
};

const mockGeocoding = {
  geocode: jest.fn(),
};

await jest.unstable_mockModule(
  "../repository/stay.js",
  () => mockStayRepository,
);

await jest.unstable_mockModule(
  "../integration/geocoding.js",
  () => mockGeocoding,
);

const stayRepository = await import("../repository/stay.js");
const { geocode } = await import("../integration/geocoding.js");
const { createStay, getStays, getStayById, removeStay, updateStay } =
  await import("./stay.js");

const userId = "AbCdEfGhIjKl";
const stays = [
  {
    id: "sTaYIdSeoul1",
    userId,
    city: "Seoul",
    country: "South Korea",
    startAt: "2026-08-07",
    endAt: null,
    expectedEndAt: "2026-08-10",
    comment: null,
    accommodation: "Seoul hostel",
    lat: 123.123,
    lng: 123.123,
  },
  {
    id: "sTaYIdBusan2",
    userId,
    city: "Busan",
    country: "South Korea",
    startAt: "2026-08-10",
    endAt: null,
    expectedEndAt: "2026-08-20",
    comment: null,
    accommodation: "Busan hostel",
    lat: 345.345,
    lng: 345.345,
  },
];

function mockReq(overrides = {}) {
  return { params: {}, body: {}, userId, ...overrides };
}

function mockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    sendStatus: jest.fn(),
  };
}

describe("stay controller test", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createStay test", () => {
    test("get coords and create stay, returns new stay with status 201", async () => {
      const req = mockReq({
        body: {
          city: "Seoul",
          country: "South Korea",
          startAt: "2026-08-07",
          expectedEndAt: "2026-08-10",
          accommodation: "Seoul Hostel",
        },
      });
      const res = mockRes();

      geocode.mockResolvedValue({ lat: 123.123, lng: 123.123 });
      stayRepository.create.mockResolvedValue(stays[0]);

      await createStay(req, res);

      expect(geocode).toHaveBeenCalledWith("Seoul", "South Korea");
      expect(stayRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          city: "Seoul",
          country: "South Korea",
          startAt: "2026-08-07",
          expectedEndAt: "2026-08-10",
          accommodation: "Seoul Hostel",
          lat: 123.123,
          lng: 123.123,
        }),
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(stays[0]);
    });

    test("When geocoding fail, create stay with null coords", async () => {
      const req = mockReq({
        body: {
          city: "mars",
          country: "somewhere not earth",
          startAt: "2026-08-07",
          expectedEndAt: "2026-08-10",
          accommodation: "Seoul Hostel",
        },
      });
      const res = mockRes();

      geocode.mockResolvedValue(null);
      stayRepository.create.mockResolvedValue({
        ...stays[0],
        lat: null,
        lng: null,
      });

      await createStay(req, res);

      expect(geocode).toHaveBeenCalled();
      expect(stayRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ lat: null, lng: null }),
      );
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test("returns 500 with error message when repository throws error", async () => {
      const req = mockReq({
        body: {
          city: "Seoul",
          country: "South Korea",
          startAt: "2026-03-02",
          expectedEndAt: "2026-03-12",
          accommodation: "Seoul Hostel",
        },
      });
      const res = mockRes();

      stayRepository.create.mockRejectedValue(new Error("DB error"));

      await createStay(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Something went wrong.",
      });
    });
  });

  describe("getStays test", () => {
    test("return all stays owned by user with status 200", async () => {
      const req = mockReq();
      const res = mockRes();

      stayRepository.findAllByUserId.mockResolvedValue(stays);

      await getStays(req, res);

      expect(stayRepository.findAllByUserId).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(stays);
    });
  });

  describe("getStayById test", () => {
    test("return stay with status 200", async () => {
      const req = mockReq({ params: { id: stays[0].id } });
      const res = mockRes();

      stayRepository.findOneByIdAndUserId.mockResolvedValue(stays[0]);

      await getStayById(req, res);

      expect(stayRepository.findOneByIdAndUserId).toHaveBeenCalledWith(
        stays[0].id,
        userId,
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(stays[0]);
    });

    test("return 404 when stay not found", async () => {
      const req = mockReq({ params: { id: "other" } });
      const res = mockRes();

      stayRepository.findOneByIdAndUserId.mockResolvedValue(undefined);

      await getStayById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Stay not found." });
    });
  });

  describe("removeStay test", () => {
    test("returns 204 when stay is deleted", async () => {
      const req = mockReq({ params: { id: stays[0].id } });
      const res = mockRes();

      // mock affected row count
      stayRepository.remove.mockResolvedValue(1);

      await removeStay(req, res);
      expect(stayRepository.remove).toHaveBeenCalledWith(stays[0].id, userId);
      expect(res.sendStatus).toHaveBeenCalledWith(204);
    });

    test("return 404 when stay does not exist", async () => {
      const req = mockReq({ params: { id: "other" } });
      const res = mockRes();

      // 0 rows affected
      stayRepository.remove.mockResolvedValue(0);

      await removeStay(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Something went wrong.",
      });
    });
  });

  describe("updateStay test", () => {
    test("no coords changed: return updated stay with status 200", async () => {
      const body = {
        endAt: "2026-08-10",
        comment: "Left as plan",
      };
      const req = mockReq({ params: { id: stays[0].id }, body });
      const res = mockRes();

      stayRepository.update.mockResolvedValue(1);
      stayRepository.findOneByIdAndUserId.mockResolvedValue({
        ...stays[0],
        ...body,
      });

      await updateStay(req, res);

      expect(geocode).not.toHaveBeenCalled();
      expect(stayRepository.update).toHaveBeenCalledWith(stays[0].id, userId, {
        comment: "Left as plan",
        endAt: "2026-08-10",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ ...stays[0], ...body });
    });

    test("coords changed: re-geocode when city, country changed", async () => {
      const req = mockReq({
        params: { id: stays[0].id },
        body: {
          city: "Busan",
        },
      });
      const res = mockRes();

      stayRepository.findOneByIdAndUserId
        .mockResolvedValueOnce(stays[0])
        .mockResolvedValueOnce({
          ...stays[0],
          city: "Busan",
          lat: 345.345,
          lng: 345.345,
        });
      geocode.mockResolvedValue({ lat: 345.345, lng: 345.345 });
      stayRepository.update.mockResolvedValue(1);

      await updateStay(req, res);

      expect(geocode).toHaveBeenCalledWith("Busan", stays[0].country);
      expect(stayRepository.update).toHaveBeenCalledWith(
        stays[0].id,
        userId,
        expect.objectContaining({
          city: "Busan",
          lat: 345.345,
          lng: 345.345,
        }),
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        ...stays[0],
        ...{ city: "Busan", lat: 345.345, lng: 345.345 },
      });
    });

    test("When geocoding fail, update stay with null coords", async () => {
      const req = mockReq({
        params: { id: stays[0].id },
        body: {
          city: "mars",
          country: "somewhere not earth",
        },
      });
      const res = mockRes();

      stayRepository.findOneByIdAndUserId
        .mockResolvedValueOnce(stays[0])
        .mockResolvedValueOnce({
          ...stays[0],
          city: "mars",
          country: "somewhere not earth",
          lat: null,
          lng: null,
        });
      geocode.mockResolvedValue(null);
      stayRepository.update.mockResolvedValue(1);

      await updateStay(req, res);

      expect(stayRepository.update).toHaveBeenCalledWith(
        stays[0].id,
        userId,
        expect.objectContaining({ lat: null, lng: null }),
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        ...stays[0],
        ...{
          city: "mars",
          country: "somewhere not earth",
          lat: null,
          lng: null,
        },
      });
    });

    test("return 400 when no updatable fields", async () => {
      const req = mockReq({ params: { id: stays[0].id }, body: {} });
      const res = mockRes();

      await updateStay(req, res);

      expect(stayRepository.update).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "No updatable fields provided.",
      });
    });

    test("return 404 when stay not found.", async () => {
      const req = mockReq({
        params: { id: "other" },
        body: { expectedEndAt: "2026-08-15" },
      });
      const res = mockRes();

      stayRepository.update.mockResolvedValue(0);

      await updateStay(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Stay not found.",
      });
    });
  });
});
