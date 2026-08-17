import { afterEach, describe, expect, jest } from "@jest/globals";
import { verifyToken } from "../lib/jwt";

const mockJWTLib = {
  signToken: jest.fn(),
  verifyToken: jest.fn(),
};

await jest.unstable_mockModule("../lib/jwt.js", () => mockJWTLib);

const JWTLib = await import("../lib/jwt.js");
const { requiredAuth } = await import("./auth.js");

function mockReq(headers = {}) {
  return { headers };
}

function mockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe("auth middleware test", () => {
  describe("requiredAuth test", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    test("call next() and set req.userId when valid token entered", () => {
      const req = mockReq({ authorization: "Bearer validJWTToken" });
      const res = mockRes();
      const next = jest.fn();

      JWTLib.verifyToken.mockReturnValue({ userId: "ABCDabcd" });

      requiredAuth(req, res, next);

      expect(JWTLib.verifyToken).toHaveBeenCalledWith("validJWTToken");
      expect(req.userId).toBe("ABCDabcd");
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });

    test("return 401 when authorization header is missing", () => {
      const req = mockReq();
      const res = mockRes();
      const next = jest.fn();

      requiredAuth(req, res, next);

      expect(JWTLib.verifyToken).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized." });
    });

    test("return 401 when Bearer prefix is missing", () => {
      const req = mockReq({ authorization: "Any validJWTToken" });
      const res = mockRes();
      const next = jest.fn();

      requiredAuth(req, res, next);

      expect(JWTLib.verifyToken).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized." });
    });

    test("return 401 when JWT lib throw error", () => {
      const req = mockReq({ authorization: "Bearer invalidJWTToken" });
      const res = mockRes();
      const next = jest.fn();

      JWTLib.verifyToken.mockImplementation(() => {
        throw new Error("Invalid token payload");
      });

      requiredAuth(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
    });
  });
});
