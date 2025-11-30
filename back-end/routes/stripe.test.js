beforeEach(() => {
  console.error = jest.fn();
  console.log = jest.fn();
});

let mockStripeSessionCreate; // doit exister AVANT jest.mock("stripe")

jest.mock("../middlewares/authenticateToken.js", () => ({
  authenticateToken: (req, res, next) => {
    req.user = { id: 1 };
    req.cookies = { token: "fake-token" };
    next();
  }
}));

jest.mock("stripe", () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: (...args) => mockStripeSessionCreate(...args)
      }
    }
  }));
});

let mockQuery = jest.fn();
let mockRelease = jest.fn();

jest.mock("../queries/connect.js", () => ({
  getConnection: jest.fn((cb) => {
    cb(null, {
      query: mockQuery,
      release: mockRelease
    });
  })
}));

import express from "express";
import request from "supertest";
import checkoutRouter from "../routes/stripe.js";

function createApp() {
  const app = express();
  app.use(express.json());
  app.use("/checkout", checkoutRouter);
  return app;
}

describe("POST /checkout/create-checkout-session", () => {

  beforeEach(() => {
    mockStripeSessionCreate = jest.fn(); // réinitialiser Stripe avant chaque test
    mockQuery.mockReset();
    mockRelease.mockReset();
  });

  it("renvoie 400 si cartItems n'est pas un tableau", async () => {
    const app = createApp();

    const res = await request(app)
      .post("/checkout/create-checkout-session")
      .send({ cartItems: "not-array" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("cartItems doit être un tableau");
  });

  it("crée une session Stripe et insère le panier temporaire", async () => {
    const app = createApp();

    const fakeSession = {
      id: "sess_123",
      url: "https://checkout.stripe.com/pay/sess_123"
    };

    mockStripeSessionCreate.mockResolvedValue(fakeSession);

    mockQuery.mockImplementation((sql, params, cb) => cb(null));

    const payload = {
      cartItems: [{ id: 1 }],
      totalAmount: 25,
      initialAmount: 25,
      billingInfo: { email: "client@test.com" }
    };

    const res = await request(app)
      .post("/checkout/create-checkout-session")
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.url).toBe(fakeSession.url);
    expect(mockStripeSessionCreate).toHaveBeenCalledTimes(1);
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });

  it("gère les erreurs Stripe", async () => {
    const app = createApp();

    mockStripeSessionCreate.mockRejectedValue(new Error("Stripe error"));

    const res = await request(app)
      .post("/checkout/create-checkout-session")
      .send({
        cartItems: [],
        totalAmount: 10,
        initialAmount: 10,
        billingInfo: { email: "a@b.com" }
      });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Erreur lors de la création de la session de paiement");
  });
});
