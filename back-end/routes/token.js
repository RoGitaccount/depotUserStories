import express from "express";
import jwt from "jsonwebtoken";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import { getConnection } from "../queries/connect.js";
import { GetUserById } from "../queries/User.js";
import { decrypt } from '../utils/crypt.js';

const router = express.Router();

// Route pour récupérer les infos utilisateur connectées
router.get("/me", authenticateToken, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Non authentifié." });
  }
  res.json({
    id: req.user.id,
    nom: req.user.nom,
    prenom: req.user.prenom,
    email: req.user.email,
    role: req.user.role,
  });
});

// Route pour déconnecter (supprimer le cookie)
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.json({ message: "Déconnexion réussie." });
});

// Route pour rafraîchir le token d'accès
router.post("/refresh-token", (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ 
      message: "Refresh token manquant. Veuillez vous reconnecter." 
    });
  }

  try {
    // Vérifier le refresh token avec la clé secrète du refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    
    if (!decoded || !decoded.id) {
      return res.status(401).json({ 
        message: "Refresh token invalide." 
      });
    }

    // Récupérer l'utilisateur depuis la base de données
    getConnection((err, client) => {
      if (err) {
        return res.status(500).json({ 
          message: "Erreur de connexion à la base de données." 
        });
      }

      GetUserById(client, decoded.id, (err, result) => {
        client.release();
        
        if (err || !result || !result.exists) {
          return res.status(404).json({ 
            message: "Utilisateur introuvable." 
          });
        }

        const user = result.results[0];
        
        if (!user.secretkey) {
          return res.status(500).json({ 
            message: "Clé secrète manquante." 
          });
        }

        // Générer un nouveau token d'accès avec la clé secrète de l'utilisateur
        const newAccessToken = jwt.sign(
          {
            id: user.id_user,
            nom: user.nom,
            prenom: user.prenom,
            role: user.role,
            email: user.email,
          },
          user.secretkey,
          { expiresIn: "1h" }
        );

        // Définir le nouveau token dans les cookies
        res.cookie("token", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "Lax",
          maxAge: 3600000, // 1h
        });

        res.status(200).json({
          message: "Token rafraîchi avec succès.",
          user: {
            id: user.id_user,
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            role: user.role,
          }
        });
      });
    });

  } catch (error) {
    console.error("Erreur lors du refresh token:", error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: "Refresh token expiré. Veuillez vous reconnecter." 
      });
    }
    
    return res.status(401).json({ 
      message: "Refresh token invalide." 
    });
  }
});

export default router;