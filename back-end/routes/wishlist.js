import express from 'express';
import { getConnection } from "../queries/connect.js";
import validateRequest from "../middlewares/validateRequest.js";
import { param } from 'express-validator';
import { Get_cart,Remove_from_cart,Clear_cart } from '../queries/cart.js';
import {Add_to_wishlist,Remove_from_wishlist,Clear_wishlist,Get_user_wishlist} from '../queries/wishlist.js';
import {Add_to_cart,Add_all_to_cart} from '../queries/cart.js';

const router = express.Router();

// afficher la wishlist d'un utilisateur
router.get('/', async (req, res) => {
  const client = getConnection();
  const id_user = 1; // ID utilisateur en dur pour les tests

  Get_user_wishlist(client, id_user, (err, results) => {
    client.end();
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la récupération de la wishlist' });
    }
    res.json(results);
  });
});

// mettre un produit de la wishlist dans le panier
router.post(
  '/add_to_cart/:id_produit',
  [
    param("id_produit").isInt().withMessage("Le champ 'id_produit' doit être un entier.")
  ],
  validateRequest,
  
  async (req, res) => {
    const client = getConnection();
    const id_user = 1; // ID utilisateur en dur pour les tests
    const id_produit = req.params.id_produit;
    
    try {
      Add_to_cart(client,{ id_user, id_produit }, (err, results) => {
        if (err) {
          client.end();
          return res.status(500).json({ error: 'Erreur lors de l\'ajout de l\'article au panier' });
        }
        client.end();
        res.status(200).json({ message: 'Produit ajouté au panier avec succès' });
      });
    } catch {
      client.end();
      res.status(500).json({ error: 'Erreur lors de l\'ajout de l\'article au panier' });
    }
  }
);

// Ajouter tous les produits de notre wishlist au panier
router.post(
  '/add_all_to_cart',
  async (req, res) => {
    const client = getConnection();
    const id_user = 1; // ID utilisateur en dur pour les tests

    try {
      Add_all_to_cart(client, { id_user }, (err, results) => {
        if (err) {
          client.end();
          return res.status(500).json({ error: 'Erreur lors de l\'ajout de tous les articles au panier' });
        }
        client.end();
        res.status(200).json({ message: 'Tous les produits ajoutés au panier avec succès' });
      });
    } catch {
      client.end();
      res.status(500).json({ error: 'Erreur lors de l\'ajout de tous les articles au panier' });
    }
  }
);

// ajouter un produit à la wishlist
router.post(
  '/add/:id_produit',
  [
    param("id_produit").isInt().withMessage("Le champ 'id_produit' doit être un entier.")
  ],
  validateRequest,
  
  async (req, res) => {
    const client = getConnection();
    const id_user = 1; // ID utilisateur en dur pour les tests
    const id_produit = req.params.id_produit;
    
    try {
      Add_to_wishlist(client,{ id_user, id_produit }, (err, results) => {
        if (err) {
          client.end();
          return res.status(500).json({ error: 'Erreur lors de l\'ajout de l\'article à la wishlist' });
        }
        client.end();
        res.status(200).json({ message: 'Produit ajouté à la wishlist avec succès' });
      });
    } catch {
      client.end();
      res.status(500).json({ error: 'Erreur lors de l\'ajout de l\'article à la wishlist' });
    }
  }
);

// supprimer un produit de la wishlist
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
      Remove_from_wishlist(client,{ id_user, id_produit }, (err, results) => {
        if (err) {
          client.end();
          return res.status(500).json({ error: 'Erreur lors de la suppression de l\'article de la wishlist' });
        }
        client.end();
        res.status(200).json({ message: 'Produit supprimé de la wishlist avec succès' });
      });
    } catch {
      client.end();
      res.status(500).json({ error: 'Erreur lors de la suppression de l\'article de la wishlist' });
    }
  }
);

// vider la wishlist (remplacer id_user=1 par l'id de l'utilisateur connecté avec authenticateToken)
router.delete(
  '/clear',
  async (req, res) => {
    const client = getConnection();
    const id_user = 1; // ID utilisateur en dur pour les tests

    try {
      Clear_wishlist(client, id_user, (err, results) => {
        if (err) {
          client.end();
          return res.status(500).json({ error: 'Erreur lors de la suppression de la wishlist' });
        }
        client.end();
        res.status(200).json({ message: 'Wishlist supprimée avec succès' });
      });
    } catch {
      client.end();
      res.status(500).json({ error: 'Erreur lors de la suppression de la wishlist' });
    }
  }
);

export default router;