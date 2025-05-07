import express from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { GetUserByEmail } from "../queries/User.js";
import validateRequest from "../middlewares/validateRequest.js";
import { getConnection } from "../queries/connect.js";
import { sendEmail } from "../utils/email.js";

const router = express.Router();
const secret_key = process.env.SECRET_KEY;

// Demande de réinitialisation de mot de passe
router.post(
  "/request-reset",
  [
    body("email")
      .isEmail()
      .withMessage("Le champ 'email' doit être une adresse email valide."),
  ],
  validateRequest,
  async (req, res) => {
    const { email } = req.body;
    const client = getConnection();

    try {
      GetUserByEmail(client, email, async (err, result) => {
        console.log(client,email,err);
        if (err) {
          return res
            .status(500)
            .json({ message: "Erreur lors de la verification de l'email." });
        }
        if (!result.exists) {
          return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        const user = result.results[0];

        // Générer un token de réinitialisation
        const resetToken = jwt.sign(
          { id: user.id_user, email: user.email },
          secret_key,
          { expiresIn: "15m" } // Token valide pendant 15 minutes
        );


        // Envoyer le lien de réinitialisation par email
        const resetLink = `http://localhost:8001/api/reset-password?token=${resetToken}`;
        try {
          await sendEmail(user.email, 'Réinitialisation de mot de passe', `Cliquez sur le lien suivant pour réinitialiser votre mot de passe : ${resetLink}`);
          res.status(200).json({ message: "Lien de réinitialisation envoyé. Veuillez vérifier votre email." });
        } catch (error) {
          res.status(500).json({ message: "Erreur lors de l'envoi de l'email." });
        }
      });
    } catch {
      res.status(500).json({ message: "Erreur lors de la demande de réinitialisation." });
    }
  }
);

// Réinitialisation du mot de passe
router.post(
  "/reset-password",
  [
    body("token").notEmpty().withMessage("Le champ 'token' est obligatoire."),
    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("Le mot de passe doit contenir au moins 8 caractères."),
  ],
  validateRequest,
  async (req, res) => {
    const { token, newPassword } = req.body;

    try {
      const decoded = jwt.verify(token, secret_key);
      const client = getConnection();

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const query = "UPDATE users SET mdp = ? WHERE id_user = ?";
      client.query(query, [hashedPassword, decoded.id], (err, results) => {
        if (err) {
          return res.status(500).json({ message: "Erreur lors de la réinitialisation du mot de passe." });
        }
        res.status(200).json({ message: "Mot de passe réinitialisé avec succès." });
      });
    } catch (err) {
      res.status(400).json({ message: "Token invalide ou expiré." });
    }
  }
);

export default router;