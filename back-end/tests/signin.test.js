import request from "supertest";
import app from "../app.js";
import bcrypt from "bcryptjs";
import speakeasy from "speakeasy";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/email.js";
import { GetUserByEmail } from "../queries/User.js";
import { getConnection } from "../queries/connect.js";
import { decrypt } from "../utils/crypt.js";

//  MOCKS
jest.mock("../queries/User.js");
jest.mock("../queries/connect.js");
jest.mock("../utils/email.js");
jest.mock("../utils/crypt.js");

// Mock speakeasy
jest.mock("speakeasy", () => {
  const totp = jest.fn();     // speakeasy.totp()
  totp.verify = jest.fn();    // speakeasy.totp.verify()
  return { totp };
});

// bcrypt
jest.mock("bcryptjs");

// jwt
jest.mock("jsonwebtoken");

process.env.SECRET_KEY = "testsecret";
process.env.REFRESH_TOKEN_SECRET = "refreshSecret";

//  Données mockées
const validUser = {
  id_user: 1,
  nom: "Doe",
  prenom: "John",
  email: "john@example.com",
  mdp: "hashedPassword",
  role: "client",
  secretkey: "encrypted-secret",
};

const decrypted = "BASE32SECRET";

beforeEach(() => {
  jest.clearAllMocks();

  getConnection.mockImplementation((cb) =>
    cb(null, { release: jest.fn() })
  );

  decrypt.mockReturnValue(decrypted);
});

//  TESTS LOGIN (POST /api/login)
describe("POST /api/login", () => {
  const body = { email: validUser.email, password: "12345678" };

  it("Connexion OK → 200", async () => {
    GetUserByEmail.mockImplementation((c, email, cb) =>
      cb(null, { exists: true, results: [validUser] })
    );

    bcrypt.compare.mockResolvedValue(true);

    speakeasy.totp.mockReturnValue("123456");

    sendEmail.mockResolvedValue(true);

    const res = await request(app)
      .post("/api/login")
      .send(body);

    expect(res.statusCode).toBe(200);
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });

  it("Erreur lors de l'envoi email → 500", async () => {
    GetUserByEmail.mockImplementation((c, email, cb) =>
      cb(null, { exists: true, results: [validUser] })
    );

    bcrypt.compare.mockResolvedValue(true);

    speakeasy.totp.mockReturnValue("123456");

    sendEmail.mockRejectedValue(new Error("Mail fail"));

    const res = await request(app)
      .post("/api/login")
      .send(body);

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("Erreur lors de l'envoi de l'email.");
  });

  it("Mot de passe incorrect → 401", async () => {
    GetUserByEmail.mockImplementation((c, email, cb) =>
      cb(null, { exists: true, results: [validUser] })
    );

    bcrypt.compare.mockResolvedValue(false);

    const res = await request(app)
      .post("/api/login")
      .send(body);

    expect(res.statusCode).toBe(401);
  });

  it("Utilisateur non trouvé → 404", async () => {
    GetUserByEmail.mockImplementation((c, email, cb) =>
      cb(null, { exists: false })
    );

    const res = await request(app)
      .post("/api/login")
      .send(body);

    expect(res.statusCode).toBe(404);
  });
});

//  TESTS VERIFY (POST /api/verify)
describe("POST /api/verify", () => {
  const bodyVerify = {
    email: validUser.email,
    code: "123456",
    rememberMe: true
  };

  it("Code OK → 200", async () => {
    GetUserByEmail.mockImplementation((c, email, cb) =>
      cb(null, { exists: true, results: [validUser] })
    );

    speakeasy.totp.verify.mockReturnValue(true);

    jwt.sign.mockReturnValue("token123");

    const res = await request(app)
      .post("/api/verify")
      .send(bodyVerify);

    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe(validUser.email);
  });

  it("Code incorrect → 401", async () => {
    GetUserByEmail.mockImplementation((c, email, cb) =>
      cb(null, { exists: true, results: [validUser] })
    );

    speakeasy.totp.verify.mockReturnValue(false);

    const res = await request(app)
      .post("/api/verify")
      .send(bodyVerify);

    expect(res.statusCode).toBe(401);
  });

  it("Utilisateur introuvable → 404", async () => {
    GetUserByEmail.mockImplementation((c, email, cb) =>
      cb(null, { exists: false })
    );

    const res = await request(app)
      .post("/api/verify")
      .send(bodyVerify);

    expect(res.statusCode).toBe(404);
  });
});
