import express from "express";
import { body } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {GetUserByEmail} from "../queries/User.js";
import validateRequest from "../middlewares/validateRequest.js";
import { getConnection } from "../queries/connect.js";

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

        const token = jwt.sign(
          { id: user.id_user, nom: user.nom, prenom: user.prenom, role: user.role, email: user.email, tel: user.telephone },
          secret_key,
          { expiresIn: "1h" }
        );

        res
          .status(200)
          .json({
            message: `Connexion réussie. Bienvenue ${user.id_user} | ${user.nom} | ${user.prenom} | ${user.role} | ${user.email} | ${user.telephone} .`,
            token,
          });
      });
    } catch {
      res.status(500).json({ message: "Erreur lors de la connexion." });
    }
  }
);

export default router;