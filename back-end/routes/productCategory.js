// import express from "express";
// import { body, param } from "express-validator";
// import { getConnection } from "../queries/connect.js";
// import validateRequest from "../middlewares/validateRequest.js";
// import { authenticateToken } from "../middlewares/authenticateToken.js";
// import { isAdmin } from "../middlewares/isAdmin.js";
// import {
//   Add_product_categories,
//   Get_product_categories,
//   Get_category_products,
//   Delete_product_category,
//   Replace_product_category,
// } from "../queries/productCategory.js";

// const router = express.Router();

// // Ajouter plusieurs catégories à un produit
// router.post(
//   "/add",
//   authenticateToken,
//   isAdmin,
//   [
//     body("id_produit").isInt().withMessage("'id_produit' doit être un entier."),
//     body("id_categories")
//     .customSanitizer((value, { req }) => {
//       // S'assurer qu'on a toujours un tableau
//       if (Array.isArray(value)) return value;
//       return [value];
//     })
//     .custom((value) => value.length > 0)
//     .withMessage("Au moins une catégorie est requise."),
//   body("id_categories.*")
//     .isInt()
//     .withMessage("Chaque catégorie doit être un entier."),
//   ],
//   validateRequest,
//   async (req, res) => {
//     const client = getConnection();
//     const { id_produit, categories } = req.body;

//     try {
//       Add_product_categories(client, id_produit, categories, (err, result) => {
//         client.end();
//         if (err){
//           console.error("Erreur SQL dans Add_product_categories :", err);
//           return res.status(500).json({ message: "Erreur lors de l'ajout des catégories." });
//         } 
//         res.status(200).json({ message: "Catégories associées avec succès." });
//       });
//     } catch {
//       client.end();
//       res.status(500).json({ message: "Erreur serveur." });
//     }
//   }
// );

// // Obtenir les catégories d’un produit
// router.get(
//   "/produit/:id_produit",
//   [param("id_produit").isInt().withMessage("ID produit invalide.")],
//   validateRequest,
//   async (req, res) => {
//     const client = getConnection();
//     const { id_produit } = req.params;

//     try {
//       Get_product_categories(client, parseInt(id_produit), (err, categories) => {
//         client.end();
//         if (err){
//           console.error("Erreur SQL dans Get_product_categories :", err);
//           return res.status(500).json({ message: "Erreur lors de la récupération." });
//         }
//         res.status(200).json(categories);
//       });
//     } catch {
//       client.end();
//       res.status(500).json({ message: "Erreur serveur." });
//     }
//   }
// );

// // Obtenir les produits d’une catégorie
// router.get(
//   "/categorie/:id_categorie",
//   [param("id_categorie").isInt().withMessage("ID catégorie invalide.")],
//   validateRequest,
//   async (req, res) => {
//     const client = getConnection();
//     const { id_categorie } = req.params;

//     try {
//       Get_category_products(client, parseInt(id_categorie), (err, produits) => {
//         client.end();
//         if (err) {
//           console.error("Erreur SQL dans Get_category_products :", err);
//           return res.status(500).json({ message: "Erreur lors de la récupération." });
//         }
//         res.status(200).json(produits);
//       });
//     } catch {
//       client.end();
//       res.status(500).json({ message: "Erreur serveur." });
//     }
//   }
// );

// // Supprimer une seule association produit-catégorie
// router.delete(
//   "/delete/:id_produit/:id_categorie",
//   authenticateToken,
//   isAdmin,
//   [
//     param("id_produit").isInt(),
//     param("id_categorie").isInt()
//   ],
//   validateRequest,
//   async (req, res) => {
//     const client = getConnection();
//     const { id_produit, id_categorie } = req.params;

//     try {
//       Delete_product_category(client, parseInt(id_produit), parseInt(id_categorie), (err, result) => {
//         client.end();
//         if (err){
//           console.error("Erreur server dans Delete_product_category:",err);
//           return res.status(500).json({ message: "Erreur lors de la suppression de l'association." });
//         }
//         res.status(200).json({ message: "Association supprimée." });
//       });
//     } catch {
//       client.end();
//       res.status(500).json({ message: "Erreur serveur." });
//     }
//   }
// );

// // Remplacer une catégorie d’un produit
// router.put(
//   "/replace/:id_produit",
//   authenticateToken,
//   isAdmin,
//   [
//     param("id_produit").isInt(),
//     body("ancienne_id").isInt().withMessage("Ancienne catégorie invalide."),
//     body("nouvelle_id").isInt().withMessage("Nouvelle catégorie invalide.")
//   ],
//   validateRequest,
//   async (req, res) => {
//     const client = getConnection();
//     const { id_produit } = req.params;
//     const { ancienne_id, nouvelle_id } = req.body;

