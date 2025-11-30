import request from "supertest";
import app from "../app.js";

import { getConnection } from "../queries/connect.js";
import {
  Get_all_categories,
  Get_one_category,
  Insert_category,
  Update_category,
  Delete_category
} from "../queries/category.js";

beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

jest.mock("../queries/connect.js", () => ({
  getConnection: jest.fn()
}));

jest.mock("../queries/category.js", () => ({
  Get_all_categories: jest.fn(),
  Get_one_category: jest.fn(),
  Insert_category: jest.fn(),
  Update_category: jest.fn(),
  Delete_category: jest.fn()
}));

jest.mock("../middlewares/authenticateToken.js", () =>
  ({ authenticateToken: (req, res, next) => next() })
);

jest.mock("../middlewares/isAdmin.js", () =>
  ({ isAdmin: (req, res, next) => next() })
);

jest.mock("../middlewares/validateRequest.js", () =>
  jest.fn((req, res, next) => next())
);

jest.mock("../middlewares/logActivity.js", () => ({
  logActivity: () => (req, res, next) => next()
}));

jest.mock("../middlewares/updateLastActivity.js", () => ({
  updateLastActivity: (req, res, next) => next()
}));


const mockClient = {
  release: jest.fn(),
  query: jest.fn()
};

beforeEach(() => {
  jest.clearAllMocks();
  getConnection.mockImplementation((cb) => cb(null, mockClient));
});

describe("GET /api/category", () => {
  it("retourne toutes les catégories", async () => {
    const fakeCategories = [
      { id_categorie: 1, nom_categorie: "Sport", description: "Cat sport" },
    ];
    Get_all_categories.mockImplementation((client, cb) => cb(null, fakeCategories));
    const res = await request(app).get("/api/category");
    expect(res.status).toBe(200);
    expect(res.body).toEqual(fakeCategories);
  });

  it("retourne une erreur SQL", async () => {
    Get_all_categories.mockImplementation((client, cb) =>
      cb("SQL ERROR", null)
    );
    const res = await request(app).get("/api/category");
    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Erreur lors de la récupération des catégories.");
  });
});

describe("POST /api/category/add", () => {
  it("ajoute une catégorie", async () => {
    Insert_category.mockImplementation((client, data, cb) => cb(null, {}));
    const res = await request(app)
      .post("/api/category/add")
      .send({
        nom_categorie: "Nouveau",
        description: "Desc"
      });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ message: "Catégorie ajoutée avec succès." });
  });

  it("erreur SQL lors de l'ajout", async () => {
    Insert_category.mockImplementation((client, data, cb) =>
      cb("SQL ERROR", null)
    );
    const res = await request(app)
      .post("/api/category/add")
      .send({
        nom_categorie: "Erreur",
        description: "Desc"
      });
    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Erreur lors de la création de la catégorie.");
  });
});

describe("GET /api/category/:id", () => {
  it("retourne une catégorie", async () => {
    const fakeCat = { id_categorie: 1, nom_categorie: "Sport" };
    Get_one_category.mockImplementation((client, id, cb) => cb(null, fakeCat));
    const res = await request(app).get("/api/category/1");
    expect(res.status).toBe(200);
    expect(res.body).toEqual(fakeCat);
  });

  it("catégorie non trouvée", async () => {
    Get_one_category.mockImplementation((client, id, cb) => cb(null, null));
    const res = await request(app).get("/api/category/99");
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Catégorie non trouvée.");
  });

  it("erreur SQL Get_one_category", async () => {
    Get_one_category.mockImplementation((client, id, cb) =>
      cb("SQL ERROR", null)
    );
    const res = await request(app).get("/api/category/1");
    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Erreur lors de la récupération de la catégorie.");
  });
});

describe("PUT /api/category/update/:id", () => {
  it("modifie une catégorie", async () => {
    Update_category.mockImplementation((client, data, cb) => cb(null, {}));
    const res = await request(app)
      .put("/api/category/update/1")
      .send({
        nom_categorie: "Modifiée",
        description: "Nouvelle"
      });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Catégorie modifiée avec succès.");
  });

  it("erreur SQL Update", async () => {
    Update_category.mockImplementation((client, data, cb) =>
      cb("SQL ERROR", null)
    );
    const res = await request(app)
      .put("/api/category/update/1")
      .send({
        nom_categorie: "Err",
        description: "Err"
      });
    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Erreur lors de la modification de la catégorie.");
  });
});

describe("DELETE /api/category/delete/:id", () => {
  it("supprime une catégorie", async () => {
    Delete_category.mockImplementation((client, id, cb) => cb(null, {}));
    const res = await request(app).delete("/api/category/delete/1");
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Catégorie supprimée avec succès.");
  });

  it("erreur SQL Delete_category", async () => {
    Delete_category.mockImplementation((client, id, cb) =>
      cb("SQL ERROR", null)
    );
    const res = await request(app).delete("/api/category/delete/1");
    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Erreur lors de la suppression de la catégorie.");
  });
});
