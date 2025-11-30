import request from "supertest";
import express from "express";
import rgpdRouter from "../routes/rgpd.js";

// Mocks des middlewares
jest.mock("../middlewares/authenticateToken.js", () => ({
  authenticateToken: (req, res, next) => {
    req.user = { id: 1 };
    next();
  },
}));
jest.mock("../middlewares/updateLastActivity.js", () => ({
  updateLastActivity: (req, res, next) => next(),
}));
jest.mock("../middlewares/logActivity.js", () => ({
  logActivity: () => (req, res, next) => next(),
}));
jest.mock("../middlewares/validateRequest.js", () => jest.fn((req, res, next) => next()));
jest.mock("../utils/email.js", () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
}));

const mockRelease = jest.fn();
jest.mock("../queries/connect.js", () => ({
  getConnection: (cb) => {
    const client = {
      query: (sql, params, callback) => {
        if (sql.includes("informations_facturation")) {
          if (sql.trim().startsWith("SELECT")) {
            return callback(null, [{ id_user: 1, email: "test@example.com" }]);
          }
          return callback(null, { affectedRows: 1 });
        }
        if (sql.includes("users")) {
          if (sql.trim().startsWith("SELECT")) {
            return callback(null, [{ nom: "John", prenom: "Doe", email: "test@example.com" }]);
          }
          if (sql.trim().startsWith("UPDATE")) {
            return callback(null, { affectedRows: 1 });
          }
          if (sql.trim().startsWith("DELETE")) {
            return callback(null, { affectedRows: 1 });
          }
        }
        return callback(null, []);
      },
      release: mockRelease,
    };
    cb(null, client);
  },
}));

const app = express();
app.use(express.json());
app.use("/rgpd", rgpdRouter);

describe("RGPD Routes", () => {
  test("GET /rgpd/get_billing_info/me doit retourner les informations de facturation", async () => {
    const response = await request(app)
      .get("/rgpd/get_billing_info/me")
      .set("Authorization", "Bearer testtoken")
      .expect(200);

    expect(response.body[0]).toEqual({ id_user: 1, email: "test@example.com" });
  });

  test("POST /rgpd/update_billing_data/me should update billing info", async () => {
    const billingData = {
      telephone: "12345678",
      nomEntreprise: "Test Inc",
      numeroTva: "FR123456",
      adresse: "123 Rue Test",
      complementAdresse: "",
      ville: "Paris",
      region: "Ile-de-France",
      codePostal: "75001",
      pays: "France"
    };

    const response = await request(app)
      .post("/rgpd/update_billing_data/me")
      .send(billingData)
      .set("Authorization", "Bearer testtoken")
      .expect(200);

    expect(response.body).toEqual({ message: "Informations mises à jour avec succès." });
  });

  test("GET /rgpd/me should return personal info", async () => {
    const response = await request(app)
      .get("/rgpd/me")
      .set("Authorization", "Bearer testtoken")
      .expect(200);

    expect(response.body).toEqual({ nom: "John", prenom: "Doe", email: "test@example.com" });
  });

  test("PUT /rgpd/me/info should update user's name and surname", async () => {
    const response = await request(app)
      .put("/rgpd/me/info")
      .send({ nom: "Jane", prenom: "Smith" })
      .set("Authorization", "Bearer testtoken")
      .expect(200);

    expect(response.body).toEqual({ message: "Nom et prénom mis à jour." });
  });

  test("DELETE /rgpd/me should delete the user account", async () => {
    const response = await request(app)
      .delete("/rgpd/me")
      .set("Authorization", "Bearer testtoken")
      .expect(200);

    expect(response.body).toEqual({ message: "Compte utilisateur supprimé avec succès." });
  });
});
