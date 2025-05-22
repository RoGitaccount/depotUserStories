import express from "express";
import { body, param } from "express-validator";
import { getConnection } from "../queries/connect.js";
import validateRequest from "../middlewares/validateRequest.js";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import * as PromotionQueries from "../queries/offer.js";

const router = express.Router();

/* ----------  Obtenir toutes les promos ---------- */
router.get(
  "/",
  // authenticateToken,
  // isAdmin,
  async (req, res) => {
    const client = getConnection();

    try {
      PromotionQueries.Get_all_offers_admin(client, (err, results) => {
        if (err) {
          console.error("Erreur lors de la récupération des promotions :", err);
          return res.status(500).json({ message: "Erreur lors de la récupération des promotions." });
        }
        res.status(200).json(results);
      });
    } catch (error) {
      console.error("Erreur serveur :", error);
      res.status(500).json({ message: "Erreur serveur." });
    } finally {
      // Fermez la connexion dans le bloc `finally`
      client.end((endErr) => {
        if (endErr) console.error("Erreur lors de la fermeture de la connexion :", endErr);
      });
    }
  }
);

//Vérifie un code promo
router.get(
  "/code/:code_promo",
  [param("code_promo").notEmpty().withMessage("Le champ 'code_promo' est requis.")],
  validateRequest,
  async (req, res) => {
    const client = getConnection();
    const { code_promo } = req.params;

    try {
      PromotionQueries.Get_offer_by_code(client, code_promo, (err, promotion) => {
        client.end();
        if (err) return res.status(500).json({ message: "Erreur serveur." });
        if (!promotion) return res.status(404).json({ message: "Code promotionnel invalide ou expiré." });
        res.status(200).json(promotion);
      });
    } catch {
      client.end();
      res.status(500).json({ message: "Erreur serveur." });
    }
  }
);

// Nouveau endpoint public pour promo par ID
router.get(
  "/public/:id_promotion",
  [param("id_promotion").isInt().withMessage("ID promotion invalide.")],
  validateRequest,
  async (req, res) => {
    const client = getConnection();
    const { id_promotion } = req.params;

    try {
      PromotionQueries.Get_offer(client, parseInt(id_promotion), (err, offer) => {
        client.end();
        if (err) return res.status(500).json({ message: "Erreur serveur." });
        if (!offer) return res.status(404).json({ message: "Promotion non trouvée ou expirée." });
        res.status(200).json(offer);
      });
    } catch {
      client.end();
      res.status(500).json({ message: "Erreur serveur." });
    }
  }
);

//CRUD Admin : Ajouter une promo
router.post(
  "/add",
  authenticateToken,
  isAdmin,
  [
    body("code").notEmpty().withMessage("Le champ 'code' est obligatoire."),
    body("montant_reduction").isDecimal().withMessage("Le champ 'montant_reduction' doit être un nombre décimal."),
    body("date_expiration").isISO8601().withMessage("Le champ 'date_expiration' doit être une date valide."),
    body("est_actif").isBoolean().withMessage("Le champ 'est_actif' doit être un booléen."),
  ],
  validateRequest,
  async (req, res) => {
    const client = getConnection();
    const { code, montant_reduction, date_expiration, est_actif } = req.body;

    try {
      PromotionQueries.Insert_offer(client, { code, montant_reduction, date_expiration, est_actif }, (err, results) => {
        client.end();
        if (err) {
          return res.status(500).json({ message: "Erreur lors de l'ajout de la promotion." });
        }
        res.status(201).json({ message: "Promotion ajoutée avec succès." });
      });
    } catch {
      client.end();
      res.status(500).json({ message: "Erreur serveur." });
    }
  }
);

/* ---------- Obtenir une promo par ID ---------- */
router.get(
  "/:id_promotion",
  authenticateToken,
  isAdmin,
  [param("id_promotion").isInt().withMessage("ID promotion invalide.")],
  validateRequest,
  async (req, res) => {
    const client = getConnection();
    const { id_promotion } = req.params;

    try {
      PromotionQueries.Get_one_offer_admin(client, parseInt(id_promotion), (err, offer) => {
        client.end();
        if (err) return res.status(500).json({ message: "Erreur lors de la récupération de la promotion." });
        if (!offer) return res.status(404).json({ message: "Promotion non trouvée." });
        res.status(200).json(offer);
      });
    } catch {
      client.end();
      res.status(500).json({ message: "Erreur serveur." });
    }
  }
);

