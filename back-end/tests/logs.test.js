import request from "supertest";
import express from "express";
import logRouter from "../routes/logs.js";
import * as connect from "../queries/connect.js";
import * as logQueries from "../queries/logs.js";
import * as middlewares from "../middlewares/authenticateToken.js";
import * as lastActivity from "../middlewares/updateLastActivity.js";
import * as adminMiddleware from "../middlewares/isAdmin.js";

beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

jest.mock("../queries/connect.js");
jest.mock("../queries/logs.js");
jest.mock("../middlewares/authenticateToken.js");
jest.mock("../middlewares/updateLastActivity.js");
jest.mock("../middlewares/isAdmin.js");

describe("Log routes", () => {
  let app;
  const fakeClient = { release: jest.fn(), query: jest.fn() };

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/api/logs", logRouter);

    middlewares.authenticateToken.mockImplementation((req, res, next) => next());
    lastActivity.updateLastActivity.mockImplementation((req, res, next) => next());
    adminMiddleware.isAdmin.mockImplementation((req, res, next) => next());
    connect.getConnection.mockImplementation(cb => cb(null, fakeClient));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/logs", () => {
    it("returner les logs", async () => {
      logQueries.Get_logs.mockImplementation((client, options, cb) =>
        cb(null, [{ id_log: 1, activite: "test" }])
      );
      const res = await request(app).get("/api/logs");
      expect(res.status).toBe(200);
      expect(res.body).toEqual([{ id_log: 1, activite: "test" }]);
      expect(fakeClient.release).toHaveBeenCalled();
    });

    it("retourne l'erreur 500", async () => {
      logQueries.Get_logs.mockImplementation((client, options, cb) =>
        cb(new Error("SQL error"))
      );
      const res = await request(app).get("/api/logs");
      expect(res.status).toBe(500);
      expect(res.body.error).toBe("Erreur serveur");
      expect(fakeClient.release).toHaveBeenCalled();
    });
  });

  describe("GET /api/logs/users", () => {
    it("retourne les utilisateurs", async () => {
      fakeClient.query.mockImplementation((sql, cb) => cb(null, [{ id_user: 1, nom: "Test" }]));
      const res = await request(app).get("/api/logs/users");
      expect(res.status).toBe(200);
      expect(res.body).toEqual([{ id_user: 1, nom: "Test" }]);
      expect(fakeClient.release).toHaveBeenCalled();
    });

    it("retourne l'erreur 500", async () => {
      fakeClient.query.mockImplementation((sql, cb) => cb(new Error("SQL error")));
      const res = await request(app).get("/api/logs/users");
      expect(res.status).toBe(500);
      expect(res.body.error).toBe("Erreur serveur");
      expect(fakeClient.release).toHaveBeenCalled();
    });
  });
});
