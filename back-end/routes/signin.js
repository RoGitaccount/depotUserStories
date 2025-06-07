import express from "express";
import { body } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import { GetUserByEmail } from "../queries/User.js";
import validateRequest from "../middlewares/validateRequest.js";
import { getConnection } from "../queries/connect.js";
import { sendEmail } from "../utils/email.js";

// _____github_____//
import { decrypt } from '../utils/crypt.js';
// _________



const router = express.Router();
const secret_key = process.env.SECRET_KEY;

router.get("/", (req, res) => res.send("signin"));

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
    const client = getConnection();

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

// ______
  console.log(user.secretkey);

        // const decryptedSecret = decrypt(user.secretkey);

        if (!user.secretkey) {
  return res.status(400).json({ message: "Clé secrète absente pour cet utilisateur." });
}

const decryptedSecret = decrypt(user.secretkey);

//______ 


        // Générer un code de vérification
        const verificationCode = speakeasy.totp({
          // __github__//
          secret: decryptedSecret,
          encoding: 'base32',
          step: 300
          // ___________//

          // secret: secret_key,
          // encoding: "base32",
          // step: 300, // Code valide pendant 5 minutes
        });

          //______github____//
         console.log("Code généré avec la clé décryptée :", verificationCode);
          // ________//


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
             //______github____//
              console.log(verificationCode);
            // ________//
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
    const client = getConnection();

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

        // ___github____//
         const decryptedSecret = decrypt(user.secretkey);
        // _______//

        
        // // Vérifier le code de vérification
        // const isCodeValid = speakeasy.totp.verify({
        //   secret: secret_key,
        //   encoding: "base32",
        //   token: code,
        //   step: 300, // Code valide pendant 5 minutes
        // });

        // __github__//
        const isVerified = speakeasy.totp.verify({
          secret: decryptedSecret,
          encoding: 'base32',
          token: code,
          step: 300,
          window: 1
        });

        console.log("La vérification a réussi ?", isVerified);
        // ____//

        // __github__//
        if (!isVerified) {
          return res
            .status(401)
            .json({
              message: "Le code de vérification est incorrect ou a expiré.",
            });
        }
        // ____//


        // if (!isCodeValid) {
        //   return res
        //     .status(401)
        //     .json({
        //       message: "Le code de vérification est incorrect ou a expiré.",
        //     });
        // }

        // // Générer un token JWT
        // const token = jwt.sign(
        //   {
        //     id: user.id_user,
        //     nom: user.nom,
        //     prenom: user.prenom,
        //     role: user.role,
        //     email: user.email,
        //   },
        //   secret_key,
        //   { expiresIn: "1h" }
        // );


        //__github__//
          const token = jwt.sign(
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
          
        //____//


        // Créer un objet utilisateur "public" sans champs sensibles
        const publicUser = {
          id_user: user.id_user,
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          role: user.role,
        };

        res.status(200).json({
          message: `Connexion réussie. Bienvenue ${user.nom} ${user.prenom}.`,
          user: publicUser,
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
