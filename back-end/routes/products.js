import express from "express";
import { body, param } from "express-validator";
import { getConnection } from "../queries/connect.js";
import validateRequest from "../middlewares/validateRequest.js";
import { Insert_product, Get_all_products, Update_product, Delete_product } from "../queries/Product.js";
import { authenticateToken } from "../middlewares/authenticateToken.js";

const router = express.Router();

// Ajouter un produit
router.post(
  "/add",
  [
    body("titre").notEmpty().withMessage("Le champ 'titre' est obligatoire."),
    body("description").notEmpty().withMessage("Le champ 'description' est obligatoire."),
    body("prix").isDecimal().withMessage("Le champ 'prix' doit être un nombre décimal."),
    body("stock").isInt().withMessage("Le champ 'stock' doit être un entier."),
    body("image_url").optional().isURL().withMessage("Le champ 'image_url' doit être une URL valide."),
    body("id_categorie").isInt().withMessage("Le champ 'id_categorie' doit être un entier."),
  ],
  validateRequest,
  async (req, res) => {
    const { titre, description, prix, stock, image_url, id_categorie } = req.body;
    const client = getConnection("DSP");

    try {
      Insert_product(client, { titre, description, prix, stock, image_url, id_categorie }, (err, results) => {
        if (err) {
          client.end();
          return res.status(500).json({ message: "Erreur lors de l'ajout du produit." });
        }
        client.end();
        res.status(201).json({ message: "Produit ajouté avec succès." });
      });
    } catch {
      client.end();
      res.status(500).json({ message: "Erreur lors de l'ajout du produit." });
    }
  }
);

// Récupérer tous les produits
router.get("/", async (req, res) => {
  const client = getConnection("DSP");

  try {
    Get_all_products(client, (err, results) => {
      if (err) {
        client.end();
        return res.status(500).json({ message: "Erreur lors de la récupération des produits." });
      }
      client.end();
      res.status(200).json(results);
    });
  } catch {
    client.end();
    res.status(500).json({ message: "Erreur lors de la récupération des produits." });
  }
});

// Modifier un produit
router.put(
  "/update/:id_produit",
  authenticateToken,
  [
    param("id_produit").isInt().withMessage("Le champ 'id_produit' doit être un entier."),
    body("titre").notEmpty().withMessage("Le champ 'titre' est obligatoire."),
    body("description").notEmpty().withMessage("Le champ 'description' est obligatoire."),
    body("prix").isDecimal().withMessage("Le champ 'prix' doit être un nombre décimal."),
    body("stock").isInt().withMessage("Le champ 'stock' doit être un entier."),
    body("image_url").optional().isURL().withMessage("Le champ 'image_url' doit être une URL valide."),
    body("id_categorie").isInt().withMessage("Le champ 'id_categorie' doit être un entier."),
  ],
  validateRequest,
  async (req, res) => {
    const { id_produit } = req.params;
    const { titre, description, prix, stock, image_url, id_categorie } = req.body;
    const client = getConnection("DSP");

    try {
      Update_product(client, { id_produit, titre, description, prix, stock, image_url, id_categorie }, (err, results) => {
        if (err) {
          client.end();
          return res.status(500).json({ message: "Erreur lors de la modification du produit." });
        }
        client.end();
        res.status(200).json({ message: "Produit modifié avec succès." });
      });
    } catch {
      client.end();
      res.status(500).json({ message: "Erreur lors de la modification du produit." });
    }
  }
);

// Supprimer un produit
router.delete(
  "/delete/:id_produit",
  authenticateToken,
  [param("id_produit").isInt().withMessage("Le champ 'id_produit' doit être un entier.")],
  validateRequest,
  async (req, res) => {
    const { id_produit } = req.params;
    const client = getConnection("DSP");

    try {
      Delete_product(client, id_produit, (err, results) => {
        if (err) {
          client.end();
          return res.status(500).json({ message: "Erreur lors de la suppression du produit." });
        }
        client.end();
        res.status(200).json({ message: "Produit supprimé avec succès." });
      });
    } catch {
      client.end();
      res.status(500).json({ message: "Erreur lors de la suppression du produit." });
    }
  }
);

export default router;