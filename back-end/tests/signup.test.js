import request from "supertest";
import app from "../app.js";

jest.mock("../queries/connect.js", () => ({
  getConnection: jest.fn((cb) => {
    cb(null, {
      query: jest.fn(),
      release: jest.fn(),
    });
  }),
}));

jest.mock("../queries/User.js", () => ({
  GetUserByEmail: jest.fn(),
  Insert_user: jest.fn(),
}));

jest.mock("../utils/email.js", () => ({
  sendEmail: jest.fn(),
}));

jest.mock("../utils/crypt.js", () => ({
  encrypt: jest.fn(() => "encryptedSecretKey"),
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn(() => Promise.resolve("hashedPassword")),
}));

jest.mock("../middlewares/logActivity.js", () => ({
  logActivity: () => (req, res, next) => next(),
}));

jest.mock("../middlewares/updateLastActivity.js", () => ({
  updateLastActivity: (req, res, next) => next(),
}));

// Supprimer les logs pour pas polluer Jest
beforeAll(() => {
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
});

describe("POST /signup", () => {
  const validBody = {
    nom: "Dupont",
    prenom: "Jean",
    email: "jean@test.com",
    password: "12345678",
    role: "user",
  };

  it("Création d’utilisateur OK → 201", async () => {
    const { GetUserByEmail, Insert_user } = require("../queries/User.js");
    const { sendEmail } = require("../utils/email.js");

    // email non utilisé
    GetUserByEmail.mockImplementation((c, email, cb) =>
      cb(null, { exists: false })
    );

    sendEmail.mockResolvedValue(true);

    Insert_user.mockImplementation((c, data, cb) => cb(null, { insertId: 1 }));

    const res = await request(app).post("/api/signup").send(validBody);

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ message: "Inscription réussie." });
    expect(sendEmail).toHaveBeenCalled();
    expect(Insert_user).toHaveBeenCalled();
  });

  it("Email déjà utilisé → 409", async () => {
    const { GetUserByEmail } = require("../queries/User.js");

    GetUserByEmail.mockImplementation((c, email, cb) =>
      cb(null, { exists: true })
    );

    const res = await request(app).post("/api/signup").send(validBody);

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe("Cet email est déjà utilisé.");
  });

  it("Erreur DB (connexion) → 500", async () => {
    const { getConnection } = require("../queries/connect.js");

    getConnection.mockImplementationOnce((cb) => cb(new Error("DB error")));

    const res = await request(app).post("/api/signup").send(validBody);

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("Erreur de connexion à la base de données.");
  });

  it("Erreur lors de l'envoi de l'email → 500", async () => {
    const { GetUserByEmail } = require("../queries/User.js");
    const { sendEmail } = require("../utils/email.js");

    GetUserByEmail.mockImplementation((c, email, cb) =>
      cb(null, { exists: false })
    );

    sendEmail.mockRejectedValue(new Error("email failed"));

    const res = await request(app).post("/api/signup").send(validBody);

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("Erreur lors de l'envoi de l'email.");
  });
});

// Fermeture propre Jest
afterAll((done) => {
  setTimeout(done, 500);
});
