import request from "supertest";
import app from "../app.js";

// Mock de la connexion DB
jest.mock("../queries/connect.js", () => ({
  getConnection: jest.fn((cb) => {
    cb(null, {
      query: jest.fn((sql, params, callback) => {
        // Simule une réponse SQL selon la requête
        if (sql.includes("SELECT")) {
          return callback(null, [
            { id_produit: 1, titre: "Produit Test", prix: 10, image: "test.jpg", date_ajout: new Date() }
          ]);
        }
        if (sql.includes("DELETE") || sql.includes("INSERT")) {
          return callback(null, { affectedRows: 1 });
        }
      }),
      release: jest.fn()
    });
  })
}));

// Mock du middleware d'authentification
jest.mock("../middlewares/authenticateToken.js", () => ({
  authenticateToken: (req, res, next) => {
    req.user = { id: 123 }; // Simule un utilisateur connecté
    next();
  }
}));

// Mock des autres middlewares pour éviter effets secondaires
jest.mock("../middlewares/logActivity.js", () => ({
  logActivity: () => (req, res, next) => next()
}));
jest.mock("../middlewares/updateLastActivity.js", () => ({
  updateLastActivity: (req, res, next) => next()
}));

describe("Cart API", () => {
  it("GET /api/cart → retourne le panier", async () => {
    const res = await request(app).get("/api/cart");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty("titre", "Produit Test");
  });

  it("DELETE /api/cart/delete/:id_produit → supprime un produit", async () => {
    const res = await request(app).delete("/api/cart/delete/1");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Produit supprimé du panier avec succès");
  });

  it("DELETE /api/cart/clear → vide le panier", async () => {
    const res = await request(app).delete("/api/cart/clear");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Panier vidé avec succès");
  });
});
