import express from 'express';
import { getConnection } from "../queries/connect.js";
import validateRequest from "../middlewares/validateRequest.js";
import { param } from 'express-validator';
import { Get_cart, Remove_from_cart, Clear_cart } from '../queries/cart.js';
import { Add_to_wishlist, Remove_from_wishlist, Clear_wishlist, Get_user_wishlist } from '../queries/wishlist.js';
import { Add_to_cart, Add_all_to_cart } from '../queries/cart.js';
import { authenticateToken } from '../middlewares/authenticateToken.js';
import { logActivity } from '../middlewares/logActivity.js';
import { updateLastActivity } from '../middlewares/updateLastActivity.js';

const router = express.Router();

// afficher la wishlist d'un utilisateur
router.get(
  '/',
  authenticateToken,
  updateLastActivity,
  logActivity("Récupération de la wishlist"),
  (req, res) => {
    getConnection((err, client) => {
      if (err) return res.status(500).json({ error: 'Erreur de connexion à la base de données' });
      const id_user = req.user.id;
      Get_user_wishlist(client, id_user, (err, results) => {
        client.release();
        if (err) {
          return res.status(500).json({ error: 'Erreur lors de la récupération de la wishlist' });
        }
        res.json(results);
      });
    });
  }
);

// mettre un produit de la wishlist dans le panier (à mettre dans cart.js)
router.post(
  '/add_to_cart/:id_produit',
  authenticateToken,
  updateLastActivity,
  logActivity("Ajout d'un produit de la wishlist au panier"),
  [
    param("id_produit").isInt().withMessage("Le champ 'id_produit' doit être un entier.")
  ],
  validateRequest,
  (req, res) => {
    getConnection((err, client) => {
      if (err) return res.status(500).json({ error: 'Erreur de connexion à la base de données' });
      const id_user = req.user.id;
      const id_produit = req.params.id_produit;
      Add_to_cart(client, { id_user, id_produit }, (err, results) => {
        client.release();
        if (err) {
          return res.status(500).json({ error: 'Erreur lors de l\'ajout de l\'article au panier' });
        }
        res.status(200).json({ message: 'Produit ajouté au panier avec succès' });
      });
    });
  }
);

// Ajouter tous les produits de notre wishlist au panier
router.post(
  '/add_all_to_cart',
  authenticateToken,
  updateLastActivity,
  logActivity("Ajout de toute la wishlist au panier"),
  (req, res) => {
    getConnection((err, client) => {
      if (err) return res.status(500).json({ error: 'Erreur de connexion à la base de données' });
      const id_user = req.user.id;
      Add_all_to_cart(client, { id_user }, (err, results) => {
        client.release();
        if (err) {
          return res.status(500).json({ error: 'Erreur lors de l\'ajout de tous les articles au panier' });
        }
        res.status(200).json({ message: 'Tous les produits ajoutés au panier avec succès' });
      });
    });
  }
);

// ajouter un produit à la wishlist
router.post(
  '/add/:id_produit',
  authenticateToken,
  updateLastActivity,
  logActivity("Ajout d'un produit à la wishlist"),
  [
    param("id_produit").isInt().withMessage("Le champ 'id_produit' doit être un entier.")
  ],
  validateRequest,
  (req, res) => {
    getConnection((err, client) => {
      if (err) return res.status(500).json({ error: 'Erreur de connexion à la base de données' });
      const id_user = req.user.id;
      const id_produit = req.params.id_produit;
      Add_to_wishlist(client, { id_user, id_produit }, (err, results) => {
        client.release();
        if (err) {
          return res.status(500).json({ error: 'Erreur lors de l\'ajout de l\'article à la wishlist' });
        }
        res.status(200).json({ message: 'Produit ajouté à la wishlist avec succès' });
      });
    });
  }
);

// supprimer un produit de la wishlist
router.delete(
  '/delete/:id_produit',
  authenticateToken,
  updateLastActivity,
  logActivity("Suppression d'un produit de la wishlist"),
  [
    param("id_produit").isInt().withMessage("Le champ 'id_produit' doit être un entier.")
  ],
  validateRequest,
  (req, res) => {
    getConnection((err, client) => {
      if (err) return res.status(500).json({ error: 'Erreur de connexion à la base de données' });
      const id_user = req.user.id;
      const id_produit = req.params.id_produit;
      Remove_from_wishlist(client, { id_user, id_produit }, (err, results) => {
        client.release();
        if (err) {
          return res.status(500).json({ error: 'Erreur lors de la suppression de l\'article de la wishlist' });
        }
        res.status(200).json({ message: 'Produit supprimé de la wishlist avec succès' });
      });
    });
  }
);

// vider la wishlist
router.delete(
  '/clear',
  authenticateToken,
  updateLastActivity,
  logActivity("Suppression de toute la wishlist"),
  (req, res) => {
    getConnection((err, client) => {
      if (err) return res.status(500).json({ error: 'Erreur de connexion à la base de données' });
      const id_user = req.user.id;
      Clear_wishlist(client, id_user, (err, results) => {
        client.release();
        if (err) {
          return res.status(500).json({ error: 'Erreur lors de la suppression de la wishlist' });
        }
        res.status(200).json({ message: 'Wishlist supprimée avec succès' });
      });
    });
  }
);

export default router;