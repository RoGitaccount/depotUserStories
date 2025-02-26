import express from "express";
import { body, param } from "express-validator";
import { getConnection } from "../queries/connect.js";
import validateRequest from "../middlewares/validateRequest.js";
import { Insert_review, Get_reviews_by_product, Update_review, Delete_review } from "../queries/Review.js";
import { authenticateToken } from "../middlewares/authenticateToken.js";

const router = express.Router();

// Ajouter un avis
router.post(
  "/add-review",
  [
    body("id_user").isInt().withMessage("Le champ 'id_user' doit être un entier."),
    body("id_produit").isInt().withMessage("Le champ 'id_produit' doit être un entier."),
    body("note").isInt({ min: 1, max: 5 }).withMessage("Le champ 'note' doit être un entier entre 1 et 5."),
    body("commentaire").notEmpty().withMessage("Le champ 'commentaire' est obligatoire."),
  ],
  validateRequest,
  async (req, res) => {
    const { id_user, id_produit, note, commentaire } = req.body;
    const client = getConnection("DSP");

    try {
      Insert_review(client, { id_user, id_produit, note, commentaire }, (err, results) => {
        if (err) {
          client.end();
          return res.status(500).json({ message: "Erreur lors de l'ajout de l'avis." });
        }
        client.end();
        res.status(201).json({ message: "Avis ajouté avec succès." });
      });
    } catch {
      client.end();
      res.status(500).json({ message: "Erreur lors de l'ajout de l'avis." });
    }
  }
);

// Récupérer les avis pour un produit
router.get("/:id_produit", async (req, res) => {
  const { id_produit } = req.params;
  const client = getConnection("DSP");

  try {
    Get_reviews_by_product(client, id_produit, (err, results) => {
      if (err) {
        client.end();
        return res.status(500).json({ message: "Erreur lors de la récupération des avis." });
      }
      client.end();
      res.status(200).json(results);
    });
  } catch {
    client.end();
    res.status(500).json({ message: "Erreur lors de la récupération des avis." });
  }
});

// Modifier un avis
router.put(
  "/update-review/:id_avis",
  authenticateToken,
  [
    param("id_avis").isInt().withMessage("Le champ 'id_avis' doit être un entier."),
    body("note").isInt({ min: 1, max: 5 }).withMessage("Le champ 'note' doit être un entier entre 1 et 5."),
    body("commentaire").notEmpty().withMessage("Le champ 'commentaire' est obligatoire."),
  ],
  validateRequest,
  async (req, res) => {
    const { id_avis } = req.params;
    const { note, commentaire } = req.body;
    const client = getConnection("DSP");

    try {
      Update_review(client, { id_avis, note, commentaire }, (err, results) => {
        if (err) {
          client.end();
          return res.status(500).json({ message: "Erreur lors de la modification de l'avis." });
        }
        client.end();
        res.status(200).json({ message: "Avis modifié avec succès." });
      });
    } catch {
      client.end();
      res.status(500).json({ message: "Erreur lors de la modification de l'avis." });
    }
  }
);

// Supprimer un avis
router.delete(
  "/delete-review/:id_avis",
  authenticateToken,
  [param("id_avis").isInt().withMessage("Le champ 'id_avis' doit être un entier.")],
  validateRequest,
  async (req, res) => {
    const { id_avis } = req.params;
    const client = getConnection("DSP");

    try {
      Delete_review(client, id_avis, (err, results) => {
        if (err) {
          client.end();
          return res.status(500).json({ message: "Erreur lors de la suppression de l'avis." });
        }
        client.end();
        res.status(200).json({ message: "Avis supprimé avec succès." });
      });
    } catch {
      client.end();
      res.status(500).json({ message: "Erreur lors de la suppression de l'avis." });
    }
  }
);

export default router;
