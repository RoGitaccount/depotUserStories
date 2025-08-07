import express from 'express';
import { Get_cart, Remove_from_cart, Clear_cart } from '../queries/cart.js';
import { getConnection } from "../queries/connect.js";
import { param } from 'express-validator';

import validateRequest from "../middlewares/validateRequest.js";
import { authenticateToken } from '../middlewares/authenticateToken.js'; 
import { logActivity } from '../middlewares/logActivity.js';
import { updateLastActivity } from '../middlewares/updateLastActivity.js';


const router = express.Router();

// Appliquer le middleware sur toutes les routes de ce router
router.use(authenticateToken);
router.use(updateLastActivity);

// afficher le panier d'un utilisateur
router.get('/',
  logActivity("Affichage du panier"),
  (req, res) => {
    getConnection((err, client) => {
      if (err) {
        return res.status(500).json({ error: "Erreur de connexion à la base de données" });
      }
      const id_user = req.user.id;
      Get_cart(client, id_user, (err, results) => {
        client.release();
        if (err) {
          console.error("Erreur SQL Get_cart:", err);
          return res.status(500).json({ error: 'Erreur lors de la récupération du panier' });
        }
        res.json(results);
      });
    });
  }
);

router.delete(
  '/delete/:id_produit',
  [
    param("id_produit").isInt().withMessage("Le champ 'id_produit' doit être un entier.")
  ],
  validateRequest,
  logActivity("Suppression d’un article du panier"),
  (req, res) => {
    getConnection((err, client) => {
      if (err) {
        return res.status(500).json({ error: "Erreur de connexion à la base de données" });
      }
      const id_user = req.user.id;
      const id_produit = req.params.id_produit;
      Remove_from_cart(client, { id_user, id_produit }, (err, results) => {
        client.release();
        if (err) {
          return res.status(500).json({ error: 'Erreur lors de la suppression de l\'article du panier' });
        }
        res.status(200).json({ message: 'Produit supprimé du panier avec succès' });
      });
    });
  }
);

// vider le panier
router.delete(
  '/clear',
  logActivity("Vidage du panier"),
  (req, res) => {
    getConnection((err, client) => {
      if (err) {
        return res.status(500).json({ message: "Erreur de connexion à la base de données" });
      }
      const id_user = req.user.id;
      Clear_cart(client, id_user, (err, results) => {
        client.release();
        if (err) {
          return res.status(500).json({ message: "Erreur lors de la suppression du panier" });
        }
        res.status(200).json({ message: "Panier vidé avec succès" });
      });
    });
  }
);

export default router;