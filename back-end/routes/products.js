import express from "express";
import { body, param } from "express-validator";
import { getConnection } from "../queries/connect.js";
import {
  Insert_product,
  Get_all_products,
  Get_product_image_by_id,
  Get_one_product,
  Update_product,
  Delete_product,
} from "../queries/product.js";
import { upload } from "../utils/multer.js";
import { Add_product_categories } from "../queries/productCategory.js";
import {
  Update_product_categories,
  Get_product_categories
} from "../queries/productCategory.js";

import validateRequest from "../middlewares/validateRequest.js";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { logActivity } from '../middlewares/logActivity.js';
import { updateLastActivity } from '../middlewares/updateLastActivity.js';

const router = express.Router();

// Obtenir tous les produits
router.get("/",
  logActivity("Recuperation de tous les produits"),
  (req, res) => {
  getConnection((err, client) => {
    if (err) return res.status(500).json({ message: "Erreur de connexion à la base de données." });
    Get_all_products(client, (err, results) => {
      client.release();
      if (err) return res.status(500).json({ message: "Erreur lors de la récupération des produits." });
      res.status(200).json(results);
    });
  });
});

router.get("/:id/image",
  [param("id").isInt().withMessage("'id' doit être un entier.")],
  validateRequest,
  (req, res) => {
  getConnection((err, client) => {
    if (err) return res.status(500).json({ message: "Erreur de connexion à la base de données." });
    const id = req.params.id;
    Get_product_image_by_id(client, id, (err, result) => {
      client.release();
      if (err) {
        console.error("❌ Erreur SQL :", err);
        return res.status(500).json({ message: "Erreur requête SQL." });
      }
      if (!result || result.length === 0) {
        console.warn("⚠️ Aucun résultat pour le produit :", id);
        return res.status(404).json({ message: "Produit non trouvé." });
      }
      const imageBuffer = result[0].image;
      if (!imageBuffer) {
        console.warn("⚠️ Image vide ou nulle pour le produit :", id);
        return res.status(404).json({ message: "Image introuvable." });
      }
      res.header("Content-Type", "image/jpeg");
      res.send(imageBuffer);
    });
  });
});

