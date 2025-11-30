import {
  Insert_review,
  Get_reviews_by_product,
  Update_review,
  Delete_review,
  Get_review_author
} from "../../queries/Review.js";

describe("Queries Review - Tests unitaires", () => {

  beforeAll(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("Insert_review", () => {
    it("devrait exécuter l'INSERT SQL et retourner les résultats", () => {
      const mockClient = {
        query: jest.fn((sql, params, cb) => cb(null, { insertId: 42 }))
      };
      const data = {
        id_user: 1,
        id_produit: 5,
        note: 4,
        commentaire: "Très bon produit"
      };
      const callback = jest.fn();
      Insert_review(mockClient, data, callback);
      expect(mockClient.query).toHaveBeenCalledWith(
        "INSERT INTO avis (id_user, id_produit, note, commentaire) VALUES (?, ?, ?, ?)",
        [1, 5, 4, "Très bon produit"],
        expect.any(Function)
      );
      expect(callback).toHaveBeenCalledWith(null, { insertId: 42 });
    });

    it("devrait renvoyer une erreur SQL", () => {
      const mockClient = {
        query: jest.fn((sql, params, cb) => cb("SQL ERROR", null))
      };
      const callback = jest.fn();
      Insert_review(mockClient, { id_user: 1 }, callback);

      expect(callback).toHaveBeenCalledWith("SQL ERROR", null);
    });
  });

  describe("Get_reviews_by_product", () => {
    it("devrait exécuter le SELECT SQL et renvoyer les résultats", () => {
      const mockClient = {
        query: jest.fn((sql, params, cb) => cb(null, [{ id_avis: 1 }]))
      };
      const callback = jest.fn();
      Get_reviews_by_product(mockClient, 10, callback);
      expect(mockClient.query).toHaveBeenCalledWith(
        "SELECT avis.*, users.prenom FROM avis JOIN users ON avis.id_user = users.id_user WHERE id_produit = ? ORDER BY date_creation DESC",
        [10],
        expect.any(Function)
      );
      expect(callback).toHaveBeenCalledWith(null, [{ id_avis: 1 }]);
    });

    it("devrait renvoyer une erreur SQL", () => {
      const mockClient = {
        query: jest.fn((sql, params, cb) => cb("SQL ERROR", null))
      };
      const callback = jest.fn();
      Get_reviews_by_product(mockClient, 5, callback);
      expect(callback).toHaveBeenCalledWith("SQL ERROR", null);
    });
  });

  describe("Update_review", () => {
    it("devrait exécuter l'UPDATE SQL", () => {
      const mockClient = {
        query: jest.fn((sql, params, cb) => cb(null, { affectedRows: 1 }))
      };
      const callback = jest.fn();
      Update_review(
        mockClient,
        { id_avis: 8, note: 3, commentaire: "ok" },
        callback
      );
      expect(mockClient.query).toHaveBeenCalledWith(
        "UPDATE avis SET note = ?, commentaire = ? WHERE id_avis = ?",
        [3, "ok", 8],
        expect.any(Function)
      );
      expect(callback).toHaveBeenCalledWith(null, { affectedRows: 1 });
    });

    it("devrait renvoyer une erreur SQL", () => {
      const mockClient = {
        query: jest.fn((sql, params, cb) => cb("SQL ERROR", null))
      };
      const callback = jest.fn();
      Update_review(mockClient, { id_avis: 1 }, callback);
      expect(callback).toHaveBeenCalledWith("SQL ERROR", null);
    });
  });

  describe("Delete_review", () => {
    it("devrait exécuter le DELETE SQL", () => {
      const mockClient = {
        query: jest.fn((sql, params, cb) => cb(null, { affectedRows: 1 }))
      };
      const callback = jest.fn();
      Delete_review(mockClient, 12, callback);
      expect(mockClient.query).toHaveBeenCalledWith(
        "DELETE FROM avis WHERE id_avis = ?",
        [12],
        expect.any(Function)
      );
      expect(callback).toHaveBeenCalledWith(null, { affectedRows: 1 });
    });

    it("devrait renvoyer une erreur SQL", () => {
      const mockClient = {
        query: jest.fn((sql, params, cb) => cb("SQL ERROR", null))
      };
      const callback = jest.fn();
      Delete_review(mockClient, 99, callback);
      expect(callback).toHaveBeenCalledWith("SQL ERROR", null);
    });
  });

  describe("Get_review_author", () => {
    it("devrait exécuter le SELECT et renvoyer l'auteur", () => {
      const mockClient = {
        query: jest.fn((sql, params, cb) => cb(null, [{ id_user: 5 }]))
      };
      const callback = jest.fn();
      Get_review_author(mockClient, 4, callback);
      expect(mockClient.query).toHaveBeenCalledWith(
        "SELECT id_user FROM avis WHERE id_avis = ?",
        [4],
        callback
      );
    });

    it("devrait renvoyer une erreur SQL", () => {
      const mockClient = {
        query: jest.fn((sql, params, cb) => cb("SQL ERROR", null))
      };
      const callback = jest.fn();
      Get_review_author(mockClient, 4, callback);
      expect(callback).toHaveBeenCalledWith("SQL ERROR", null);
    });
  });
});
