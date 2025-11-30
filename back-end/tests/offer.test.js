import request from "supertest";
import app from "../app.js";

jest.mock("../queries/connect.js", () => ({
  getConnection: jest.fn((cb) => {
    cb(null, {
      query: jest.fn(),
      release: jest.fn(),
    });
  }),
}));

jest.mock("../middlewares/authenticateToken.js", () => ({
  authenticateToken: (req, res, next) => {
    req.user = { id: 1, role: "admin" };
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

jest.mock("../middlewares/validateRequest.js", () => (req, res, next) => {
  next(); // Valide les params/body par défaut
});

jest.mock("../queries/offer.js", () => ({
  Get_all_offers_admin: jest.fn(),
  Get_offer_by_code: jest.fn(),
  Get_offer: jest.fn(),
  Insert_offer: jest.fn(),
  Get_one_offer_admin: jest.fn(),
  Update_offer: jest.fn(),
  Delete_offer: jest.fn(),
  Toggle_offer: jest.fn(),
  Has_user_used_offer: jest.fn(),
}));

import * as OfferQueries from "../queries/offer.js";

describe("OFFER API TESTS COMPLETS", () => {

  describe("GET /api/offers", () => {
    it("retourne toutes les promotions", async () => {
      OfferQueries.Get_all_offers_admin.mockImplementation((client, cb) => {
        cb(null, [
          { id_promotion: 1, code: "PROMO10", montant_reduction: 10 },
        ]);
      });
      const res = await request(app).get("/api/offers");
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].code).toBe("PROMO10");
    });
  });

  describe("GET /api/offers/code/:code", () => {
    it("retourne une promo valide", async () => {
      OfferQueries.Get_offer_by_code.mockImplementation((client, code, cb) =>
        cb(null, { id_promotion: 2, montant_reduction: 15 })
      );
      const res = await request(app).get("/api/offers/code/PROMO15");
      expect(res.statusCode).toBe(200);
      expect(res.body.montant_reduction).toBe(15);
    });

    it("retourne 404 si le code est invalide", async () => {
      OfferQueries.Get_offer_by_code.mockImplementation((client, code, cb) =>
        cb(null, null)
      );
      const res = await request(app).get("/api/offers/code/FAUX");
      expect(res.statusCode).toBe(404);
    });
  });

  describe("GET /api/offers/public/:id", () => {
    it("retourne une promo publique", async () => {
      OfferQueries.Get_offer.mockImplementation((client, id, cb) =>
        cb(null, { code: "PUBLIC20", montant_reduction: 20 })
      );
      const res = await request(app).get("/api/offers/public/1");
      expect(res.statusCode).toBe(200);
      expect(res.body.code).toBe("PUBLIC20");
    });

    it("404 si non trouvée", async () => {
      OfferQueries.Get_offer.mockImplementation((client, id, cb) =>
        cb(null, null)
      );
      const res = await request(app).get("/api/offers/public/99");
      expect(res.statusCode).toBe(404);
    });
  });

  describe("POST /api/offers/add", () => {
    it("ajoute une promotion", async () => {
      OfferQueries.Insert_offer.mockImplementation((client, data, cb) =>
        cb(null, { insertId: 1 })
      );
      const res = await request(app).post("/api/offers/add").send({
        code: "NEWPROMO",
        montant_reduction: 20,
        date_expiration: "2030-12-30",
        est_actif: 1,
      });
      expect(res.statusCode).toBe(201);
      expect(res.body.message).toContain("succès");
    });
  });

  describe("GET /api/offers/:id", () => {
    it("retourne une promo (admin)", async () => {
      OfferQueries.Get_one_offer_admin.mockImplementation((client, id, cb) =>
        cb(null, { id_promotion: id, code: "ADMINPROMO" })
      );
      const res = await request(app).get("/api/offers/5");
      expect(res.statusCode).toBe(200);
      expect(res.body.code).toBe("ADMINPROMO");
    });

    it("404 si non trouvée", async () => {
      OfferQueries.Get_one_offer_admin.mockImplementation((client, id, cb) =>
        cb(null, null)
      );
      const res = await request(app).get("/api/offers/99");
      expect(res.statusCode).toBe(404);
    });
  });

  describe("PUT /api/offers/update/:id", () => {
    it("modifie une promotion", async () => {
      OfferQueries.Update_offer.mockImplementation((client, data, cb) =>
        cb(null, { affectedRows: 1 })
      );
      const res = await request(app)
        .put("/api/offers/update/3")
        .send({
          code: "UPDATED",
          montant_reduction: 30,
          date_expiration: "2030-10-10",
          est_actif: 1,
        });
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toContain("succès");
    });
  });

  describe("DELETE /api/offers/delete/:id", () => {
    it("supprime une promotion", async () => {
      OfferQueries.Delete_offer.mockImplementation((client, id, cb) =>
        cb(null, { affectedRows: 1 })
      );
      const res = await request(app).delete("/api/offers/delete/3");
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toContain("succès");
    });
  });

  describe("PATCH /api/offers/toggle/:id", () => {
    it("active/désactive une promo", async () => {
      OfferQueries.Toggle_offer.mockImplementation((client, id, cb) =>
        cb(null, { affectedRows: 1 })
      );
      const res = await request(app).patch("/api/offers/toggle/3");
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toContain("mis à jour");
    });
  });

  describe("GET /api/offers/verify/:code", () => {
    it("valide le code promo si jamais utilisé", async () => {
      OfferQueries.Get_offer_by_code.mockImplementation((client, code, cb) =>
        cb(null, { id_promotion: 1, montant_reduction: 10 })
      );
      OfferQueries.Has_user_used_offer.mockImplementation(
        (client, uid, pid, cb) => cb(null, false)
      );
      const res = await request(app).get("/api/offers/verify/PROMOX");
      expect(res.statusCode).toBe(200);
      expect(res.body.valid).toBe(true);
    });

    it("renvoie erreur si déjà utilisé", async () => {
      OfferQueries.Get_offer_by_code.mockImplementation((client, code, cb) =>
        cb(null, { id_promotion: 1, montant_reduction: 10 })
      );
      OfferQueries.Has_user_used_offer.mockImplementation(
        (client, uid, pid, cb) => cb(null, true)
      );
      const res = await request(app).get("/api/offers/verify/PROMOX");
      expect(res.statusCode).toBe(400);
    });

    it("404 si promo inexistante", async () => {
      OfferQueries.Get_offer_by_code.mockImplementation((client, code, cb) =>
        cb(null, null)
      );
      const res = await request(app).get("/api/offers/verify/FAUX");
      expect(res.statusCode).toBe(404);
    });

    it("400 si promo expirée", async () => {
  OfferQueries.Get_offer_by_code.mockImplementation((client, code, cb) =>
    cb(null, { id_promotion: 1, est_actif: 1, date_expiration: "2000-01-01" })
  );
  const res = await request(app).get("/api/offers/verify/EXPIRE");
  expect(res.statusCode).toBe(400);
});

it("400 si promo désactivée", async () => {
  OfferQueries.Get_offer_by_code.mockImplementation((client, code, cb) =>
    cb(null, { id_promotion: 1, est_actif: 0, date_expiration: "2030-01-01" })
  );
  const res = await request(app).get("/api/offers/verify/DESACTIVE");
  expect(res.statusCode).toBe(400);
});

  });
});
