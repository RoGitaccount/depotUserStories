import { authenticateToken } from "../../middlewares/authenticateToken.js";
import jwt from "jsonwebtoken";
import { getConnection } from "../../queries/connect.js";
import { GetUserById } from "../../queries/User.js";

// Supprime les messages console.error pendant les tests
beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

jest.mock("jsonwebtoken");
jest.mock("../../queries/connect.js");
jest.mock("../../queries/User.js");

describe("Middleware authenticateToken", () => {
  let req, res, next, mockClient;

  beforeEach(() => {
    req = { cookies: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    mockClient = {
      release: jest.fn()
    };
    // Reset mocks
    jest.clearAllMocks();
  });

  it("retourne 401 si token absent", async () => {
    await authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Token manquant. Veuillez vous connecter."
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("retourne 401 si jwt.decode échoue", async () => {
    req.cookies.token = "fake-token";

    jwt.decode.mockReturnValue(null); // simulate decode fail

    await authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Token invalide ou expiré."
    });
  });

  it("retourne 500 si la connexion DB échoue", async () => {
    req.cookies.token = "tok";
    jwt.decode.mockReturnValue({ id: 1 });

    getConnection.mockImplementation(cb => cb("DB ERROR", null));

    await authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Erreur de connexion à la base de données"
    });
  });

  it("retourne 404 si l'utilisateur n'existe pas", async () => {
    req.cookies.token = "tok";
    jwt.decode.mockReturnValue({ id: 1 });

    getConnection.mockImplementation(cb => cb(null, mockClient));

    GetUserById.mockImplementation((client, id, cb) => {
      cb(null, { exists: false });
    });

    await authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Utilisateur introuvable."
    });
  });

  it("retourne 500 si secretkey est manquante", async () => {
    req.cookies.token = "tok";
    jwt.decode.mockReturnValue({ id: 1 });

    getConnection.mockImplementation(cb => cb(null, mockClient));

    GetUserById.mockImplementation((client, id, cb) =>
      cb(null, { exists: true, results: [{ secretkey: null }] })
    );

    await authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Clé secrète manquante."
    });
  });

  it("retourne 401 si jwt.verify échoue", async () => {
    req.cookies.token = "tok";
    jwt.decode.mockReturnValue({ id: 1 });

    getConnection.mockImplementation(cb => cb(null, mockClient));

    GetUserById.mockImplementation((client, id, cb) =>
      cb(null, { exists: true, results: [{ secretkey: "KEY" }] })
    );

    jwt.verify.mockImplementation((token, key, cb) =>
      cb(new Error("invalid token"), null)
    );

    await authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Token invalide ou expiré."
    });
  });

  it("passe au next() si token valide", async () => {
    req.cookies.token = "tok";
    jwt.decode.mockReturnValue({ id: 7 });

    getConnection.mockImplementation(cb => cb(null, mockClient));

    GetUserById.mockImplementation((client, id, cb) =>
      cb(null, { exists: true, results: [{ secretkey: "KEY" }] })
    );

    jwt.verify.mockImplementation((token, key, cb) =>
      cb(null, { id: 7, email: "test@test.com" })
    );

    await authenticateToken(req, res, next);

    expect(req.user).toEqual({ id: 7, email: "test@test.com" });
    expect(next).toHaveBeenCalled();
  });
});
