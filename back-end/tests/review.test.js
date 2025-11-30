import request from "supertest";
import app from "../app.js";

// --- Mock des middlewares ---
jest.mock("../middlewares/authenticateToken.js", () => ({
  authenticateToken: (req, res, next) => {
    req.user = { id: 1, role: "user" };
    next();
  }
}));

jest.mock("../middlewares/updateLastActivity.js", () => ({
  updateLastActivity: (req, res, next) => next()
}));

jest.mock("../middlewares/logActivity.js", () => ({
  logActivity: () => (req, res, next) => next()
}));

// --- Mock de la connexion à la BDD ---
jest.mock("../queries/connect.js", () => ({
  getConnection: (cb) => {
    cb(null, {
      query: (sql, params, callback) => callback(null, []),
      release: jest.fn()
    });
  }
}));

// --- Mock des fonctions Review ---
import {
  Insert_review,
  Get_reviews_by_product,
  Update_review,
  Delete_review,
  Get_review_author
} from "../queries/Review.js";

jest.mock("../queries/Review.js");

describe("REVIEWS API", () => {

  it("POST /api/reviews/add-review ajoute un avis", async () => {
    Insert_review.mockImplementation((client, data, cb) => {
      cb(null, { insertId: 1 }); // renvoyer un objet simulant l'insertion
    });

    const res = await request(app)
      .post("/api/reviews/add-review")
      .send({
        id_produit: 2,
        note: 5,
        commentaire: "Top"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/succès/i);
  });

  it("GET /api/reviews/:id_produit récupère les avis", async () => {
    Get_reviews_by_product.mockImplementation((client, id, cb) =>
      cb(null, [{ id_avis: 1, note: 4 }])
    );

    const res = await request(app).get("/api/reviews/2");

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
  });

  it("PUT /api/reviews/update-review/:id modifie un avis si propriétaire", async () => {
    Get_review_author.mockImplementation((client, id, cb) =>
      cb(null, [{ id_user: 1 }])
    );

    Update_review.mockImplementation((client, data, cb) => cb(null, true));

    const res = await request(app)
      .put("/api/reviews/update-review/5")
      .send({ note: 3, commentaire: "Bien" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/succès/i);
  });

  it("PUT /api/reviews/update-review/:id renvoie 403 si non propriétaire", async () => {
    Get_review_author.mockImplementation((client, id, cb) =>
      cb(null, [{ id_user: 99 }])
    );

    const res = await request(app)
      .put("/api/reviews/update-review/5")
      .send({ note: 2, commentaire: "Ok" });

    expect(res.statusCode).toBe(403);
  });

  it("DELETE /api/reviews/delete-review/:id supprime un avis si propriétaire", async () => {
    Get_review_author.mockImplementation((client, id, cb) =>
      cb(null, [{ id_user: 1 }])
    );

    Delete_review.mockImplementation((client, id, cb) => cb(null, true));

    const res = await request(app).delete("/api/reviews/delete-review/5");

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/succès/i);
  });

  it("DELETE /api/reviews/delete-review/:id renvoie 403 si non propriétaire", async () => {
    Get_review_author.mockImplementation((client, id, cb) =>
      cb(null, [{ id_user: 99 }])
    );

    const res = await request(app).delete("/api/reviews/delete-review/5");

    expect(res.statusCode).toBe(403);
  });
});
