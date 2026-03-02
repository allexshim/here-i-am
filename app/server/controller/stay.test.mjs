import { afterEach, describe, expect, jest } from "@jest/globals";

const mockStayRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  remove: jest.fn(),
  update: jest.fn(),
};

await jest.unstable_mockModule("../data/stay.js", () => mockStayRepository);

const stayRepository = await import("../data/stay.js");
const { createStay, getStays, getStayById, removeStay, updateStay } =
  await import("./stay.js");

const stays = [
  {
    id: 1,
    city: "Seoul",
    country: "South Korea",
    start_at: "2026-02-27",
    expected_end_at: "2026-08-01",
    accommodation: "Seoul hostel",
  },
  {
    id: 2,
    city: "Busan",
    country: "South Korea",
    start_at: "2026-03-01",
    expected_end_at: "2026-10-01",
    accommodation: "Busan hostel",
  },
];

describe("stay controller test", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createStay test", () => {
    test("returns new stay with status 201", async () => {
      const body = {
        city: "Seoul",
        country: "South Korea",
        start_at: "2026-03-02",
        expected_end_at: "2026-03-12",
        accommodation: "Seoul Hostel",
      };
      const req = {
        body,
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      stayRepository.create.mockResolvedValue(body);
      stayRepository.findById.mockResolvedValue(stays[0]);

      await createStay(req, res);

      expect(stayRepository.create).toHaveBeenCalled();
      expect(stayRepository.findById).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(stays[0]);
    });

    test("returns 500 with error message when repository throws error", async () => {
      const body = {
        city: "Seoul",
        country: "South Korea",
        start_at: "2026-03-02",
        expected_end_at: "2026-03-12",
        accommodation: "Seoul Hostel",
      };
      const req = {
        body,
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      stayRepository.create.mockRejectedValue(new Error("DB error"));

      await createStay(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Something went wrong.",
      });
    });
  });

  describe("getStays test", () => {
    test("return stays with status 200", async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      stayRepository.findAll.mockResolvedValue(stays);

      await getStays(res, res);

      expect(stayRepository.findAll).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(stays);
    });
  });

  describe("getStayById test", () => {
    test("return stay with status 200", async () => {
      const req = { params: { id: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      stayRepository.findById.mockResolvedValue(stays[0]);

      await getStayById(req, res);

      expect(stayRepository.findById).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(stays[0]);
    });
  });

  describe("removeStay test", () => {
    test("returns 204 when stay is deleted", async () => {
      const req = { params: { id: 1 } };
      const res = {
        sendStatus: jest.fn(),
      };

      // mock affected row count
      stayRepository.remove.mockResolvedValue(1);

      await removeStay(req, res);
      expect(stayRepository.remove).toHaveBeenCalled();
      expect(res.sendStatus).toHaveBeenCalledWith(204);
    });

    test("return 404 when stay does not exist", async () => {
      const req = { params: { id: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

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
    test("return updated stay with status 200", async () => {
      const body = {
        expected_end_at: "2026-03-02",
        end_at: "2026-03-02",
        start_at: "2026-02-20",
        comment: "Left as plan",
        accommodation: "Seoul Hostel",
      };
      const req = { params: { id: 1 }, body };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const updatedStay = {
        id: 1,
        city: "Seoul",
        country: "South Korea",
        expected_end_at: "2026-03-02",
        end_at: "2026-03-02",
        start_at: "2026-02-20",
        comment: "Left as plan",
        accommodation: "Seoul Hostel",
      };

      stayRepository.update.mockResolvedValue(1);
      stayRepository.findById.mockResolvedValue(updatedStay);

      await updateStay(req, res);

      expect(stayRepository.update).toHaveBeenCalled();
      expect(stayRepository.findById).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedStay);
    });

    test("update stay with provided fields only", async () => {
      const body = {
        expected_end_at: "2026-03-02",
        end_at: undefined,
      };
      const req = { params: { id: 1 }, body };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      stayRepository.update.mockResolvedValue(1);
      stayRepository.findById.mockResolvedValue({
        id: 1,
        city: "Seoul",
        country: "South Korea",
        start_at: "2026-02-27",
        expected_end_at: "2026-03-02",
        accommodation: "Seoul hostel",
      });

      await updateStay(req, res);

      expect(stayRepository.update).toHaveBeenCalled();
      expect(stayRepository.findById).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        id: 1,
        city: "Seoul",
        country: "South Korea",
        start_at: "2026-02-27",
        expected_end_at: "2026-03-02",
        accommodation: "Seoul hostel",
      });
    });

    test("return 404 wien repository throws errors", async () => {
      const body = {
        expected_end_at: "2026-03-02",
      };
      const req = { params: { id: 1 }, body };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      stayRepository.update.mockResolvedValue(0);

      await updateStay(req, res);

      expect(stayRepository.update).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Something went wrong.",
      });
    });
  });
});
