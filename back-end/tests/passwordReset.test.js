import request from "supertest";
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import passwordRouter from "../routes/passwordReset.js";
import * as connect from "../queries/connect.js";
import * as userQueries from "../queries/User.js";
import * as jwt from "jsonwebtoken";
import * as emailUtils from "../utils/email.js";
import bcrypt from "bcryptjs";

jest.mock("../queries/connect.js");
jest.mock("../queries/User.js");
jest.mock("jsonwebtoken");
jest.mock("../utils/email.js");
jest.mock("bcryptjs");

describe("routes PasswordReset", () => {
  let app;
  const fakeClient = { release: jest.fn(), query: jest.fn() };

  beforeEach(() => {
    app = express();
    app.use(bodyParser.json());
    app.use(cookieParser());
    app.use("/api/password", passwordRouter);

    connect.getConnection.mockImplementation(cb => cb(null, fakeClient));
    fakeClient.release.mockClear();
    fakeClient.query.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/password/request-reset", () => {
    it("retourne 404 si pas d'email", async () => {
      userQueries.GetUserByEmail.mockImplementation((client, email, cb) => {
        cb(null, { exists: false, results: [] });
      });
      const res = await request(app)
        .post("/api/password/request-reset")
        .send({ email: "notfound@mail.com" });
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Email invalide");
      expect(fakeClient.release).toHaveBeenCalled();
    });

    it("retourne 500 si l'email ne s envoie pas", async () => {
      const user = { id_user: 1, email: "test@mail.com", secretkey: "secret123" };
      userQueries.GetUserByEmail.mockImplementation((client, email, cb) => {
        cb(null, { exists: true, results: [user] });
      });
      jwt.sign.mockReturnValue("resettoken");
      emailUtils.sendEmail.mockRejectedValue(new Error("SMTP error"));
      const res = await request(app)
        .post("/api/password/request-reset")
        .send({ email: "test@mail.com" });
      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Erreur lors de l'envoi de l'email.");
    });

    it("envoie le lien de rénitialisation du mot de passe", async () => {
      const user = { id_user: 1, email: "test@mail.com", secretkey: "secret123" };
      userQueries.GetUserByEmail.mockImplementation((client, email, cb) => {
        cb(null, { exists: true, results: [user] });
      });
      jwt.sign.mockReturnValue("resettoken");
      emailUtils.sendEmail.mockResolvedValue(true);
      const res = await request(app)
        .post("/api/password/request-reset")
        .send({ email: "test@mail.com" });
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Lien de réinitialisation envoyé. Veuillez vérifier votre email.");
    });
  });

  describe("POST /api/password/reset-password", () => {
    it("returne 400, token invalide", async () => {
      jwt.decode.mockReturnValue(null);

      const res = await request(app)
        .post("/api/password/reset-password")
        .send({ token: "badtoken", newPassword: "newpassword123" });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Token invalide.");
    });

    it("mot de passe rénitailiser avec succès", async () => {
      jwt.decode.mockReturnValue({ id: 1 });
      bcrypt.hash.mockResolvedValue("hashedpassword");
      fakeClient.query.mockImplementation((query, values, cb) => cb(null, {}));
      const res = await request(app)
        .post("/api/password/reset-password")
        .send({ token: "validtoken", newPassword: "newpassword123" });
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Mot de passe réinitialisé avec succès.");
      expect(fakeClient.release).toHaveBeenCalled();
      expect(fakeClient.query).toHaveBeenCalledWith(
        "UPDATE users SET mdp = ? WHERE id_user = ?",
        ["hashedpassword", 1],
        expect.any(Function)
      );
    });

    it("retourne 500 si la requete échoue", async () => {
      jwt.decode.mockReturnValue({ id: 1 });
      bcrypt.hash.mockResolvedValue("hashedpassword");
      fakeClient.query.mockImplementation((query, values, cb) => cb(new Error("DB error")));
      const res = await request(app)
        .post("/api/password/reset-password")
        .send({ token: "validtoken", newPassword: "newpassword123" });
      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Erreur lors de la réinitialisation du mot de passe.");
      expect(fakeClient.release).toHaveBeenCalled();
    });
  });
});
