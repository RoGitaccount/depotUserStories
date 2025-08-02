import express from "express";
import { param } from "express-validator";
import { getConnection } from "../queries/connect.js";
import {
  show_sales_and_avg_basket,
  show_best_product_by_category,
  show_most_popular_categories,
} from "../queries/stats.js";

import validateRequest from "../middlewares/validateRequest.js";
import { logActivity } from "../middlewares/logActivity.js";
import { updateLastActivity } from "../middlewares/updateLastActivity.js";
import { authenticateToken } from "../middlewares/authenticateToken.js";

const router = express.Router();

// Récupère le nombre de commandes, le total des ventes et le panier moyen par jour
router.get(
  "/sales",
  authenticateToken,
  logActivity("Récupération des statistiques de ventes"),
  updateLastActivity,
  (req, res) => {
    const period = req.query.period || "day"; // Par défaut 'day' si rien n'est spécifié

    getConnection((err, client) => {
      if (err)
        return res.status(500).json({
          message: "Erreur de connexion à la base de données.",
        });

      // Appel de la fonction avec la période demandée
      show_sales_and_avg_basket(client, period, (err, results) => {
        client.release();
        if (err)
          return res.status(500).json({
            message: "Erreur lors de la récupération des statistiques.",
          });
        return res.status(200).json({ period, data: results });
      });
    });
  }
);


// Récupère les 10 produits les plus vendus pour une catégorie donnée

router.get(
  "/best-products/:id_categorie",
  authenticateToken,
  logActivity("Récupération des meilleurs produits par catégorie"),
  [
    param("id_categorie")
      .isInt()
      .withMessage("Le paramètre 'id_categorie' est obligatoire et doit être un entier."),
  ],
  validateRequest,
  updateLastActivity,
  (req, res) => {
    const { id_categorie } = req.params;

    getConnection((err, client) => {
      if (err)
        return res.status(500).json({
          message: "Erreur de connexion à la base de données.",
        });

      show_best_product_by_category(client, id_categorie, (err, results) => {
        client.release();
        if (err)
          return res.status(500).json({
            message: "Erreur lors de la récupération des produits.",
          });
        return res.status(200).json({ data: results });
      });
    });
  }
);


// Récupère les 10 catégories les plus populaires
router.get(
  "/popular-categories",
  authenticateToken,
  logActivity("Récupération des catégories les plus populaires"),
  updateLastActivity,
  (req, res) => {
    getConnection((err, client) => {
      if (err)
        return res.status(500).json({
          message: "Erreur de connexion à la base de données.",
        });

      show_most_popular_categories(client, (err, results) => {
        client.release();
        if (err)
          return res.status(500).json({
            message: "Erreur lors de la récupération des catégories populaires.",
          });
        return res.status(200).json({ data: results });
      });
    });
  }
);

export default router;
