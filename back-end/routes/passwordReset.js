import express from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { GetUserByEmail } from "../queries/User.js";
import { getConnection } from "../queries/connect.js";
import { sendEmail } from "../utils/email.js";

import validateRequest from "../middlewares/validateRequest.js";
import { logActivity } from '../middlewares/logActivity.js';

const router = express.Router();

// Demande de réinitialisation de mot de passe
router.post(
  "/request-reset",
  logActivity("Demande de réinitialisation de mot de passe"),
  [
    body("email")
      .isEmail()
      .withMessage("Le champ 'email' doit être une adresse email valide."),
  ],
  validateRequest,
  (req, res) => {
    const { email } = req.body;
    getConnection((err, client) => {
      if (err) {
        return res.status(500).json({ message: "Erreur de connexion à la base de données." });
      }
      GetUserByEmail(client, email, async (err, result) => {
        client.release();
        if (err) {
          return res
            .status(500)
            .json({ message: "Erreur lors de la vérification de l'email." });
        }
        if (!result.exists || result.results.length === 0) {
          return res.status(404).json({ message: "Email invalide" });
        }

        const user = result.results[0];

        if (!user.secretkey) {
          return res.status(500).json({ message: "Clé secrète manquante pour l'utilisateur." });
        }

        const resetToken = jwt.sign(
          { id: user.id_user, email: user.email },
          user.secretkey,
          { expiresIn: "15m" }
        );

        const resetLink = `${process.env.FRONT_END_URL}/resetpassword?token=${resetToken}`;

        try {
          await sendEmail(
            user.email,
            'Réinitialisation de mot de passe',
            `Cliquez sur le lien suivant pour réinitialiser votre mot de passe : ${resetLink}`
          );
          res.status(200).json({ message: "Lien de réinitialisation envoyé. Veuillez vérifier votre email." });
        } catch (error) {
          res.status(500).json({ message: "Erreur lors de l'envoi de l'email." });
        }
      });
    });
  }
);

// Réinitialisation du mot de passe
router.post(
  "/reset-password",
  logActivity("Réinitialisation du mot de passe avec token reçus par mail"),
  [
    body("token").notEmpty().withMessage("Le token est requis."),
    body("newPassword").isLength({ min: 8 }).withMessage("Le mot de passe doit comporter au moins 8 caractères."),
  ],
  validateRequest,
  async (req, res) => {
    const { token, newPassword } = req.body;
    
    try {
      // Étape 1 : Décoder le token sans vérification pour extraire l'id de l'utilisateur
      const decodedUnverified = jwt.decode(token);
      if (!decodedUnverified?.id) {
        return res.status(400).json({ message: "Token invalide." });
      }

      const userId = decodedUnverified.id;
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      getConnection((err, client) => {
        if (err) {
          return res.status(500).json({ message: "Erreur de connexion à la base de données." });
        }
        const query = "UPDATE users SET mdp = ? WHERE id_user = ?";
        client.query(query, [hashedPassword, userId], (err, result) => {
          client.release();
          if (err) {
            return res.status(500).json({ message: "Erreur lors de la réinitialisation du mot de passe." });
          }
          res.status(200).json({ message: "Mot de passe réinitialisé avec succès." });
        });
      });
    } catch (error) {
      res.status(400).json({ message: "Token invalide ou expiré." });
    }
  }
);

export default router;