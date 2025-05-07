import express from "express";
import { body } from "express-validator"; //on ne met pas param car on ne récupère pas de paramètre dans le body
import bcrypt from "bcryptjs";
import { Insert_user, GetUserByEmail } from "../queries/User.js";
import validateRequest from "../middlewares/validateRequest.js";
import { getConnection } from "../queries/connect.js";
import { sendEmail } from "../utils/email.js";


const router = express.Router();

// Inscription
router.post(
  "/signup",
  [
    body("prenom").notEmpty().withMessage("Le champ 'prenom' est obligatoire."),
    body("nom").notEmpty().withMessage("Le champ 'nom' est obligatoire."),
    body("email")
      .isEmail()
      .withMessage("Le champ 'email' doit être une adresse email valide."),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Le mot de passe doit contenir au moins 8 caractères."),
    body("role")
      .isIn(["admin", "user"])
      .withMessage("Le rôle doit être soit 'admin' soit 'user'."),
    body("telephone")
      .optional()
      .matches(/^[0-9]{10,10}$/)
      .withMessage(
        "Le numéro de téléphone doit contenir 10 chiffres"
      ),
  ],
  validateRequest,
  async (req, res) => {
    const { nom, prenom, email, role, password, telephone } = req.body;
    const client = getConnection();

    try {
      GetUserByEmail(client, email, async (err, result) => {
        if (err) {
          client.end();
          return res
            .status(500)
            .json({ message: "Erreur lors de la vérification de l'email." });
        }
        if (result.exists) {
          client.end();
          return res
            .status(409)
            .json({ message: "Cet email est déjà utilisé." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        try {
          await sendEmail(email, 'Bienvenue chez () – Merci pour votre inscription !', `Bonjour ${prenom},
            Merci pour votre inscription chez () !
            Nous sommes ravis de vous compter parmi nos nouveaux membres.

            Votre compte est maintenant actif et vous pouvez dès à présent :
            ✅ Accéder à nos services
            ✅ Suivre vos commandes / rendez-vous
            ✅ Recevoir nos offres exclusives

            👉 [Lien vers l’espace client ou tableau de bord]

            Besoin d’aide pour démarrer ? Consultez notre guide ici : [Lien vers un guide ou FAQ]
            Ou contactez-nous directement à ${process.env.SUPPORT_EMAIL}.

            À très bientôt,
            L’équipe ()`);
          Insert_user(
            client,
            { nom, prenom, email, role, password: hashedPassword, telephone },
            (err, results) => {
              if (err) {
                client.end();
                return res
                  .status(500)
                  .json({ message: "Erreur lors de l'inscription." });
              }
              client.end();
              res.status(201).json({ message: "Inscription réussie." });
            }
          );
        } catch (error) {
          res.status(500).json({ message: "Erreur lors de l'envoi de l'email." });
        }
      });
    } catch {
      client.end();
      res.status(500).json({ message: "Erreur lors de l'inscription" });
    }
  }
);

export default router;
