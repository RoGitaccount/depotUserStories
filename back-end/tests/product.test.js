import request from "supertest";
import express from "express";
import productRouter from "../routes/products.js";
import * as connect from "../queries/connect.js";
import * as productQueries from "../queries/product.js";
import * as productCatQueries from "../queries/productCategory.js";
import * as middlewares from "../middlewares/authenticateToken.js";
import * as adminMiddleware from "../middlewares/isAdmin.js";
import * as lastActivity from "../middlewares/updateLastActivity.js";
import * as logMiddleware from "../middlewares/logActivity.js";

beforeEach(() => {
  console.warn = jest.fn();
  console.error = jest.fn();
});


// Mock des modules
jest.mock("../queries/connect.js", () => ({
  getConnection: jest.fn()
}));

jest.mock("../queries/product.js", () => ({
  Get_all_products: jest.fn(),
  Get_product_image_by_id: jest.fn(),
  Insert_product: jest.fn(),
  Update_product: jest.fn(),
  Delete_product: jest.fn()
}));

jest.mock("../queries/productCategory.js", () => ({
  Add_product_categories: jest.fn()
}));

jest.mock("../middlewares/authenticateToken.js", () => ({
  authenticateToken: jest.fn((req, res, next) => next())
}));

jest.mock("../middlewares/updateLastActivity.js", () => ({
  updateLastActivity: jest.fn((req, res, next) => next())
}));

jest.mock("../middlewares/logActivity.js", () => ({
  logActivity: jest.fn(() => (req, res, next) => next())
}));

jest.mock("../middlewares/isAdmin.js", () => ({
  isAdmin: jest.fn((req, res, next) => next())
}));

describe("Product routes", () => {
  let app;
  const fakeClient = { release: jest.fn() };

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/api/products", productRouter);

    // Réinitialisation des mocks
    middlewares.authenticateToken.mockImplementation((req, res, next) => next());
    adminMiddleware.isAdmin.mockImplementation((req, res, next) => next());
    lastActivity.updateLastActivity.mockImplementation((req, res, next) => next());
    logMiddleware.logActivity.mockImplementation(() => (req, res, next) => next());
    connect.getConnection.mockImplementation(cb => cb(null, fakeClient));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/products", () => {
    it("retourne tout les produits", async () => {
      productQueries.Get_all_products.mockImplementation((client, cb) => cb(null, [{ id: 1 }]));
      const res = await request(app).get("/api/products");
      expect(res.status).toBe(200);
      expect(res.body).toEqual([{ id: 1 }]);
      expect(fakeClient.release).toHaveBeenCalled();
    });
    
    it("retourne erreur 500", async () => {
      productQueries.Get_all_products.mockImplementation((client, cb) => cb(new Error("SQL")));
      const res = await request(app).get("/api/products");
      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Erreur lors de la récupération des produits.");
      expect(fakeClient.release).toHaveBeenCalled();
    });
  });

  describe("GET /api/products/:id/image", () => {
    it("retourne l'image", async () => {
      const buffer = Buffer.from("image");
      productQueries.Get_product_image_by_id.mockImplementation((client, id, cb) =>
        cb(null, [{ image: buffer }])
      );
      const res = await request(app).get("/api/products/1/image");
      expect(res.status).toBe(200);
      expect(res.header["content-type"]).toBe("image/jpeg");
      expect(res.body).toEqual(buffer);
      expect(fakeClient.release).toHaveBeenCalled();
    });

    it("should return 404 if no image", async () => {
      productQueries.Get_product_image_by_id.mockImplementation((client, id, cb) => cb(null, []));

      const res = await request(app).get("/api/products/1/image");
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Produit non trouvé.");
      expect(fakeClient.release).toHaveBeenCalled();
    });

    it("should return 500 on SQL error", async () => {
      productQueries.Get_product_image_by_id.mockImplementation((client, id, cb) => cb(new Error("SQL")));

      const res = await request(app).get("/api/products/1/image");
      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Erreur requête SQL.");
      expect(fakeClient.release).toHaveBeenCalled();
    });
  });

  describe("POST /api/products/add", () => {
    it("ajoute un produit et une categorie associé", async () => {
      productQueries.Insert_product.mockImplementation((client, product, cb) => cb(null, { insertId: 1 }));
      productCatQueries.Add_product_categories.mockImplementation((client, id, cats, cb) => cb(null));
      const res = await request(app)
        .post("/api/products/add")
        .send({ titre: "Produit", prix: 10, stock: 5, id_categories: [1] });
      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Produit ajouté et associé avec succès aux catégories.");
      expect(fakeClient.release).toHaveBeenCalled();
    });

    it("retourne une erreur 500 si Insert_product échoue", async () => {
      productQueries.Insert_product.mockImplementation((client, product, cb) => cb(new Error("SQL")));
      const res = await request(app)
        .post("/api/products/add")
        .send({ titre: "Produit", prix: 10, stock: 5, id_categories: [1] });
      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Erreur lors de l'ajout du produit.");
      expect(fakeClient.release).toHaveBeenCalled();
    });
  });

  describe("PUT /api/products/update/:id_produit", () => {
    it("met à jour le produit sans changer la catégorie", async () => {
      productQueries.Update_product.mockImplementation((client, data, cb) => cb(null, {}));
      const res = await request(app)
        .put("/api/products/update/1")
      .send({ titre: "Updated", prix: 10, stock: 5 })
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Produit mis à jour avec succès.");
      expect(fakeClient.release).toHaveBeenCalled();
    });
  });

  describe("DELETE /api/products/delete/:id_produit", () => {
    it("supprime un produit", async () => {
      productQueries.Delete_product.mockImplementation((client, id, cb) => cb(null, {}));
      const res = await request(app).delete("/api/products/delete/1");
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Produit supprimé avec succès.");
      expect(fakeClient.release).toHaveBeenCalled();
    });
  });
});
