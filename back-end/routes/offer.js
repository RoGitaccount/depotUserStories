import express from "express";
import { body, param } from "express-validator";
import { getConnection } from "../queries/connect.js";
import validateRequest from "../middlewares/validateRequest.js";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { logActivity } from "../middlewares/logActivity.js";
import * as PromotionQueries from "../queries/offer.js";
import { updateLastActivity } from '../middlewares/updateLastActivity.js';


const router = express.Router();

// Obtenir toutes les promos
router.get(
  "/",
  authenticateToken,
  updateLastActivity,
  isAdmin,
  logActivity("Recupération de toutes les promotions"),
  (req, res) => {
    getConnection((err, client) => {
      if (err) {
        return res.status(500).json({ message: "Erreur de connexion à la base de données." });
      }
      PromotionQueries.Get_all_offers_admin(client, (err, results) => {
        client.release();
        if (err) {
          console.error("Erreur lors de la récupération des promotions :", err);
          return res.status(500).json({ message: "Erreur lors de la récupération des promotions." });
        }
        res.status(200).json(results);
      });
    });
  }
);

// Vérifie un code promo
router.get(
  "/code/:code_promo",
  [param("code_promo").notEmpty().withMessage("Le champ 'code_promo' est requis.")],
  validateRequest,
  (req, res) => {
    getConnection((err, client) => {
      if (err) {
        return res.status(500).json({ message: "Erreur de connexion à la base de données." });
      }
      const { code_promo } = req.params;
      PromotionQueries.Get_offer_by_code(client, code_promo, (err, promotion) => {
        client.release();
        if (err) return res.status(500).json({ message: "Erreur serveur." });
        if (!promotion) return res.status(404).json({ message: "Code promotionnel invalide ou expiré." });
        res.status(200).json(promotion);
      });
    });
  }
);

// Nouveau endpoint public pour promo par ID
router.get(
  "/public/:id_promotion",
  [param("id_promotion").isInt().withMessage("ID promotion invalide.")],
  validateRequest,
  (req, res) => {
    getConnection((err, client) => {
      if (err) {
        return res.status(500).json({ message: "Erreur de connexion à la base de données." });
      }
      const { id_promotion } = req.params;
      PromotionQueries.Get_offer(client, parseInt(id_promotion), (err, offer) => {
        client.release();
        if (err) return res.status(500).json({ message: "Erreur serveur." });
        if (!offer) return res.status(404).json({ message: "Promotion non trouvée ou expirée." });
        res.status(200).json(offer);
      });
    });
  }
);

// CRUD Admin : Ajouter une promo
router.post(
  "/add",
  authenticateToken,
  updateLastActivity,
  isAdmin,
  logActivity("Ajout d'une promotion"),
  [
    body("code").notEmpty().withMessage("Le champ 'code' est obligatoire."),
    body("montant_reduction").isDecimal().withMessage("Le champ 'montant_reduction' doit être un nombre décimal."),
    body("date_expiration").isISO8601().withMessage("Le champ 'date_expiration' doit être une date valide."),
    body("est_actif").isInt({ min: 0, max: 1 }).withMessage("Le champ 'est_actif' doit être 0 ou 1."),
  ],
  validateRequest,
  (req, res) => {
    getConnection((err, client) => {
      if (err) {
        return res.status(500).json({ message: "Erreur de connexion à la base de données." });
      }
      const { code, montant_reduction, date_expiration, est_actif } = req.body;
      console.log(req.body);
      PromotionQueries.Insert_offer(client, { code, montant_reduction, date_expiration, est_actif }, (err, results) => {
        client.release();
        if (err) {
          return res.status(500).json({ message: "Erreur lors de l'ajout de la promotion." });
        }
        res.status(201).json({ message: "Promotion ajoutée avec succès." });
      });
    });
  }
);

// Otenir une promo par ID
router.get(
  "/:id_promotion",
  authenticateToken,
  updateLastActivity,
  isAdmin,
  [param("id_promotion").isInt().withMessage("ID promotion invalide.")],
  validateRequest,
  (req, res) => {
    getConnection((err, client) => {
      if (err) {
        return res.status(500).json({ message: "Erreur de connexion à la base de données." });
      }
      const { id_promotion } = req.params;
      PromotionQueries.Get_one_offer_admin(client, parseInt(id_promotion), (err, offer) => {
        client.release();
        if (err) return res.status(500).json({ message: "Erreur lors de la récupération de la promotion." });
        if (!offer) return res.status(404).json({ message: "Promotion non trouvée." });
        res.status(200).json(offer);
      });
    });
  }
);

