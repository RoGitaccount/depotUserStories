import request from "supertest";
import app from "../app.js";
import PDFDocument from "pdfkit";

//  Mock de la connexion à la DB et des queries
jest.mock("../queries/connect.js", () => ({
  getConnection: jest.fn((cb) => {
    cb(null, {
      query: jest.fn(),
      release: jest.fn(),
    });
  }),
}));

jest.mock("../queries/User.js", () => ({
  GetAllUsers: jest.fn((client, cb) => cb(null, [
    { id: 1, nom: "Dupont", prenom: "Jean", email: "j.dupont@test.com", role: "user" },
  ])),
  Update_user_info: jest.fn((client, id, data, cb) => cb(null)),
  Update_user_phone: jest.fn((client, id, phone, cb) => cb(null)),
  Delete_user: jest.fn((client, id, cb) => cb(null)),
}));

//  Mocks des middlewares
jest.mock("../middlewares/authenticateToken.js", () => ({
  authenticateToken: (req, res, next) => {
    req.user = { id: 123, isAdmin: true };
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

//  Tests
describe("UserAdminManagement API", () => {

  it("GET / → récupère tous les utilisateurs", async () => {
    const res = await request(app).get("/api/user");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty("nom", "Dupont");
  });

  it("PUT /update/:id → met à jour un utilisateur avec téléphone", async () => {
    const res = await request(app).put("/api/user/update/1").send({
      nom: "Durand",
      prenom: "Pierre",
      role: "admin",
      email: "p.durand@test.com",
      telephone: "0601020304",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Utilisateur mis à jour avec succès");
  });

  it("PUT /update/:id → met à jour un utilisateur sans téléphone", async () => {
    const res = await request(app).put("/api/user/update/1").send({
      nom: "Durand",
      prenom: "Pierre",
      role: "admin",
      email: "p.durand@test.com",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Utilisateur mis à jour avec succès");
  });

  it("DELETE /delete/:id → supprime un utilisateur", async () => {
    const res = await request(app).delete("/api/user/delete/1");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Utilisateur supprimé avec succès");
  });

});

afterAll((done) => {
  setTimeout(() => done(), 500); // laisse le temps à Jest de fermer correctement
});
