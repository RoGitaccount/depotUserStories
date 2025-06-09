import express from "express";
import { body, param } from "express-validator";
import { getConnection } from "../queries/connect.js";
import validateRequest from "../middlewares/validateRequest.js";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import { isAdmin } from "../middlewares/isAdmin.js";
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

router.get("/:id/image", async (req, res) => {
  const client = getConnection();
  const id = req.params.id;

  //console.log("🔍 Requête image pour l'ID :", id);

  try {
    Get_product_image_by_id(client, id, (err, result) => {
      client.end(); // on ferme tout de suite quoi qu'il arrive

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

      res.header("Content-Type", "image/jpeg"); // adapte selon ton format
      res.send(imageBuffer);
    });
  } catch (err) {
    console.error("🔥 Exception serveur :", err);
    client.end();
    res.status(500).json({ message: "Erreur serveur." });
  }
});

router.post(
  "/add",
  authenticateToken,
  isAdmin,
  upload.single("image"), 
  [
    body("titre").notEmpty().withMessage("Le nom du produit est requis."),
    body("description").optional().isString(),
    body("prix").isFloat({ gt: 0 }).withMessage("Le prix doit être un nombre positif."),
    body("id_categories")
    .customSanitizer((value, { req }) => {
      // S'assurer qu'on a toujours un tableau
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
  async (req, res) => {
    const client = getConnection();
    const { titre, description, prix, id_categories } = req.body;
    const imageBuffer = req.file ? req.file.buffer : null;

    console.log("BODY:", req.body);
    console.log("FICHIERS:", req.file || req.files);

    try {
      Insert_product(client, { titre, description, prix, image: imageBuffer }, (err, result) => {
        if (err) {
          client.end();
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

router.put(
  "/update/:id_produit",
  authenticateToken,
  isAdmin,
  upload.single("image"),
  [
    param("id_produit").isInt().withMessage("'id_produit' doit être un entier."),
    body("titre").optional().notEmpty().withMessage("Le nom du produit est requis."),
    body("description").optional().isString(),
    body("prix").optional().isFloat({ gt: 0 }).withMessage("Le prix doit être un nombre positif."),
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
  async (req, res) => {
    const client = getConnection();
    const { id_produit } = req.params;
    const { titre, description, prix, id_categories } = req.body;
    const imageBuffer = req.file ? req.file.buffer : null;

    if (!titre && !description && !prix && !imageBuffer && !id_categories) {
      client.end();
      return res.status(400).json({ message: "Aucune donnée fournie pour la mise à jour." });
    }

    try {
      // Mise à jour du produit
      Update_product(
        client,
        {
          id_produit: parseInt(id_produit),
          titre,
          description,
          prix,
          image: imageBuffer,
        },
        (err, result) => {
          if (err) {
            client.end();
            console.error(err);
            return res.status(500).json({ message: "Erreur lors de la mise à jour du produit." });
          }

          // Mise à jour des catégories si fournies
          if (id_categories && id_categories.length > 0) {
            Update_product_categories(client, parseInt(id_produit), id_categories, (errCat) => {
              client.end();
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
            client.end();
            res.status(200).json({ message: "Produit mis à jour avec succès." });
          }
        }
      );
    } catch (e) {
      client.end();
      console.error(e);
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

export default router;
