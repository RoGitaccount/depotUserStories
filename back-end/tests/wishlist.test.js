import request from "supertest";
import app from "../app.js";

jest.mock("../middlewares/authenticateToken.js", () => ({
  authenticateToken: (req, res, next) => {
    req.user = { id: 1 };
    next();
  }
}));

jest.mock("../middlewares/updateLastActivity.js", () => ({
  updateLastActivity: (req, res, next) => next()
}));

jest.mock("../middlewares/logActivity.js", () => ({
  logActivity: () => (req, res, next) => next()
}));

jest.mock("../queries/connect.js", () => ({
  getConnection: (cb) => {
    cb(null, {
      query: jest.fn(),
      release: jest.fn()
    });
  }
}));

import {
  Get_user_wishlist,
  Clear_wishlist,
  Remove_from_wishlist,
  Add_to_wishlist
} from "../queries/wishlist.js";

import {
  Add_to_cart,
  Add_all_to_cart
} from "../queries/cart.js";

jest.mock("../queries/wishlist.js");
jest.mock("../queries/cart.js");

//début des test

describe("WISHLIST API", () => {

  it("GET /api/wishlist → retourne la wishlist", async () => {
    Get_user_wishlist.mockImplementation((client, userId, cb) =>
      cb(null, [{ id_produit: 10 }, { id_produit: 20 }])
    );
    const res = await request(app).get("/api/wishlist");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
  });

  it("POST /api/wishlist/add_to_cart/:id → ajoute un produit au panier", async () => {
    Add_to_cart.mockImplementation((client, data, cb) => cb(null, true));
    const res = await request(app).post("/api/wishlist/add_to_cart/5");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/succès/i);
  });

  it("POST /api/wishlist/add_all_to_cart → ajoute toute la wishlist au panier", async () => {
    Add_all_to_cart.mockImplementation((client, data, cb) => cb(null, true));
    const res = await request(app).post("/api/wishlist/add_all_to_cart");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/succès/i);
  });

  it("POST /api/wishlist/add/:id → ajoute un produit à la wishlist", async () => {
    Add_to_wishlist.mockImplementation((client, data, cb) => cb(null, true));
    const res = await request(app).post("/api/wishlist/add/7");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/succès/i);
  });

  it("DELETE /api/wishlist/delete/:id → supprime un produit", async () => {
    Remove_from_wishlist.mockImplementation((client, data, cb) => cb(null, true));
    const res = await request(app).delete("/api/wishlist/delete/7");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/succès/i);
  });

  it("DELETE /api/wishlist/clear → vide la wishlist", async () => {
    Clear_wishlist.mockImplementation((client, data, cb) => cb(null, true));
    const res = await request(app).delete("/api/wishlist/clear");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/succès/i);
  });
});
