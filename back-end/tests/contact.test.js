import request from "supertest";
import app from "../app.js";
import { sendEmail } from "../utils/email.js";

beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

jest.mock("../utils/email.js", () => ({
  sendEmail: jest.fn(() => Promise.resolve())
}));

jest.mock("../middlewares/validateRequest.js", () =>
  jest.fn((req, res, next) => next())
);

describe("POST /api/contact", () => {
  beforeAll(() => {
    process.env.SUPPORT_EMAIL = "support@example.com";
  });

  it("Envoie un message de contact avec succès", async () => {
    const res = await request(app)
      .post("/api/contact")
      .send({
        email: "test@example.com",
        subject: "Sujet test",
        message: "Message valide"
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      success: true,
      message: "Message envoyé à l’équipe de support"
    });
  });

  it("Retourne une erreur si sendEmail échoue", async () => {
    sendEmail.mockImplementationOnce(() => Promise.reject("Erreur SMTP"));

    const res = await request(app)
      .post("/api/contact")
      .send({
        email: "test@example.com",
        subject: "Sujet",
        message: "Message valide"
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe("Échec de l’envoi de l’email");
  });

  it("Retourne une erreur si validation échoue", async () => {
    const validateRequest = require("../middlewares/validateRequest.js");

    validateRequest.mockImplementationOnce((req, res, next) => {
      return res.status(400).json({
        errors: [{ msg: "Email invalide" }]
      });
    });
    const res = await request(app)
      .post("/api/contact")
      .send({
        email: "invalid",
        subject: "He",
        message: "Trop court"
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].msg).toBe("Email invalide");
  });
});
