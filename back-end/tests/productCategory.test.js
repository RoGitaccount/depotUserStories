import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import categoryRouter from "../routes/productCategory.js";
import * as productCategoryQueries from "../queries/productCategory.js";
import * as middlewares from "../middlewares/authenticateToken.js";
import * as adminMiddleware from "../middlewares/isAdmin.js";
import * as logMiddleware from "../middlewares/logActivity.js";
import * as updateLastActivity from "../middlewares/updateLastActivity.js";
import validateRequest from "../middlewares/validateRequest.js";

beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
  jest.spyOn(console, "log").mockImplementation(() => {});
});

jest.mock("../queries/productCategory.js");
jest.mock("../middlewares/authenticateToken.js");
jest.mock("../middlewares/isAdmin.js");
jest.mock("../middlewares/logActivity.js", () => ({
  logActivity: jest.fn(() => (req, res, next) => next())
}));
jest.mock("../middlewares/updateLastActivity.js", () => ({
  updateLastActivity: jest.fn((req, res, next) => next())
}));
jest.mock("../middlewares/validateRequest.js", () => jest.fn((req, res, next) => next()));


describe("Routes ProductCategory", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(cookieParser());
    app.use(express.json());
    app.use("/api/productCategory", categoryRouter);

    // Mocks middlewares
    middlewares.authenticateToken.mockImplementation((req, res, next) => next());
    adminMiddleware.isAdmin.mockImplementation((req, res, next) => next());
    logMiddleware.logActivity.mockImplementation(() => (req, res, next) => next());
    updateLastActivity.updateLastActivity.mockImplementation((req, res, next) => next());
    validateRequest.mockImplementation((req, res, next) => next());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/productCategory/add", () => {
    it("devrait ajouter des catégories à un produit", async () => {
      productCategoryQueries.Add_product_categories.mockImplementation((client, id, cats, cb) => cb(null));

      const res = await request(app)
        .post("/api/productCategory/add")
        .send({ id_produit: 1, id_categories: [2, 3] });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Catégories associées avec succès.");
    });

    it("devrait retourner 500 si Add_product_categories échoue", async () => {
      productCategoryQueries.Add_product_categories.mockImplementation((client, id, cats, cb) => cb(new Error("SQL Error")));

      const res = await request(app)
        .post("/api/productCategory/add")
        .send({ id_produit: 1, id_categories: [2] });

      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Erreur lors de l'ajout des catégories.");
    });
  });

  describe("GET /api/productCategory/produit/:id_produit", () => {
    it("devrait récupérer les catégories d’un produit", async () => {
      productCategoryQueries.Get_product_categories.mockImplementation((client, id, cb) => cb(null, [{ id_categorie: 1 }]));

      const res = await request(app).get("/api/productCategory/produit/1");

      expect(res.status).toBe(200);
      expect(res.body).toEqual([{ id_categorie: 1 }]);
    });

    it("devrait retourner 500 si Get_product_categories échoue", async () => {
      productCategoryQueries.Get_product_categories.mockImplementation((client, id, cb) => cb(new Error("SQL Error")));

      const res = await request(app).get("/api/productCategory/produit/1");

      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Erreur lors de la récupération.");
    });
  });

  describe("GET /api/productCategory/categorie/:id_categorie", () => {
    it("devrait récupérer les produits d’une catégorie", async () => {
      productCategoryQueries.Get_category_products.mockImplementation((client, id, cb) => cb(null, [{ id_produit: 1 }]));

      const res = await request(app).get("/api/productCategory/categorie/1");

      expect(res.status).toBe(200);
      expect(res.body).toEqual([{ id_produit: 1 }]);
    });

    it("devrait retourner 500 si Get_category_products échoue", async () => {
      productCategoryQueries.Get_category_products.mockImplementation((client, id, cb) => cb(new Error("SQL Error")));

      const res = await request(app).get("/api/productCategory/categorie/1");

      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Erreur lors de la récupération.");
    });
  });

  describe("DELETE /api/productCategory/delete/:id_produit/:id_categorie", () => {
    it("devrait supprimer l’association produit/catégorie", async () => {
      productCategoryQueries.Delete_product_category.mockImplementation((client, pid, cid, cb) => cb(null));

      const res = await request(app).delete("/api/productCategory/delete/1/2");

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Association supprimée.");
    });

    it("devrait retourner 500 si Delete_product_category échoue", async () => {
      productCategoryQueries.Delete_product_category.mockImplementation((client, pid, cid, cb) => cb(new Error("SQL Error")));

      const res = await request(app).delete("/api/productCategory/delete/1/2");

      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Erreur lors de la suppression de l'association.");
    });
  });

  describe("PUT /api/productCategory/replace/:id_produit", () => {
    it("devrait remplacer la catégorie d’un produit", async () => {
      productCategoryQueries.Replace_product_category.mockImplementation((client, pid, oldId, newId, cb) => cb(null));

      const res = await request(app)
        .put("/api/productCategory/replace/1")
        .send({ ancienne_id: 2, nouvelle_id: 3 });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Catégorie remplacée.");
    });

    it("devrait retourner 500 si Replace_product_category échoue", async () => {
      productCategoryQueries.Replace_product_category.mockImplementation((client, pid, oldId, newId, cb) => cb(new Error("SQL Error")));

      const res = await request(app)
        .put("/api/productCategory/replace/1")
        .send({ ancienne_id: 2, nouvelle_id: 3 });

      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Erreur lors du remplacement.");
    });
  });
});
