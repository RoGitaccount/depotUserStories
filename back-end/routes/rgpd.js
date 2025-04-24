import express from "express";
import { body } from "express-validator";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import validateRequest from "../middlewares/validateRequest.js";
import { getConnection } from "../queries/connect.js";


const router = express.Router();


// GET - Récupérer les infos personnelles
router.get("/get/:id_user", (req, res) => {
  const client = getConnection();
  const query = "SELECT nom, prenom, email, telephone FROM users WHERE id_user = ?";
  client.query(query, [req.params.id_user], (err, results) => {
    if (err) return res.status(500).json({ message: "Erreur serveur." });
    if (results.length === 0) return res.status(404).json({ message: "Utilisateur introuvable." });
    res.status(200).json(results[0]);
  });
});

// PUT - Mise à jour des infos
router.put(
  "/put/:id_user",
  [
    body("nom").optional().isLength({ min: 1 }).withMessage("Le nom ne peut pas être vide."),
    body("prenom").optional().isLength({ min: 1 }).withMessage("Le prénom ne peut pas être vide."),
    body("email").optional().isEmail().withMessage("Email invalide."),
    body("telephone").optional().isLength({ min: 8 }).withMessage("Téléphone invalide."),
  ],
  validateRequest,
  (req, res) => {
    const client = getConnection();
    const { nom, prenom, email, telephone } = req.body;

    const query = `
      UPDATE users 
      SET nom = COALESCE(?, nom), 
          prenom = COALESCE(?, prenom), 
          email = COALESCE(?, email), 
          telephone = COALESCE(?, telephone) 
      WHERE id_user = ?`;

    client.query(query, [nom, prenom, email, telephone, req.params.id_user], (err, result) => {
      if (err) return res.status(500).json({ message: "Erreur lors de la mise à jour." });
      res.status(200).json({ message: "Données personnelles mises à jour avec succès." });
    });
  }
);

// DELETE - Suppression du compte
router.delete("/del/:id_user", (req, res) => {
  const client = getConnection();
  const query = "DELETE FROM users WHERE id_user = ?";
  client.query(query, [req.params.id_user], (err, result) => {
    if (err) return res.status(500).json({ message: "Erreur lors de la suppression." });
    res.status(200).json({ message: "Compte utilisateur supprimé avec succès." });
  });
});

export default router;

// const router = express.Router();

// // GET - Droit d'accès : récupérer les infos personnelles
// router.get("/me", authenticateToken, (req, res) => {
//   const client = getConnection();
//   const query = "SELECT nom, prenom, email, telephone FROM users WHERE id_user = ?";
//   client.query(query, [req.user.id], (err, results) => {
//     if (err) return res.status(500).json({ message: "Erreur serveur." });
//     if (results.length === 0) return res.status(404).json({ message: "Utilisateur introuvable." });
//     res.status(200).json(results[0]);
//   });
// });

// // PUT - Droit de rectification
// router.put(
//   "/me",
//   authenticateToken,
//   [
//     body("nom").optional().isLength({ min: 1 }).withMessage("Le nom ne peut pas être vide."),
//     body("prenom").optional().isLength({ min: 1 }).withMessage("Le prénom ne peut pas être vide."),
//     body("email").optional().isEmail().withMessage("Email invalide."),
//     body("telephone").optional().isLength({ min: 8 }).withMessage("Téléphone invalide."),
//   ],
//   validateRequest,
//   (req, res) => {
//     const client = getConnection();
//     const { nom, prenom, email, telephone } = req.body;

//     const query = `
//       UPDATE users 
//       SET nom = COALESCE(?, nom), 
//           prenom = COALESCE(?, prenom), 
//           email = COALESCE(?, email), 
//           telephone = COALESCE(?, telephone) 
//       WHERE id_user = ?`;
//     client.query(query, [nom, prenom, email, telephone, req.user.id], (err, result) => {
//       if (err) return res.status(500).json({ message: "Erreur lors de la mise à jour." });
//       res.status(200).json({ message: "Données personnelles mises à jour avec succès." });
//     });
//   }
// );

// // DELETE - Droit à l’effacement
// router.delete("/me", authenticateToken, (req, res) => {
//   const client = getConnection();
//   const query = "DELETE FROM users WHERE id_user = ?";
//   client.query(query, [req.user.id], (err, result) => {
//     if (err) return res.status(500).json({ message: "Erreur lors de la suppression." });
//     res.status(200).json({ message: "Compte utilisateur supprimé avec succès." });
//   });
// });

// export default router;