//Modifier une promo 
router.put(
  "/update/:id_promotion",
  authenticateToken,
  updateLastActivity,
  isAdmin,
  logActivity("Modification d'une promotion"),
  [
    param("id_promotion").isInt().withMessage("ID promotion invalide."),
    body("code").notEmpty().withMessage("Le champ 'code' est obligatoire."),
    body("montant_reduction").isDecimal().withMessage("Le champ 'montant_reduction' doit être un nombre décimal."),
    body("date_expiration").isISO8601().withMessage("Le champ 'date_expiration' doit être une date valide."),
    body("est_actif").isInt({ min: 0, max: 1 }).withMessage("Le champ 'est_actif' doit être 0 ou 1."),  ],
  validateRequest,
  (req, res) => {
    getConnection((err, client) => {
      if (err) {
        return res.status(500).json({ message: "Erreur de connexion à la base de données." });
      }
      const { id_promotion } = req.params;
      const { code, montant_reduction, date_expiration, est_actif } = req.body;
      console.log(req.body);
      PromotionQueries.Update_offer(
        client,
        { id_promotion, code, montant_reduction, date_expiration, est_actif },
        (err, results) => {
          client.release();
          if (err) return res.status(500).json({ message: "Erreur lors de la modification de la promotion." });
          res.status(200).json({ message: "Promotion modifiée avec succès." });
        }
      );
    });
  }
);

/* ----------  Supprimer une promo ---------- */
router.delete(
  "/delete/:id_promotion",
  authenticateToken,
  updateLastActivity,
  isAdmin,
  logActivity("Suppression d'une promotion"),
  [param("id_promotion").isInt().withMessage("ID promotion invalide.")],
  validateRequest,
  (req, res) => {
    getConnection((err, client) => {
      if (err) {
        return res.status(500).json({ message: "Erreur de connexion à la base de données." });
      }
      const { id_promotion } = req.params;
      PromotionQueries.Delete_offer(client, parseInt(id_promotion), (err, results) => {
        client.release();
        if (err) return res.status(500).json({ message: "Erreur lors de la suppression." });
        res.status(200).json({ message: "Promotion supprimée avec succès." });
      });
    });
  }
);

/* ----------  Activer/Désactiver une promo ---------- */
router.patch(
  "/toggle/:id_promotion",
  authenticateToken,
  updateLastActivity,
  isAdmin,
  logActivity("Activation/Désactivation d'une promotion"),
  [param("id_promotion").isInt().withMessage("ID promotion invalide.")],
  validateRequest,
  (req, res) => {
    getConnection((err, client) => {
      if (err) {
        return res.status(500).json({ message: "Erreur de connexion à la base de données." });
      }
      const { id_promotion } = req.params;
      PromotionQueries.Toggle_offer(client, parseInt(id_promotion), (err, results) => {
        client.release();
        if (err) return res.status(500).json({ message: "Erreur lors de l'activation/désactivation." });
        res.status(200).json({ message: "Statut de la promotion mis à jour." });
      });
    });
  }
);

// Vérifie si l'utilisateur a déjà utilisé un code promo
router.get(
  "/verify/:code_promo",
  authenticateToken,
  updateLastActivity,
  [param("code_promo").notEmpty().withMessage("Code promo requis.")],
  validateRequest,
  (req, res) => {
    getConnection((err, client) => {
      if (err) {
        return res.status(500).json({ error: "Erreur de connexion à la base de données" });
      }
      const { code_promo } = req.params;
      const user_id = req.user.id;

      // 1. D'abord récupérer l'ID de la promotion à partir du code
      PromotionQueries.Get_offer_by_code(client, code_promo, (err, promotion) => {
        if (err) {
          client.release();
          return res.status(500).json({ error: "Erreur serveur" });
        }
        if (!promotion) {
          client.release();
          return res.status(404).json({ error: "Code promo invalide ou expiré" });
        }

        // 2. Ensuite vérifier si l'utilisateur l'a déjà utilisé
        PromotionQueries.Has_user_used_offer(client, user_id, promotion.id_promotion, (err, hasUsed) => {
          client.release();
          if (err) {
            return res.status(500).json({ error: "Erreur serveur" });
          }
          if (hasUsed) {
            return res.status(400).json({ error: "Vous avez déjà utilisé ce code promo" });
          }
          
          // 3. Code valide et non utilisé
          res.json({ 
            valid: true,
            promotion: promotion
          });
        });
      });
    });
  }
);

export default router;