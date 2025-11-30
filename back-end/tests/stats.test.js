import request from "supertest";
import express from "express";
import statRouter from "../routes/stats.js";
import * as connect from "../queries/connect.js";
import * as statQueries from "../queries/stats.js";
import * as auth from "../middlewares/authenticateToken.js";
import * as lastActivity from "../middlewares/updateLastActivity.js";

jest.mock("../queries/connect.js");
jest.mock("../queries/stats.js");
jest.mock("../middlewares/authenticateToken.js");
jest.mock("../middlewares/updateLastActivity.js");

describe("Routes Statistiques", () => {
  let app;
  const fakeClient = { release: jest.fn() };

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/api/stats", statRouter);

    auth.authenticateToken.mockImplementation((req, res, next) => next());
    lastActivity.updateLastActivity.mockImplementation((req, res, next) => next());
    connect.getConnection.mockImplementation(cb => cb(null, fakeClient));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/stats/sales", () => {
    it("devrait retourner les statistiques de ventes", async () => {
      statQueries.show_sales_and_avg_basket.mockImplementation((client, period, cb) =>
        cb(null, [{ date: "2025-01-01", total: 100 }])
      );

      const res = await request(app).get("/api/stats/sales?period=day");
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([{ date: "2025-01-01", total: 100 }]);
      expect(res.body.period).toBe("day");
      expect(fakeClient.release).toHaveBeenCalled();
    });

    it("devrait renvoyer 500 en cas d’erreur SQL", async () => {
      statQueries.show_sales_and_avg_basket.mockImplementation((client, period, cb) =>
        cb(new Error("SQL error"))
      );

      const res = await request(app).get("/api/stats/sales");
      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Erreur lors de la récupération des statistiques.");
      expect(fakeClient.release).toHaveBeenCalled();
    });
  });

  describe("GET /api/stats/best-products/:id_categorie", () => {
    it("devrait retourner les meilleurs produits de la catégorie", async () => {
      statQueries.show_best_product_by_category.mockImplementation((client, id, cb) =>
        cb(null, [{ id_produit: 1, titre: "Produit" }])
      );

      const res = await request(app).get("/api/stats/best-products/1");
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([{ id_produit: 1, titre: "Produit" }]);
      expect(fakeClient.release).toHaveBeenCalled();
    });
  });

  describe("GET /api/stats/popular-categories", () => {
    it("devrait retourner les catégories les plus populaires", async () => {
      statQueries.show_most_popular_categories.mockImplementation((client, cb) =>
        cb(null, [{ id_categorie: 1, nom: "Catégorie" }])
      );

      const res = await request(app).get("/api/stats/popular-categories");
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([{ id_categorie: 1, nom: "Catégorie" }]);
      expect(fakeClient.release).toHaveBeenCalled();
    });
  });
});
