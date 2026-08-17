import { afterEach, describe, expect, jest } from "@jest/globals";

const mockUserRepository = {
  findByEmail: jest.fn(),
  create: jest.fn(),
};

const mockBcrypt = {
  getPasswordHash: jest.fn(),
  isValidPassword: jest.fn(),
};

const mockJWTLib = {
  signToken: jest.fn(),
};

await jest.unstable_mockModule(
  "../repository/user.js",
  () => mockUserRepository,
);

await jest.unstable_mockModule("../lib/bcrypt.js", () => mockBcrypt);
await jest.unstable_mockModule("../lib/jwt.js", () => mockJWTLib);

const userRepository = await import("../repository/user.js");
const bcrypt = await import("../lib/bcrypt.js");
const JWTLib = await import("../lib/jwt.js");
const { signup, login } = await import("./auth.js");

const user = {
  id: "abcdefghhr",
  shareCode: "ABCDabcd",
  email: "test@example.com",
  passwordHash: "$1$1$1fakehash",
  createdAt: "2026-08-17",
};

function mockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe("auth controller test", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("signup test", () => {
    test("create user and return 201 with token, user info", async () => {
      const req = {
        body: { email: "test@example.com", password: "password1234" },
      };
      const res = mockRes();

      userRepository.findByEmail.mockResolvedValue(undefined);
      bcrypt.getPasswordHash.mockResolvedValue("$1$1$1fakehash");
      userRepository.create.mockResolvedValue(user);
      JWTLib.signToken.mockReturnValue("signedJWTtoken");

      await signup(req, res);

      expect(bcrypt.getPasswordHash).toHaveBeenCalledWith("password1234");
      expect(userRepository.create).toHaveBeenCalledWith({
        email: "test@example.com",
        passwordHash: "$1$1$1fakehash",
      });
      expect(JWTLib.signToken).toHaveBeenCalledWith({ userId: user.id });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        token: "signedJWTtoken",
        user: {
          id: user.id,
          shareCode: user.shareCode,
          email: user.email,
        },
      });
    });

    test("return 400 when invalid email entered", async () => {
      const req = { body: { email: "invalidEmail", password: "password1234" } };
      const res = mockRes();

      await signup(req, res);

      expect(userRepository.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid Email." });
    });

    test("return 400 when invalid password entered", async () => {
      const req = { body: { email: "test@example.com", password: "invalid" } };
      const res = mockRes();

      await signup(req, res);

      expect(userRepository.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Password must be at least 8 characters.",
      });
    });

    test("return 400 when email already exist", async () => {
      const req = {
        body: { email: "exist@example.com", password: "password1234" },
      };
      const res = mockRes();

      userRepository.findByEmail.mockResolvedValue(user);

      await signup(req, res);

      expect(userRepository.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Duplicated Email." });
    });
  });

  describe("login test", () => {
    test("return 200 with token and user info on valid credentials", async () => {
      const req = {
        body: { email: "test@example.com", password: "password1234" },
      };
      const res = mockRes();

      userRepository.findByEmail.mockResolvedValue(user);
      bcrypt.isValidPassword.mockResolvedValue(true);
      JWTLib.signToken.mockReturnValue("signedJWTtoken");

      await login(req, res);

      expect(bcrypt.isValidPassword).toHaveBeenCalledWith(
        "password1234",
        "$1$1$1fakehash",
      );
      expect(JWTLib.signToken).toHaveBeenCalledWith({ userId: user.id });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        token: "signedJWTtoken",
        user: { id: user.id, shareCode: user.shareCode, email: user.email },
      });
    });

    test("return 400 when body fields are missing", async () => {
      const req = { body: {} };
      const res = mockRes();

      await login(req, res);

      expect(userRepository.findByEmail).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("return 401 when password is invalid", async () => {
      const req = {
        body: { email: "test@example.com", password: "invalid" },
      };
      const res = mockRes();

      userRepository.findByEmail.mockResolvedValue(user);
      bcrypt.isValidPassword.mockResolvedValue(false);

      await login(req, res);

      expect(JWTLib.signToken).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid Password." });
    });
  });
});
