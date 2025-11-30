import request from "supertest";
import app from "../app.js";

// --- MOCK DB CONNECTION ---
jest.mock("../queries/connect.js", () => ({
  getConnection: jest.fn((cb) => {
    cb(null, {
      query: jest.fn((sql, params, callback) => {
        // Mock pour /orders-years
        if (sql.includes("SELECT DISTINCT YEAR")) {
          return callback(null, [
            { year: 2024 },
            { year: 2023 }
          ]);
        }
      }),
      release: jest.fn()
    });
  })
}));

jest.mock("../queries/order.js", () => ({
  get_user_order_history: jest.fn((client, userId, filter, year, callback) => {
    callback(null, [
      {
        id_commande: 1,
        date_commande: "2024-02-12",
        statut: "livré",
        montant_total: 50
      }
    ]);
  })
}));

jest.mock("../queries/User.js", () => ({
  GetPersonalUserInfo: jest.fn((client, userId, callback) => {
    callback(null, {
      nom: "Doe",
      prenom: "John",
      email: "john.doe@example.com"
    });
  })
}));

jest.mock("../middlewares/authenticateToken.js", () => ({
  authenticateToken: (req, res, next) => {
    req.user = { id: 123 };
    next();
  }
}));

jest.mock("../middlewares/logActivity.js", () => ({
  logActivity: () => (req, res, next) => next()
}));
jest.mock("../middlewares/updateLastActivity.js", () => ({
  updateLastActivity: (req, res, next) => next()
}));

describe("UserDashboard API", () => {

  it("GET /api/userdashboard/orders-history → retourne l’historique des commandes", async () => {
    const res = await request(app).get("/api/userdashboard/orders-history");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty("statut", "livré");
  });

  it("GET /api/userdashboard/info → retourne les infos utilisateur", async () => {
    const res = await request(app).get("/api/userdashboard/info");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("nom", "Doe");
    expect(res.body).toHaveProperty("email", "john.doe@example.com");
  });

  it("GET /api/userdashboard/orders-years → retourne les années de commandes", async () => {
    const res = await request(app).get("/api/userdashboard/orders-years");
    expect(res.statusCode).toBe(200);
    expect(res.body.years).toEqual([2024, 2023]);
  });
});
