import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import tokenRouter from "../routes/token.js";
import * as authMiddleware from "../middlewares/authenticateToken.js";
import * as connect from "../queries/connect.js";
import * as userQueries from "../queries/User.js";
import jwt from "jsonwebtoken";

beforeEach(() => {
  console.error = jest.fn();
});

jest.mock("../middlewares/authenticateToken.js");
jest.mock("../queries/connect.js");
jest.mock("../queries/User.js");
jest.mock("jsonwebtoken");

describe("Routes Token", () => {
  let app;
  const fakeClient = { release: jest.fn() };

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use("/api/token", tokenRouter);

    // Mock du middleware authenticateToken
    authMiddleware.authenticateToken.mockImplementation((req, res, next) => {
      req.user = {
        id: 1,
        nom: "Test",
        prenom: "User",
        email: "test@mail.com",
        role: "user",
      };
      next();
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/token/me", () => {
    it("devrait retourner les informations de l'utilisateur si authentifié", async () => {
      const res = await request(app).get("/api/token/me");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        id: 1,
        nom: "Test",
        prenom: "User",
        email: "test@mail.com",
        role: "user",
      });
    });

    it("devrait retourner 401 si l'utilisateur n'est pas authentifié", async () => {
      authMiddleware.authenticateToken.mockImplementation((req, res, next) => next());

      const res = await request(app).get("/api/token/me");

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Non authentifié.");
    });
  });

  describe("POST /api/token/logout", () => {
    it("devrait supprimer les cookies et renvoyer un message de succès", async () => {
      const res = await request(app).post("/api/token/logout");

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Déconnexion réussie.");
      expect(res.headers["set-cookie"]).toBeDefined();
    });
  });

  describe("POST /api/token/refresh-token", () => {
    it("devrait retourner 401 si aucun refresh token n'est fourni", async () => {
      const res = await request(app).post("/api/token/refresh-token");

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Refresh token manquant. Veuillez vous reconnecter.");
    });

    it("devrait retourner 401 si le refresh token est invalide", async () => {
      const invalidToken = "badtoken";
      jwt.verify.mockImplementation(() => {
        throw new Error("invalid token");
      });

      const res = await request(app)
        .post("/api/token/refresh-token")
        .set("Cookie", [`refreshToken=${invalidToken}`]);

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Refresh token invalide.");
    });

    it("devrait rafraîchir le token si le refresh token est valide", async () => {
      const validToken = "validtoken";
      const decoded = { id: 1 };

      jwt.verify.mockReturnValue(decoded);

      connect.getConnection.mockImplementation(cb => cb(null, fakeClient));

      userQueries.GetUserById.mockImplementation((client, id, cb) =>
        cb(null, {
          exists: true,
          results: [
            {
              id_user: 1,
              nom: "Test",
              prenom: "User",
              email: "test@mail.com",
              role: "user",
              secretkey: "secret123",
            },
          ],
        })
      );

      jwt.sign.mockReturnValue("newaccesstoken");

      const res = await request(app)
        .post("/api/token/refresh-token")
        .set("Cookie", [`refreshToken=${validToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Token rafraîchi avec succès.");
      expect(res.body.user.email).toBe("test@mail.com");
      expect(fakeClient.release).toHaveBeenCalled();
      expect(res.headers["set-cookie"][0]).toContain("token=newaccesstoken");
    });

    it("devrait retourner 404 si l'utilisateur n'existe pas", async () => {
      const validToken = "validtoken";

      jwt.verify.mockReturnValue({ id: 1 });
      connect.getConnection.mockImplementation(cb => cb(null, fakeClient));

      userQueries.GetUserById.mockImplementation((client, id, cb) =>
        cb(null, { exists: false })
      );

      const res = await request(app)
        .post("/api/token/refresh-token")
        .set("Cookie", [`refreshToken=${validToken}`]);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Utilisateur introuvable.");
      expect(fakeClient.release).toHaveBeenCalled();
    });
  });
});
