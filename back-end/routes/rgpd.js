import express from "express";
import { body } from "express-validator";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import validateRequest from "../middlewares/validateRequest.js";
import { updateLastActivity } from "../middlewares/updateLastActivity.js";
import { getConnection } from "../queries/connect.js";
import PDFDocument from "pdfkit";
import {Get_billing_info} from "../queries/payment.js"

import { Upsert_billing_info } from "../queries/payment.js";
import { Update_user_phone } from "../queries/User.js";


const router = express.Router();

router.post("/update_billing_data/:id_user", (req, res) => {
  const { id_user } = req.params;
  const {
    telephone,
    nomEntreprise: nom_entreprise,
    numeroTva: numero_tva,
    adresse: adresse_ligne1,
    complementAdresse: adresse_ligne2,
    ville,
    region,
    codePostal: code_postal,
    pays
  } = req.body;

  const client = getConnection();

  console.log("Début de la requete pour l'utilisateur :", id_user);
  console.log("Données reçues :", req.body);

  // Mise à jour des informations de facturation
  Upsert_billing_info(client, {
    id_user,
    nom_entreprise,
    numero_tva,
    adresse_ligne1,
    adresse_ligne2,
    ville,
    region,
    code_postal,
    pays,
    telephone
  }, (billingErr) => {
    client.end();
    if (billingErr) {
      console.error("Erreur mise à jour facturation :", billingErr);
      return res.status(500).json({ message: "Erreur lors de la mise à jour de la facturation." });
      }
      res.status(200).json({ message: "Informations mises à jour avec succès." });
  });
});




//la partie du code commenté en dessous s'utilise avec le middleware "authenticateToken" (necessitant la 2FA )
//celui du dessus qui a été presenté vendredi utilise le param de l'url pour réaliser les requete(cela sera supprimé à l'avenir)


// GET - Exporter les données personnelles en PDF
router.get("/export/test/:id_user", (req, res) => {
  const client = getConnection();
  const query = "SELECT nom, prenom, email FROM users WHERE id_user = ?"; 

  client.query(query, [req.params.id_user], (err, results) => {
    if (err){
       console.error(err);
       return res.status(500).json({ message: "Erreur serveur." });
      }
    if (results.length === 0) return res.status(404).json({ message: "Utilisateur introuvable." });

    const user = results[0];

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="donnees_utilisateur_${req.params.id_user}.pdf"`);

    doc.pipe(res);

    doc.fontSize(18).text("Mes Données personnelles: ", { underline: true });
    doc.moveDown();

    doc.fontSize(12).text(`Nom : ${user.nom}`);
    doc.text(`Prénom : ${user.prenom}`);
    doc.text(`Email : ${user.email}`);

    doc.end();
  });
});

// GET - Récupérer les infos personnelles
router.get("/get/:id_user", (req, res) => {
  const client = getConnection();
  const query = "SELECT nom, prenom, email FROM users WHERE id_user = ?";
  client.query(query, [req.params.id_user], (err, results) => {
    if (err) return res.status(500).json({ message: "Erreur serveur." });
    if (results.length === 0) return res.status(404).json({ message: "Utilisateur introuvable." });
    res.status(200).json(results[0]);
  });
});

//GET - Récupérer les informations de facturation
router.get("/get_billing_info/:id_user", async (req, res) => {
  const client = getConnection();
  const { id_user } = req.params;
  
  try {
    Get_billing_info(client, id_user, (err, results) => {
      client.end();
      if (err) return res.status(500).json({ message: "Erreur lors de la récupération des informations." });
      res.status(200).json(results);
    });
  } catch (error) {
    client.end();
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// PUT - Mise à jour des infos
router.put(
  "/put/:id_user",
  [
    body("nom").optional().isLength({ min: 1 }).withMessage("Le nom ne peut pas être vide."),
    body("prenom").optional().isLength({ min: 1 }).withMessage("Le prénom ne peut pas être vide."),
    body("email").optional().isEmail().withMessage("Email invalide."),
  ],
  validateRequest,
  (req, res) => {
    const client = getConnection();
    const { nom, prenom, email } = req.body;

    const query = `
      UPDATE users 
      SET nom = COALESCE(?, nom),
          prenom = COALESCE(?, prenom),
          email = COALESCE(?, email),
      WHERE id_user = ?`;

    client.query(query, [nom, prenom, email, req.params.id_user], (err, result) => {
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

// // GET - Exporter les données personnelles en PDF (avec authenticateToken)
// router.get("/export/me", authenticateToken,updateLastActivity, (req, res) => {
//   const client = getConnection();
//   const query = "SELECT nom, prenom, email, telephone FROM users WHERE id_user = ?";

//   client.query(query, [req.user.id], (err, results) => {
//     if (err) return res.status(500).json({ message: "Erreur serveur." });
//     if (results.length === 0) return res.status(404).json({ message: "Utilisateur introuvable." });

//     const user = results[0];
//     const doc = new PDFDocument();
//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader("Content-Disposition", `attachment; filename="mes_donnees.pdf"`);

//     doc.pipe(res);

//     doc.fontSize(18).text("Mes Données Personnelles: ", { underline: true });
//     doc.moveDown();

//     doc.fontSize(12).text(`Nom : ${user.nom}`);
//     doc.text(`Prénom : ${user.prenom}`);
//     doc.text(`Email : ${user.email}`);
//     doc.text(`Téléphone : ${user.telephone || "Non renseigné"}`);

//     doc.end();
//   });
// });

// // GET - Récupérer les infos personnelles (avec authenticateToken)
// router.get("/me", authenticateToken,updateLastActivity, (req, res) => {
//   const client = getConnection();
//   const query = "SELECT nom, prenom, email, telephone FROM users WHERE id_user = ?";
//   client.query(query, [req.user.id], (err, results) => {
//     if (err) return res.status(500).json({ message: "Erreur serveur." });
//     if (results.length === 0) return res.status(404).json({ message: "Utilisateur introuvable." });
//     res.status(200).json(results[0]);
//   });
// });

// // PUT - Droit de rectification (avec authenticateToken)
// router.put(
//   "/me",
//   authenticateToken,updateLastActivity,
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

// DELETE - Suppression du compte (avec authenticateToken)
router.delete("/me", authenticateToken,updateLastActivity, (req, res) => {
  const client = getConnection();
  const query = "DELETE FROM users WHERE id_user = ?";
  client.query(query, [req.user.id], (err, result) => {
    if (err) return res.status(500).json({ message: "Erreur lors de la suppression." });
    res.status(200).json({ message: "Compte utilisateur supprimé avec succès." });
  });
});

// export default router;