// Ajout d'un nouveau produit
router.post(
  "/add",
  authenticateToken,
  updateLastActivity,
  logActivity("Ajout d'un nouveau produit"),
  isAdmin,
  upload.single("image"), 
  [
    body("titre").notEmpty().withMessage("Le nom du produit est requis."),
    body("description").optional().isString(),
    body("prix").isFloat({ gt: 0 }).withMessage("Le prix doit être un nombre positif."),
    body("stock").isInt({min: 0}).withMessage("Le stock ne peut pas etre inférieur à 0."),
    body("id_categories")
      .customSanitizer((value, { req }) => {
        if (Array.isArray(value)) return value;
        return [value];
      })
      .custom((value) => value.length > 0)
      .withMessage("Au moins une catégorie est requise."),
    body("id_categories.*")
      .isInt()
      .withMessage("Chaque catégorie doit être un entier."),
  ],
  validateRequest,
  (req, res) => {
    getConnection((err, client) => {
      if (err) return res.status(500).json({ message: "Erreur de connexion à la base de données." });
      const { titre, description, prix, stock, id_categories } = req.body;
      const imageBuffer = req.file ? req.file.buffer : null;

      Insert_product(client, { titre, description, prix, stock, image: imageBuffer }, (err, result) => {
        if (err) {
          client.release();
          console.error("Erreur lors de l'insertion du produit :", err);
          return res.status(500).json({ message: "Erreur lors de l'ajout du produit." });
        }
        const id_produit = result.insertId;
        Add_product_categories(client, id_produit, id_categories, (errAssoc) => {
          client.release();
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
    });
  }
);

//modification d'un produit
router.put(
  "/update/:id_produit",
  authenticateToken,
  updateLastActivity,
  logActivity("Modification d'un produit"),
  isAdmin,
  upload.single("image"),
  [
    param("id_produit").isInt().withMessage("'id_produit' doit être un entier."),
    body("titre").optional().notEmpty().withMessage("Le nom du produit est requis."),
    body("description").optional().isString(),
    body("prix").optional().isFloat({ gt: 0 }).withMessage("Le prix doit être un nombre positif."),
    body("stock").isInt({min: 0}).withMessage("Le stock ne peut pas etre inférieur à 0."),
    body("id_categories")
      .optional()
      .customSanitizer((value, { req }) => {
        if (Array.isArray(value)) return value;
        return [value];
      })
      .custom((value) => !value || value.length > 0)
      .withMessage("Au moins une catégorie est requise si elle est fournie."),
    body("id_categories.*")
      .optional()
      .isInt()
      .withMessage("Chaque catégorie doit être un entier."),
  ],
  validateRequest,
  (req, res) => {
    getConnection((err, client) => {
      if (err) return res.status(500).json({ message: "Erreur de connexion à la base de données." });
      const { id_produit } = req.params;
      const { titre, description, prix, stock, id_categories } = req.body;
      const imageBuffer = req.file ? req.file.buffer : null;

      if (!titre && !description && !prix && !stock && !imageBuffer && !id_categories) {
        client.release();
        return res.status(400).json({ message: "Aucune donnée fournie pour la mise à jour." });
      }

      Update_product(
        client,
        {
          id_produit: parseInt(id_produit),
          titre,
          description,
          prix,
          stock,
          image: imageBuffer,
        },
        (err, result) => {
          if (err) {
            client.release();
            console.error(err);
            return res.status(500).json({ message: "Erreur lors de la mise à jour du produit." });
          }
          if (id_categories && id_categories.length > 0) {
            Update_product_categories(client, parseInt(id_produit), id_categories, (errCat) => {
              client.release();
              if (errCat) {
                return res.status(500).json({
                  message: "Produit mis à jour, mais erreur lors de la mise à jour des catégories.",
                });
              }
              res.status(200).json({
                message: "Produit et catégories mis à jour avec succès.",
              });
            });
          } else {
            client.release();
            res.status(200).json({ message: "Produit mis à jour avec succès." });
          }
        }
      );
    });
  }
);

// Supprimer un produit
router.delete(
  "/delete/:id_produit",
  authenticateToken,
  updateLastActivity,
  logActivity("Ajout d'un nouveau produit"),
  isAdmin,
  [param("id_produit").isInt().withMessage("'id_produit' doit être un entier.")],
  validateRequest,
  (req, res) => {
    getConnection((err, client) => {
      if (err) return res.status(500).json({ message: "Erreur de connexion à la base de données." });
      const { id_produit } = req.params;
      Delete_product(client, parseInt(id_produit), (err, result) => {
        client.release();
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Erreur lors de la suppression du produit." });
        }
        res.status(200).json({ message: "Produit supprimé avec succès." });
      });
    });
  }
);

router.get("/:id_produit/suggestions",
  [param("id_produit").isInt().withMessage("'id_produit' doit être un entier.")],
  validateRequest,
  (req, res) => {
  getConnection((err, connection) => {
    if (err) {
      return res.status(500).json({ message: "Erreur de connexion à la base de données." });
    }

    const id = parseInt(req.params.id_produit);

    if (isNaN(id)) {
      connection.release();
      return res.status(400).json({ message: "ID produit invalide." });
    }

    const sql = `
      SELECT DISTINCT p.*
      FROM produits p
      JOIN produit_categorie pc ON p.id_produit = pc.id_produit
      WHERE pc.id_categorie IN (
        SELECT id_categorie
        FROM produit_categorie
        WHERE id_produit = ?
      )
      AND p.id_produit != ?
      LIMIT 4;
    `;

    connection.query(sql, [id, id], (err, results) => {
      connection.release();
      if (err) {
        return res.status(500).json({ message: "Erreur lors de la récupération des suggestions." });
      }
      res.status(200).json(results);
    });
  });
});

router.get(
  "/:id_produit",
  logActivity("Obtenir un produit par ID"),
  [param("id_produit").isInt().withMessage("'id_produit' doit être un entier.")],
  validateRequest,
  (req, res) => {
    getConnection((err, client) => {
      if (err) return res.status(500).json({ message: "Erreur de connexion à la base de données." });
      const id = parseInt(req.params.id_produit);
      Get_one_product(client, id, (err, product) => {
        client.release();
        if (err) {
          console.error("Erreur lors de la récuperation du produit:", err);
          return res.status(500).json({ message: "Erreur lors de la récupération du produit." });
        }
        if (!product) return res.status(404).json({ message: "Produit non trouvé." });
        res.status(200).json(product);
      });
    });
  }
);

export default router;