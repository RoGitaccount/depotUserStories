import express from 'express';
import { Get_cart,Remove_from_cart,Clear_cart } from '../queries/cart.js';
import { getConnection } from "../queries/connect.js";
import validateRequest from "../middlewares/validateRequest.js";
import { param } from 'express-validator';

const router = express.Router();

// afficher le panier d'un utilisateur
router.get('/', (req, res) => {
  const client = getConnection();
  // ID utilisateur en dur pour les tests
  const id_user = 1;

  Get_cart(client, id_user, (err, results) => {
    client.end();
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la récupération du panier' });
    }
    res.json(results);
  });
});

// supprimer un produit du panier
router.delete(
  '/delete/:id_produit',
  [
    param("id_produit").isInt().withMessage("Le champ 'id_produit' doit être un entier.")
  ],
  validateRequest,
  
  async (req, res) => {
    const client = getConnection();
    const id_user = 1; // ID utilisateur en dur pour les tests
    const id_produit = req.params.id_produit;
    
    try {
      Remove_from_cart(client,{ id_user, id_produit }, (err, results) => {
        if (err) {
          client.end();
          return res.status(500).json({ error: 'Erreur lors de la suppression de l\'article du panier' });
        }
        client.end();
        res.status(200).json({ message: 'Produit supprimé du panier avec succès' });
      });
    } catch {
      client.end();
      res.status(500).json({ error: 'Erreur lors de la suppression de l\'article du panier' });
    }
  }
);

// vider le panier (remplacer id_user=1 par l'id de l'utilisateur connecté avec authenticateToken)
router.delete(
  '/clear',
  async (req, res) => {
    const client = getConnection();
    const id_user = 1; // ID utilisateur en dur pour les tests

    try {
      Clear_cart(client, id_user, (err, results) => {
        if (err) {
          client.end();
          return res.status(500).json({ message: "Erreur lors de la suppresion du panier" });
          console.error(err);
        }
        client.end();
        res.status(200).json({ message: "Panier vidée avec succès" });
      });
    } catch {
      client.end();
      res.status(500).json({ message: "Erreur lors de la suppresion du panier" });
    }
  }
);

export default router;