//     try {
//       Replace_product_category(client, parseInt(id_produit), ancienne_id, nouvelle_id, (err, result) => {
//         client.end();
//         if (err){
//           console.error("Erreur SQL dans Replace_product_category :", err);
//           return res.status(500).json({ message: "Erreur lors du remplacement." });
//         }
//         res.status(200).json({ message: "Catégorie remplacée." });
//       });
//     } catch {
//       client.end();
//       res.status(500).json({ message: "Erreur serveur." });
//     }
//   }
// );

// export default router;


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
import { logActivity } from '../middlewares/logActivity.js';
import { updateLastActivity } from '../middlewares/updateLastActivity.js';


const router = express.Router();

// Ajouter plusieurs catégories à un produit
router.post(
  "/add",
  authenticateToken,
  logActivity("Ajout d'une ou plusieurs catégories"),
  updateLastActivity,
  isAdmin,
  [
    body("id_produit").isInt().withMessage("'id_produit' doit être un entier."),
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
      if (err) {
        return res.status(500).json({ message: "Erreur de connexion à la base de données." });
      }
      const { id_produit, id_categories } = req.body;
      Add_product_categories(client, id_produit, id_categories, (err, result) => {
        client.release();
        if (err){
          console.error("Erreur SQL dans Add_product_categories :", err);
          return res.status(500).json({ message: "Erreur lors de l'ajout des catégories." });
        } 
        res.status(200).json({ message: "Catégories associées avec succès." });
      });
    });
  }
);

// Obtenir les catégories d’un produit
router.get(
  "/produit/:id_produit",
  logActivity("Recupération des catégorie d'un produits"),
  [param("id_produit").isInt().withMessage("ID produit invalide.")],
  validateRequest,
  (req, res) => {
    getConnection((err, client) => {
      if (err) {
        return res.status(500).json({ message: "Erreur de connexion à la base de données." });
      }
      const { id_produit } = req.params;
      Get_product_categories(client, parseInt(id_produit), (err, categories) => {
        client.release();
        if (err){
          console.error("Erreur SQL dans Get_product_categories :", err);
          return res.status(500).json({ message: "Erreur lors de la récupération." });
        }
        res.status(200).json(categories);
      });
    });
  }
);

// Obtenir les produits d’une catégorie
router.get(
  "/categorie/:id_categorie",
  logActivity("Recupération des produits d'une catégorie"),
  [param("id_categorie").isInt().withMessage("ID catégorie invalide.")],
  validateRequest,
  (req, res) => {
    getConnection((err, client) => {
      if (err) {
        return res.status(500).json({ message: "Erreur de connexion à la base de données." });
      }
      const { id_categorie } = req.params;
      Get_category_products(client, parseInt(id_categorie), (err, produits) => {
        client.release();
        if (err) {
          console.error("Erreur SQL dans Get_category_products :", err);
          return res.status(500).json({ message: "Erreur lors de la récupération." });
        }
        res.status(200).json(produits);
      });
    });
  }
);

// Supprimer une seule association produit-catégorie
router.delete(
  "/delete/:id_produit/:id_categorie",
  authenticateToken,
  logActivity("Supprimer une seule association produit-catégorie"),
  updateLastActivity,
  isAdmin,
  [
    param("id_produit").isInt(),
    param("id_categorie").isInt()
  ],
  validateRequest,
  (req, res) => {
    getConnection((err, client) => {
      if (err) {
        return res.status(500).json({ message: "Erreur de connexion à la base de données." });
      }
      const { id_produit, id_categorie } = req.params;
      Delete_product_category(client, parseInt(id_produit), parseInt(id_categorie), (err, result) => {
        client.release();
        if (err){
          console.error("Erreur server dans Delete_product_category:",err);
          return res.status(500).json({ message: "Erreur lors de la suppression de l'association." });
        }
        res.status(200).json({ message: "Association supprimée." });
      });
    });
  }
);

// Remplacer une catégorie d’un produit
router.put(
  "/replace/:id_produit",
  authenticateToken,
  logActivity("Remplacement d'une catégorie d’un produit"),
  updateLastActivity,
  isAdmin,
  [
    param("id_produit").isInt(),
    body("ancienne_id").isInt().withMessage("Ancienne catégorie invalide."),
    body("nouvelle_id").isInt().withMessage("Nouvelle catégorie invalide.")
  ],
  validateRequest,
  (req, res) => {
    getConnection((err, client) => {
      if (err) {
        return res.status(500).json({ message: "Erreur de connexion à la base de données." });
      }
      const { id_produit } = req.params;
      const { ancienne_id, nouvelle_id } = req.body;
      Replace_product_category(client, parseInt(id_produit), ancienne_id, nouvelle_id, (err, result) => {
        client.release();
        if (err){
          console.error("Erreur SQL dans Replace_product_category :", err);
          return res.status(500).json({ message: "Erreur lors du remplacement." });
        }
        res.status(200).json({ message: "Catégorie remplacée." });
      });
    });
  }
);

export default router;