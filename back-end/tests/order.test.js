import request from "supertest";
import app from "../app.js";

beforeAll(() => {
  jest.spyOn(console, "log").mockImplementation(() => {});
});

jest.mock("../queries/connect.js", () => ({
  getConnection: jest.fn((cb) => {
    cb(null, {
      query: jest.fn((sql, params, callback) => {
        if (sql.includes("INSERT INTO commandes")) {
          return callback(null, { insertId: 42 });
        }
        if (sql.includes("INSERT INTO details_commandes")) {
          return callback(null, { affectedRows: 1 });
        }
        if (sql.includes("SELECT") && sql.includes("FROM commandes") && sql.includes("id_user")) {
          return callback(null, [{ id_commande: 1, statut: "en attente" }]);
        }
        if (sql.includes("SELECT") && sql.includes("FROM details_commandes")) {
          return callback(null, [
            {
              id_produit: 1,
              titre: "Produit Test",
              description: "Desc",
              image: "image.jpg",
              prix_unitaire: 20,
            },
          ]);
        }
        if (sql.includes("UPDATE commandes")) {
          return callback(null, { affectedRows: 1 });
        }
        if (sql.includes("DELETE FROM details_commandes")) {
          return callback(null, { affectedRows: 1 });
        }
        // fallback
        return callback(null, []);
      }),
      release: jest.fn(),
    });
  }),
}));



//  Mocks des middlewares
jest.mock("../middlewares/authenticateToken.js", () => ({
  authenticateToken: (req, res, next) => {
    req.user = { id: 123 }; // Simule un utilisateur connecté
    next();
  },
}));

jest.mock("../middlewares/isAdmin.js", () => ({
  isAdmin: (req, res, next) => next(),
}));

jest.mock("../middlewares/logActivity.js", () => ({
  logActivity: () => (req, res, next) => next(),
}));

jest.mock("../middlewares/updateLastActivity.js", () => ({
  updateLastActivity: (req, res, next) => next(),
}));

//  Début des tests
describe("Order API", () => {
  it("POST /api/order/add → ajoute une commande", async () => {
    const res = await request(app).post("/api/order/add").send({
      id_user: 123,
      montant_total: 100.0,
      montant_reduction: 10.0,
      id_promotion: null,
      statut: "en attente",
      details: [
        { id_produit: 1, prix_unitaire: 45.0 },
        { id_produit: 2, prix_unitaire: 45.0 },
      ],
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body).toHaveProperty("id_commande", 42);
  });

it("GET /api/order/user/:id → retourne les commandes de l'utilisateur", async () => {
  const res = await request(app).get("/api/order/user/123");
  console.log("Body:", res.body);
  expect(res.statusCode).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body[0]).toHaveProperty("id_commande");
}, 10000);


  it("GET /api/order/details/:id_commande → retourne les détails d'une commande", async () => {
    const res = await request(app).get("/api/order/details/1");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty("titre", "Produit Test");
  });

  it("PUT /api/order/update/:id_commande → met à jour une commande", async () => {
    const res = await request(app).put("/api/order/update/1").send({
      statut: "envoyée",
      montant_total: 110.0,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("success", true);
  });

  it("DELETE /api/order/details/:id_commande → supprime les détails d'une commande", async () => {
    const res = await request(app).delete("/api/order/details/1");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("success", true);
  });
});

//  Fermeture propre après tous les tests
afterAll((done) => {
  setTimeout(() => done(), 500); // Laisse le temps à Jest de tout fermer
});
