import express from "express";
import { get_user_order_history } from "../queries/order.js";
import { GetPersonalUserInfo } from "../queries/User.js";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import { getConnection } from "../queries/connect.js";

const router = express.Router();

// Récupére l'historique des commandes de l'utilisateur connecté (avec filtres optionnels)
router.get("/orders-history", authenticateToken, (req, res) => {
  const id_user = req.user.id;
  const filter_date = req.query.filter_date || "all";
  const annee_val = req.query.annee_val || null;

  getConnection((err, client) => {
    if (err) return res.status(500).json({ message: "Erreur de connexion à la base de données." });
    get_user_order_history(client, id_user, filter_date, annee_val, (err, results) => {
      client.release();
      if (err) return res.status(500).json({ message: "Erreur lors de la récupération de l'historique." });
      res.status(200).json(results);
    });
  });
});

// Récupére les infos de base de l'utilisateur connecté
router.get("/info", authenticateToken, (req, res) => {
  const id_user = req.user.id;
  getConnection((err, client) => {
    if (err) return res.status(500).json({ message: "Erreur de connexion à la base de données." });
    GetPersonalUserInfo(client, id_user, (err, result) => {
      client.release();
      if (err) return res.status(500).json({ message: "Erreur lors de la récupération des informations utilisateur." });
      if (!result) return res.status(404).json({ message: "Utilisateur introuvable." });
      res.status(200).json(result);
    });
  });
});

// Route pour récupérer les années distinctes des commandes de l'utilisateur
router.get("/orders-years", authenticateToken, (req, res) => {
  const id_user = req.user.id;
  getConnection((err, client) => {
    if (err) return res.status(500).json({ message: "Erreur de connexion à la base de données." });
    const query = `
      SELECT DISTINCT YEAR(date_commande) as year
      FROM commandes
      WHERE id_user = ?
      ORDER BY year DESC
    `;
    client.query(query, [id_user], (err, results) => {
      client.release();
      if (err) return res.status(500).json({ message: "Erreur lors de la récupération des années." });
      res.status(200).json({ years: results.map(r => r.year) });
    });
  });
});


export default router;