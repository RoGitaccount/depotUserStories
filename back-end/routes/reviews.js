// export default router;

import express from "express";
import { body, param } from "express-validator";
import { getConnection } from "../queries/connect.js";
import validateRequest from "../middlewares/validateRequest.js";
import { Insert_review, Get_reviews_by_product, Update_review, Delete_review } from "../queries/Review.js";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import { Get_review_author } from "../queries/Review.js";
import { logActivity } from '../middlewares/logActivity.js';
import { updateLastActivity } from '../middlewares/updateLastActivity.js';

const router = express.Router();

// Ajouter un avis
router.post(
  "/add-review",
  authenticateToken,
  updateLastActivity,
  logActivity("Ajout d'un avis"),
  [
    body("id_produit").isInt().withMessage("Le champ 'id_produit' doit être un entier."),
    body("note").isInt({ min: 1, max: 5 }).withMessage("Le champ 'note' doit être un entier entre 1 et 5."),
    body("commentaire").notEmpty().withMessage("Le champ 'commentaire' est obligatoire."),
  ],
  validateRequest,
  (req, res) => {
    const { id_produit, note, commentaire } = req.body;
    const id_user = req.user.id;
    getConnection((err, client) => {
      if (err) return res.status(500).json({ message: "Erreur de connexion à la base de données." });
      Insert_review(client, { id_user, id_produit, note, commentaire }, (err, results) => {
        client.release();
        if (err) {
          return res.status(500).json({ message: "Erreur lors de l'ajout de l'avis." });
        }
        res.status(201).json({ message: "Avis ajouté avec succès." });
      });
    });
  }
);

// Récupérer les avis pour un produit
router.get(
  "/:id_produit",
  logActivity("Récupération des avis d'un produit"),
  [param("id_produit").isInt().withMessage("Le champ 'id_produit' doit être un entier.")],
  validateRequest,
  (req, res) => {
    const { id_produit } = req.params;
    getConnection((err, client) => {
      if (err) return res.status(500).json({ message: "Erreur de connexion à la base de données." });
      Get_reviews_by_product(client, id_produit, (err, results) => {
        client.release();
        if (err) {
          return res.status(500).json({ message: "Erreur lors de la récupération des avis." });
        }
        res.status(200).json(results);
      });
    });
  }
);

// Modifier un avis
router.put(
  "/update-review/:id_avis",
  authenticateToken,
  updateLastActivity,
  logActivity("Modification d'un avis"),
  [
    param("id_avis").isInt().withMessage("Le champ 'id_avis' doit être un entier."),
    body("note").isInt({ min: 1, max: 5 }).withMessage("Le champ 'note' doit être un entier entre 1 et 5."),
    body("commentaire").notEmpty().withMessage("Le champ 'commentaire' est obligatoire."),
  ],
  validateRequest,
  (req, res) => {
    const { id_avis } = req.params;
    const { note, commentaire } = req.body;
    getConnection((err, client) => {
      if (err) return res.status(500).json({ message: "Erreur de connexion à la base de données." });
      Get_review_author(client, id_avis, (err, results) => {
        if (err || results.length === 0) {
          client.release();
          return res.status(404).json({ message: "Avis introuvable." });
        }
        const reviewOwnerId = results[0].id_user;
        const userId = req.user.id;
        const isAdmin = req.user.role === "admin";
        if (userId !== reviewOwnerId && !isAdmin) {
          client.release();
          return res.status(403).json({ message: "Vous n'êtes pas autorisé à modifier cet avis." });
        }
        Update_review(client, { id_avis, note, commentaire }, (err, results) => {
          client.release();
          if (err) {
            return res.status(500).json({ message: "Erreur lors de la modification de l'avis." });
          }
          res.status(200).json({ message: "Avis modifié avec succès." });
        });
      });
    });
  }
);

// Supprimer un avis
router.delete(
  "/delete-review/:id_avis",
  authenticateToken,
  updateLastActivity,
  logActivity("Suppression d'un avis"),
  [param("id_avis").isInt().withMessage("Le champ 'id_avis' doit être un entier.")],
  validateRequest,
  (req, res) => {
    const { id_avis } = req.params;
    getConnection((err, client) => {
      if (err) return res.status(500).json({ message: "Erreur de connexion à la base de données." });
      Get_review_author(client, id_avis, (err, results) => {
        if (err || results.length === 0) {
          client.release();
          return res.status(404).json({ message: "Avis introuvable." });
        }
        const reviewOwnerId = results[0].id_user;
        const userId = req.user.id;
        const isAdmin = req.user.role === "admin";
        if (userId !== reviewOwnerId && !isAdmin) {
          client.release();
          return res.status(403).json({ message: "Vous n'êtes pas autorisé à supprimer cet avis." });
        }
        Delete_review(client, id_avis, (err, results) => {
          client.release();
          if (err) {
            return res.status(500).json({ message: "Erreur lors de la suppression de l'avis." });
          }
          res.status(200).json({ message: "Avis supprimé avec succès." });
        });
      });
    });
  }
);

export default router;