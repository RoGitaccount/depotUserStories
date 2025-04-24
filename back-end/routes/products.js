import express from "express";
import { body, param } from "express-validator";
import { getConnection } from "../queries/connect.js";
import validateRequest from "../middlewares/validateRequest.js";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import {
  Insert_product,
  Get_all_products,
  Get_one_product,
  Update_product,
  Delete_product,
} from "../queries/product.js";
import { Add_product_categories } from "../queries/productCategory.js";

const router = express.Router();

// Obtenir tous les produits
router.get("/", async (req, res) => {
  const client = getConnection();

  try {
    Get_all_products(client, (err, results) => {
      client.end();
      if (err) return res.status(500).json({ message: "Erreur lors de la récupération des produits." });
      res.status(200).json(results);
    });
  } catch {
    client.end();
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// Ajouter un produit avec catégories
router.post(
  "/add",
  authenticateToken,
  isAdmin,
  [
    body("titre").notEmpty().withMessage("Le nom du produit est requis."),
    body("description").optional().isString(),
    body("prix").isFloat({ gt: 0 }).withMessage("Le prix doit être un nombre positif."), //gt: greater than
    body("stock").isInt({ min: 0 }).withMessage("Le stock doit être un entier positif."),
    body("id_categories").isArray({ min: 1 }).withMessage("Au moins une catégorie est requise."),
    body("id_categories.*").isInt().withMessage("Les ID de catégories doivent être des entiers."),
  ],
  validateRequest,
  async (req, res) => {
    const client = getConnection();
    const { titre, description, prix, stock, id_categories } = req.body;

    try {
      Insert_product(client, { titre, description, prix, stock }, (err, result) => {
        client.end();
        if (err) {
          console.error("Erreur lors de l'insertion du produit :", err);
          return res.status(500).json({ message: "Erreur lors de l'ajout du produit." });
        }

        const id_produit = result.insertId;

        Add_product_categories(client, id_produit, id_categories, (errAssoc) => {
          client.end();
          if (errAssoc) {
            return res.status(500).json({
              message: "Produit ajouté, mais erreur lors de l'association aux catégories.",
            });
          }

          res.status(201).json({
            message: "Produit ajouté et associé avec succès aux catégories.",
            id_produit,
          });
        });
      });
    } catch {
      client.end();
      res.status(500).json({ message: "Erreur serveur." });
    }
  }
);

// Obtenir un produit par ID
router.get(
  "/:id_produit",
  [param("id_produit").isInt().withMessage("'id_produit' doit être un entier.")],
  validateRequest,
  async (req, res) => {
    const client = getConnection();
    const { id_produit } = req.params;

    try {
      Get_one_product(client, parseInt(id_produit), (err, product) => {
        client.end();
        if (err) {
          console.error("Erreur lors de la récuperation du produit:", err);
          return res.status(500).json({ message: "Erreur lors de la récupération du produit." });
        }
        if (!product) return res.status(404).json({ message: "Produit non trouvé." });
        res.status(200).json(product);
      });
    } catch {
      client.end();
      res.status(500).json({ message: "Erreur serveur." });
    }
  }
);

// Modifier un produit
router.put(
  "/update/:id_produit",
  authenticateToken,
  isAdmin,
  [
    param("id_produit").isInt().withMessage("'id_produit' doit être un entier."),
    body("titre").optional().notEmpty().withMessage("Le nom du produit est requis."),
    body("description").optional().isString(),
    body("prix").optional().isFloat({ gt: 0 }).withMessage("Le prix doit être un nombre positif."),
    body("stock").optional().isInt({ min: 0 }).withMessage("Le stock doit être un entier positif."),
  ],
  validateRequest,
  async (req, res) => {
    const client = getConnection();
    const { id_produit } = req.params;
    const { titre, description, prix, stock } = req.body;

    if (!titre && !description && !prix && !stock) {
      client.end();
      return res.status(400).json({ message: "Aucune donnée fournie pour la mise à jour." });
    }
        
    try {
      Update_product(
        client,
        { id_produit: parseInt(id_produit), titre, description, prix, stock },
        (err, result) => {
          client.end();
          if (err){
          console.error(err);
          return res.status(500).json({ message: "Erreur lors de la mise à jour du produit." });
        }
          res.status(200).json({ message: "Produit mis à jour avec succès." });
        }
      );
    } catch {
      client.end();
      res.status(500).json({ message: "Erreur serveur." });
    }
  }
);

// Supprimer un produit
router.delete(
  "/delete/:id_produit",
  authenticateToken,
  isAdmin,
  [param("id_produit").isInt().withMessage("'id_produit' doit être un entier.")],
  validateRequest,
  async (req, res) => {
    const client = getConnection();
    const { id_produit } = req.params;

    try {
      Delete_product(client, parseInt(id_produit), (err, result) => {
        client.end();
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Erreur lors de la suppression du produit." });
        }
        res.status(200).json({ message: "Produit supprimé avec succès." });
      });
    } catch {
      client.end();
      res.status(500).json({ message: "Erreur serveur." });
    }
  }
);

export default router;
