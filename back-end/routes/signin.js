import express from "express";
import { body } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import { GetUserByEmail } from "../queries/User.js";
import validateRequest from "../middlewares/validateRequest.js";
import { getConnection } from "../queries/connect.js";
import { sendEmail } from "../utils/email.js";

const router = express.Router();
const secret_key = process.env.SECRET_KEY;

//connexion
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Le champ 'email' doit être une adresse email valide."),
    body("password")
      .notEmpty()
      .withMessage("Le champ 'password' est obligatoire."),
  ],
  validateRequest,
  async (req, res) => {
    const { email, password } = req.body;
    const client = getConnection("DSP");

    try {
      GetUserByEmail(client, email, async (err, result) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "Erreur lors de la verification de l'email." });
        }
        if (!result.exists) {
          return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        const user = result.results[0];
        const isPasswordValid = await bcrypt.compare(password, user.mdp);

        if (!isPasswordValid) {
          return res
            .status(401)
            .json({ message: "Le mot de passe est incorrect" });
        }

        // Générer un code de vérification
        const verificationCode = speakeasy.totp({
          secret: secret_key,
          encoding: "base32",
          step: 300, // Code valide pendant 5 minutes
        });

        // Envoyer le code par email
        try {
          await sendEmail(
            user.email,
            "Votre code de vérification",
            `Votre code de vérification est : ${verificationCode}`
          );
          res
            .status(200)
            .json({
              message:
                "Code de vérification envoyé. Veuillez vérifier votre email.",
            });
        } catch (error) {
          res
            .status(500)
            .json({ message: "Erreur lors de l'envoi de l'email." });
        }
      });
    } catch {
      res.status(500).json({ message: "Erreur lors de la connexion." });
    }
  }
);

// Vérification du code de vérification
router.post(
  "/verify",
  [
    body("email")
      .isEmail()
      .withMessage("Le champ 'email' doit être une adresse email valide."),
    body("code").notEmpty().withMessage("Le champ 'code' est obligatoire."),
  ],
  validateRequest,
  async (req, res) => {
    const { email, code } = req.body;
    const client = getConnection("DSP");

    try {
      GetUserByEmail(client, email, async (err, result) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "Erreur lors de la verification de l'email." });
        }
        if (!result.exists) {
          return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        const user = result.results[0];

        // Vérifier le code de vérification
        const isCodeValid = speakeasy.totp.verify({
          secret: secret_key,
          encoding: "base32",
          token: code,
          step: 300, // Code valide pendant 5 minutes
        });

        if (!isCodeValid) {
          return res
            .status(401)
            .json({
              message: "Le code de vérification est incorrect ou a expiré.",
            });
        }

        // Générer un token JWT
        const token = jwt.sign(
          {
            id: user.id_user,
            nom: user.nom,
            prenom: user.prenom,
            role: user.role,
            email: user.email,
            tel: user.telephone,
          },
          secret_key,
          { expiresIn: "1h" }
        );

        res.status(200).json({
          message: `Connexion réussie. Bienvenue ${user.nom} ${user.prenom}.`,
          token,
        });
      });
    } catch {
      res
        .status(500)
        .json({ message: "Erreur lors de la vérification du code." });
    }
  }
);

export default router;
