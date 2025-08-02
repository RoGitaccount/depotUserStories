import express from "express";
import { body, param } from "express-validator";
import { getConnection } from "../queries/connect.js";
import validateRequest from "../middlewares/validateRequest.js";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { logActivity } from '../middlewares/logActivity.js';
import { updateLastActivity } from '../middlewares/updateLastActivity.js';

import {
  Insert_category,
  Get_all_categories,
  Get_one_category,
  Update_category,
  Delete_category, 
} from "../queries/category.js";

const router = express.Router();

// Appliquer le middleware sur toutes les routes de ce router
router.use(updateLastActivity);

// Récupérer toutes les catégories
router.get("/",
  logActivity("Affichage des catégories"),
  (req, res) => {
    getConnection((err, client) => {
      if (err) {
        return res.status(500).json({ message: "Erreur de connexion à la base de données." });
      }
      Get_all_categories(client, (err, results) => {
        client.release();
        if (err) {
          console.error("Erreur SQL dans Get_all_category :", err);
          return res.status(500).json({ message: "Erreur lors de la récupération des catégories." });
        }
        res.status(200).json(results);
      });
    });
  }
);

router.post(
  "/add",
  authenticateToken,
  isAdmin,
  logActivity("Ajout d'une catégorie"),
  [
    body("nom_categorie").notEmpty().withMessage("le nom de la catégorie est necessaire"),
    body("description").optional().isString().withMessage("la description doit etre une chaîne de caractère")
  ],
  validateRequest,
  (req, res) => {
    getConnection((err, client) => {
      if (err) {
        return res.status(500).json({ message: "Erreur de connexion à la base de données." });
      }
      const { nom_categorie, description } = req.body;
      Insert_category(client, { nom_categorie, description }, (err, results) => {
        client.release();
        if (err) {
          console.error("Erreur SQL dans Insert_category :", err);
          return res.status(500).json({ message: "Erreur lors de la création de la catégorie." });
        }
        res.status(201).json({ message: "Catégorie ajoutée avec succès." });
      });
    });
  }
);

// Récupérer une seule catégorie
router.get(
  "/:id_categorie",
  logActivity("Affichage d'une catégorie"),
  [param("id_categorie").isInt().withMessage("'id_categorie' doit être un entier.")],
  validateRequest,
  (req, res) => {
    getConnection((err, client) => {
      if (err) {
        return res.status(500).json({ message: "Erreur de connexion à la base de données." });
      }
      const { id_categorie } = req.params;
      Get_one_category(client, parseInt(id_categorie), (err, category) => {
        client.release();
        if (err) {
          console.error("Erreur SQL dans Get_one_category :", err);
          return res.status(500).json({ message: "Erreur lors de la récupération de la catégorie." });
        }
        if (!category) {
          return res.status(404).json({ message: "Catégorie non trouvée." });
        }
        res.status(200).json(category);
      });
    });
  }
);

// Modifier une catégorie (admin)
router.put(
  "/update/:id_categorie",
  authenticateToken,
  logActivity("Modification d'une catégorie"),
  isAdmin,
  [
    param("id_categorie").isInt().withMessage("'id_categorie' doit être un entier."),
    body("nom_categorie").notEmpty().withMessage("Le champ 'nom_categorie' est requis."),
    body("description").optional().isString().withMessage("la description doit etre une chaîne de caractère"),
  ],
  validateRequest,
  (req, res) => {
    getConnection((err, client) => {
      if (err) {
        return res.status(500).json({ message: "Erreur de connexion à la base de données." });
      }
      const { id_categorie } = req.params;
      const { nom_categorie, description } = req.body;
      Update_category(client, { id_categorie: parseInt(id_categorie), nom_categorie, description }, (err, results) => {
        client.release();
        if (err) {
          console.error("Erreur SQL dans Update_category :", err);
          return res.status(500).json({ message: "Erreur lors de la modification de la catégorie." });
        }
        res.status(200).json({ message: "Catégorie modifiée avec succès." });
      });
    });
  }
);

// Supprimer une catégorie (admin)
router.delete(
  "/delete/:id_categorie",
  authenticateToken,
  logActivity("Suppression d'une catégorie"),
  isAdmin,
  [param("id_categorie").isInt().withMessage("'id_categorie' doit être un entier.")],
  validateRequest,
  (req, res) => {
    getConnection((err, client) => {
      if (err) {
        return res.status(500).json({ message: "Erreur de connexion à la base de données." });
      }
      const { id_categorie } = req.params;
      Delete_category(client, parseInt(id_categorie), (err, results) => {
        client.release();
        if (err) {
          console.error("Erreur SQL dans Delete_category :", err);
          return res.status(500).json({ message: "Erreur lors de la suppression de la catégorie." });
        }
        res.status(200).json({ message: "Catégorie supprimée avec succès." });
      });
    });
  }
);

export default router;