import express from "express";
import { body } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import { GetUserByEmail } from "../queries/User.js";
import { getConnection } from "../queries/connect.js";
import { sendEmail } from "../utils/email.js";
import { decrypt } from '../utils/crypt.js';

import validateRequest from "../middlewares/validateRequest.js";
import { logActivity } from '../middlewares/logActivity.js';
import { updateLastActivity } from '../middlewares/updateLastActivity.js';

const router = express.Router();
const secret_key = process.env.SECRET_KEY;

// Connexion
router.post(
  "/login",
  logActivity("Tentative de connexion"),
  [
    body("email")
      .isEmail()
      .withMessage("Le champ 'email' doit être une adresse email valide.")
      .isLength({ max: 255 })
      .withMessage("L'email ne doit pas dépasser 255 caractères."),
    body("password")
      .notEmpty()
      .withMessage("Le champ 'password' est obligatoire.")
      .isLength({ min: 8, max: 255 })
      .withMessage("Le mot de passe doit contenir entre 8 et 255 caractères."),
  ],
  validateRequest,
  
  (req, res) => {
    const { email, password } = req.body;
    getConnection((err, client) => {
      if (err) return res.status(500).json({ message: "Erreur de connexion à la base de données." });

      GetUserByEmail(client, email, async (err, result) => {
        client.release();
        if (err) {
          return res.status(500).json({ message: "Erreur lors de la verification de l'email." });
        }
        if (!result.exists) {
          return res.status(404).json({ message: "Connexion refusé saisie invalide." });
        }

        const user = result.results[0];
        const isPasswordValid = await bcrypt.compare(password, user.mdp);

        if (!isPasswordValid) {
          return res.status(401).json({ message: "Connexion refusé saisie invalide." });
        }

        if (!user.secretkey) {
          return res.status(400).json({ message: "Clé secrète absente pour cet utilisateur." });
        }

        const decryptedSecret = decrypt(user.secretkey);

        // Générer un code de vérification
        const verificationCode = speakeasy.totp({
          secret: decryptedSecret,
          encoding: 'base32',
          step: 300
        });

        try {
          await sendEmail(
            user.email,
            "Votre code de vérification",
            `Votre code de vérification est : ${verificationCode}`
          );
          res.status(200).json({
            message: "Code de vérification envoyé. Veuillez vérifier votre email.",
          });
        } catch (error) {
          res.status(500).json({ message: "Erreur lors de l'envoi de l'email." });
        }
      });
    });
  }
);

// Vérification du code de vérification
router.post(
  "/verify",
  [
    body("email")
      .isEmail()
      .withMessage("Le champ 'email' doit être une adresse email valide.")
      .isLength({ max: 255 })
      .withMessage("L'email ne doit pas dépasser 255 caractères."),

    body("code")
      .notEmpty()
      .withMessage("Le champ 'code' est obligatoire.")
      .isLength({ max: 6 }),
    body("rememberMe")
      .optional()
      .isBoolean(),
  ],
  validateRequest,
  logActivity("Vérification du code de connexion"),
  updateLastActivity,
  (req, res) => {
    const { email, code, rememberMe } = req.body;

    getConnection((err, client) => {
      if (err) return res.status(500).json({ message: "Erreur de connexion à la base de données." });

      GetUserByEmail(client, email, async (err, result) => {
        client.release();
        if (err) return res.status(500).json({ message: "Erreur lors de la vérification de l'email." });
        if (!result.exists) return res.status(404).json({ message: "Utilisateur non trouvé." });

        const user = result.results[0];
        const decryptedSecret = decrypt(user.secretkey);

        const isVerified = speakeasy.totp.verify({
          secret: decryptedSecret,
          encoding: 'base32',
          token: code,
          step: 300,
          window: 1,
        });

        if (!isVerified) {
          return res.status(401).json({
            message: "Le code de vérification est incorrect ou a expiré.",
          });
        }

        // Access Token (utiliser la clé secrète de l'utilisateur)
        const accessToken = jwt.sign(
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

        res.cookie("token", accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "Lax",
          maxAge: 3600000, // 1h
        });

        // Refresh Token si "rememberMe" est true
        if (rememberMe) {
          const refreshToken = jwt.sign(
            { id: user.id_user },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "7d" }
          );

          res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
          });
        }

        const publicUser = {
          id_user: user.id_user,
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          role: user.role,
        };

        return res.status(200).json({
          message: `Connexion réussie. Bienvenue ${user.nom} ${user.prenom}.`,
          user: publicUser,
        });
      });
    });
  }
);

export default router;