/* ----------  Modifier une promo ---------- */
router.put(
  "/update/:id_promotion",
  authenticateToken,
  isAdmin,
  [
    param("id_promotion").isInt().withMessage("ID promotion invalide."),
    body("code").notEmpty().withMessage("Le champ 'code' est obligatoire."),
    body("montant_reduction").isDecimal().withMessage("Le champ 'montant_reduction' doit être un nombre décimal."),
    body("date_expiration").isISO8601().withMessage("Le champ 'date_expiration' doit être une date valide."),
    body("est_actif").isBoolean().withMessage("Le champ 'est_actif' doit être un booléen."),
  ],
  validateRequest,
  async (req, res) => {
    const client = getConnection();
    const { id_promotion } = req.params;
    const { code, montant_reduction, date_expiration, est_actif } = req.body;

    try {
      PromotionQueries.Update_offer(
        client,
        { id_promotion, code, montant_reduction, date_expiration, est_actif },
        (err, results) => {
          client.end();
          if (err) return res.status(500).json({ message: "Erreur lors de la modification de la promotion." });
          res.status(200).json({ message: "Promotion modifiée avec succès." });
        }
      );
    } catch {
      client.end();
      res.status(500).json({ message: "Erreur serveur." });
    }
  }
);

/* ----------  Supprimer une promo ---------- */
router.delete(
  "/delete/:id_promotion",
  authenticateToken,
  isAdmin,
  [param("id_promotion").isInt().withMessage("ID promotion invalide.")],
  validateRequest,
  async (req, res) => {
    const client = getConnection();
    const { id_promotion } = req.params;

    try {
      PromotionQueries.Delete_offer(client, parseInt(id_promotion), (err, results) => {
        client.end();
        if (err) return res.status(500).json({ message: "Erreur lors de la suppression." });
        res.status(200).json({ message: "Promotion supprimée avec succès." });
      });
    } catch {
      client.end();
      res.status(500).json({ message: "Erreur serveur." });
    }
  }
);

/* ----------  Activer/Désactiver une promo ---------- */
router.patch(
  "/toggle/:id_promotion",
  authenticateToken,
  isAdmin,
  [param("id_promotion").isInt().withMessage("ID promotion invalide.")],
  validateRequest,
  async (req, res) => {
    const client = getConnection();
    const { id_promotion } = req.params;

    try {
      PromotionQueries.Toggle_offer(client, parseInt(id_promotion), (err, results) => {
        client.end();
        if (err) return res.status(500).json({ message: "Erreur lors de l'activation/désactivation." });
        res.status(200).json({ message: "Statut de la promotion mis à jour." });
      });
    } catch {
      client.end();
      res.status(500).json({ message: "Erreur serveur." });
    }
  }
);

// Vérifie si l'utilisateur a déjà utilisé un code promo
router.get(
  "/verify/:code_promo",
  // authenticateToken, // il faut savoir qui est connecté !
  [param("code_promo").notEmpty().withMessage("Code promo requis.")],
  validateRequest,
  async (req, res) => {
    const client = getConnection();
    const { code_promo } = req.params;
    const user_id = 1;
    // req.user.id; // grâce à authenticateToken

    
    try {
      // 1. D'abord récupérer l'ID de la promotion à partir du code
      PromotionQueries.Get_offer_by_code(client, code_promo, (err, promotion) => {
        if (err) {
          client.end();
          return res.status(500).json({ error: "Erreur serveur" });
        }
        if (!promotion) {
          client.end();
          return res.status(404).json({ error: "Code promo invalide ou expiré" });
        }

        // 2. Ensuite vérifier si l'utilisateur l'a déjà utilisé
        PromotionQueries.Has_user_used_offer(client, user_id, promotion.id_promotion, (err, hasUsed) => {
          client.end();
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
    } catch (error) {
      console.error('Erreur:', error);
      client.end();
      res.status(500).json({ error: "Erreur serveur" });
    }
  }
);

export default router;
