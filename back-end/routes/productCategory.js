import express from "express";
import { body, param } from "express-validator";
import { getConnection } from "../queries/connect.js";
import validateRequest from "../middlewares/validateRequest.js";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import {
  Add_product_categories,
  Get_product_categories,
  Get_category_products,
  Delete_product_category,
  Replace_product_category,
} from "../queries/productCategory.js";

const router = express.Router();

// Ajouter plusieurs catégories à un produit
router.post(
  "/add",
  authenticateToken,
  isAdmin,
  [
    body("id_produit").isInt().withMessage("'id_produit' doit être un entier."),
    body("categories").isArray({ min: 1 }).withMessage("Une liste de catégories est requise."),
    body("categories.*").isInt().withMessage("Chaque ID de catégorie doit être un entier.")
  ],
  validateRequest,
  async (req, res) => {
    const client = getConnection();
    const { id_produit, categories } = req.body;

    try {
      Add_product_categories(client, id_produit, categories, (err, result) => {
        client.end();
        if (err){
          console.error("Erreur SQL dans Add_product_categories :", err);
          return res.status(500).json({ message: "Erreur lors de l'ajout des catégories." });
        } 
        res.status(200).json({ message: "Catégories associées avec succès." });
      });
    } catch {
      client.end();
      res.status(500).json({ message: "Erreur serveur." });
    }
  }
);

// Obtenir les catégories d’un produit
router.get(
  "/produit/:id_produit",
  [param("id_produit").isInt().withMessage("ID produit invalide.")],
  validateRequest,
  async (req, res) => {
    const client = getConnection();
    const { id_produit } = req.params;

    try {
      Get_product_categories(client, parseInt(id_produit), (err, categories) => {
        client.end();
        if (err){
          console.error("Erreur SQL dans Get_product_categories :", err);
          return res.status(500).json({ message: "Erreur lors de la récupération." });
        }
        res.status(200).json(categories);
      });
    } catch {
      client.end();
      res.status(500).json({ message: "Erreur serveur." });
    }
  }
);

// Obtenir les produits d’une catégorie
router.get(
  "/categorie/:id_categorie",
  [param("id_categorie").isInt().withMessage("ID catégorie invalide.")],
  validateRequest,
  async (req, res) => {
    const client = getConnection();
    const { id_categorie } = req.params;

    try {
      Get_category_products(client, parseInt(id_categorie), (err, produits) => {
        client.end();
        if (err) {
          console.error("Erreur SQL dans Get_category_products :", err);
          return res.status(500).json({ message: "Erreur lors de la récupération." });
        }
        res.status(200).json(produits);
      });
    } catch {
      client.end();
      res.status(500).json({ message: "Erreur serveur." });
    }
  }
);

// Supprimer une seule association produit-catégorie
router.delete(
  "/delete/:id_produit/:id_categorie",
  authenticateToken,
  isAdmin,
  [
    param("id_produit").isInt(),
    param("id_categorie").isInt()
  ],
  validateRequest,
  async (req, res) => {
    const client = getConnection();
    const { id_produit, id_categorie } = req.params;

    try {
      Delete_product_category(client, parseInt(id_produit), parseInt(id_categorie), (err, result) => {
        client.end();
        if (err){
          console.error("Erreur server dans Delete_product_category:",err);
          return res.status(500).json({ message: "Erreur lors de la suppression de l'association." });
        }
        res.status(200).json({ message: "Association supprimée." });
      });
    } catch {
      client.end();
      res.status(500).json({ message: "Erreur serveur." });
    }
  }
);

// Remplacer une catégorie d’un produit
router.put(
  "/replace/:id_produit",
  authenticateToken,
  isAdmin,
  [
    param("id_produit").isInt(),
    body("ancienne_id").isInt().withMessage("Ancienne catégorie invalide."),
    body("nouvelle_id").isInt().withMessage("Nouvelle catégorie invalide.")
  ],
  validateRequest,
  async (req, res) => {
    const client = getConnection();
    const { id_produit } = req.params;
    const { ancienne_id, nouvelle_id } = req.body;

    try {
      Replace_product_category(client, parseInt(id_produit), ancienne_id, nouvelle_id, (err, result) => {
        client.end();
        if (err){
          console.error("Erreur SQL dans Replace_product_category :", err);
          return res.status(500).json({ message: "Erreur lors du remplacement." });
        }
        res.status(200).json({ message: "Catégorie remplacée." });
      });
    } catch {
      client.end();
      res.status(500).json({ message: "Erreur serveur." });
    }
  }
);

export default router;
