import express from "express";
import { body } from "express-validator";
import moment from "moment";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/email.js";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import validateRequest from "../middlewares/validateRequest.js";
import { updateLastActivity } from "../middlewares/updateLastActivity.js";
import { logActivity } from "../middlewares/logActivity.js";
import { getConnection } from "../queries/connect.js";
import PDFDocument from "pdfkit";
import { Get_billing_info, Upsert_billing_info } from "../queries/payment.js";
import { Update_user_phone } from "../queries/User.js";

const router = express.Router();

// GET - Récupérer les informations de facturation (par token)
router.get("/get_billing_info/me",
    authenticateToken,
    updateLastActivity,
    logActivity("Récupération des informations de facturation"),
    (req, res) => {
        getConnection((err, client) => {
            if (err) return res.status(500).json({ message: "Erreur de connexion à la base de données." });
            const id_user = req.user.id;
            Get_billing_info(client, id_user, (err, results) => {
                client.release();
                if (err) return res.status(500).json({ message: "Erreur lors de la récupération des informations." });
                res.status(200).json(results);
            });
        });
    }
);

// POST - Modifier les informations de facturation (par token)
router.post("/update_billing_data/me",
    authenticateToken,
    updateLastActivity,
    logActivity("Mise à jour des informations de facturation"),
    (req, res) => {
        const id_user = req.user.id;
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

        getConnection((err, client) => {
            if (err) return res.status(500).json({ message: "Erreur de connexion à la base de données." });
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
                client.release();
                if (billingErr) {
                    console.error("Erreur mise à jour facturation :", billingErr);
                    return res.status(500).json({ message: "Erreur lors de la mise à jour de la facturation." });
                }
                res.status(200).json({ message: "Informations mises à jour avec succès." });
            });
        });
    }
);

// GET - Exporter les données personnelles et les données de facturation en PDF
router.get("/export/me",
    authenticateToken,
    updateLastActivity,
    logActivity("Export des données personnelles en PDF"),
    (req, res) => {
        getConnection((err, client) => {
            if (err) return res.status(500).json({ message: "Erreur de connexion à la base de données." });

            const queryUser = "SELECT nom, prenom, email FROM users WHERE id_user = ?";
            const queryFacturation = `
                SELECT nom_entreprise, numero_tva, adresse_ligne1, adresse_ligne2, ville, region, code_postal, pays, telephone
                FROM informations_facturation WHERE id_user = ?
            `;

            client.query(queryUser, [req.user.id], (err, userResults) => {
                if (err) {
                    client.release();
                    console.error(err);
                    return res.status(500).json({ message: "Erreur serveur lors de la récupération des données utilisateur." });
                }

                if (userResults.length === 0) {
                    client.release();
                    return res.status(404).json({ message: "Utilisateur introuvable." });
                }

                const user = userResults[0];

                client.query(queryFacturation, [req.user.id], (err, facturationResults) => {
                    client.release();
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ message: "Erreur serveur lors de la récupération des données de facturation." });
                    }

                    const doc = new PDFDocument({ margin: 50 });
                    res.setHeader("Content-Type", "application/pdf");
                    res.setHeader("Content-Disposition", `attachment; filename="donnees_utilisateur_${req.user.id}.pdf"`);
                    doc.pipe(res);
                    // Header du document
                    doc
                        .fontSize(20)
                        .fillColor("#333")
                        .text("Export des données personnelles", { align: "center" });
                    doc.moveDown();
                    doc
                        .fontSize(10)
                        .fillColor("#777")
                        .text(`Date d'export : ${moment().format("DD/MM/YYYY HH:mm")}`, { align: "right" });
                    doc.moveDown(2);
                    // Section : Données personnelles
                    doc
                        .fontSize(16)
                        .fillColor("#000")
                        .text("Données personnelles", { underline: true });
                    doc.moveDown(0.5);
                    doc
                        .fontSize(12)
                        .fillColor("#333")
                        .text(`Nom : `, { continued: true })
                        .fillColor("#000")
                        .text(user.nom);
                    doc
                        .fillColor("#333")
                        .text(`Prénom : `, { continued: true })
                        .fillColor("#000")
                        .text(user.prenom);
                    doc
                        .fillColor("#333")
                        .text(`Email : `, { continued: true })
                        .fillColor("#000")
                        .text(user.email);
                    doc.moveDown();
                    // Séparateur
                    doc.moveDown().strokeColor("#ccc").lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
                    doc.moveDown();
                    // Section : Données de facturation
                    doc
                        .fontSize(16)
                        .fillColor("#000")
                        .text("Informations de facturation", { underline: true });

                    doc.moveDown(0.5);

                    if (facturationResults.length > 0) {
                        const info = facturationResults[0];

                        if (info.nom_entreprise)
                            doc.fillColor("#333").text(`Entreprise : `, { continued: true }).fillColor("#000").text(info.nom_entreprise);
                        if (info.numero_tva)
                            doc.fillColor("#333").text(`Numéro TVA : `, { continued: true }).fillColor("#000").text(info.numero_tva);
                        doc.fillColor("#333").text(`Adresse : `, { continued: true }).fillColor("#000").text(info.adresse_ligne1);
                        if (info.adresse_ligne2)
                            doc.text(info.adresse_ligne2);
                        doc.fillColor("#333").text(`Ville : `, { continued: true }).fillColor("#000").text(info.ville);
                        doc.fillColor("#333").text(`Région : `, { continued: true }).fillColor("#000").text(info.region);
                        doc.fillColor("#333").text(`Code Postal : `, { continued: true }).fillColor("#000").text(info.code_postal);
                        doc.fillColor("#333").text(`Pays : `, { continued: true }).fillColor("#000").text(info.pays);
                        doc.fillColor("#333").text(`Téléphone : `, { continued: true }).fillColor("#000").text(info.telephone);
                    } else {
                        doc
                            .fontSize(12)
                            .fillColor("red")
                            .text("Aucune information de facturation disponible.");
                    }
                    doc.end();
                });
            });
        });
    }
);



// GET - Récupérer les infos personnelles (avec authenticateToken)
router.get("/me",
    authenticateToken,
    updateLastActivity,
    logActivity("Récupération des infos personnelles"),
    (req, res) => {
        getConnection((err, client) => {
            if (err) return res.status(500).json({ message: "Erreur de connexion à la base de données." });
            const query = "SELECT nom, prenom, email FROM users WHERE id_user = ?";
            client.query(query, [req.user.id], (err, results) => {
                client.release();
                if (err) return res.status(500).json({ message: "Erreur serveur." });
                if (results.length === 0) return res.status(404).json({ message: "Utilisateur introuvable." });
                res.status(200).json(results[0]);
            });
        });
    }
);

// Route pour modifier nom et prénom
router.put("/me/info",
  authenticateToken,
  updateLastActivity,
  logActivity("Mise à jour nom/prénom"),
  [
    body("nom").optional().isLength({ min: 1 }).withMessage("Le nom ne peut pas être vide."),
    body("prenom").optional().isLength({ min: 1 }).withMessage("Le prénom ne peut pas être vide."),
  ],
  validateRequest,
  (req, res) => {
    const { nom, prenom } = req.body;
    const userId = req.user.id;
    
    getConnection((err, client) => {
      if (err) return res.status(500).json({ message: "Erreur de connexion à la base de données." });
      
      const query = `UPDATE users SET nom = COALESCE(?, nom), prenom = COALESCE(?, prenom) WHERE id_user = ?`;
      
      client.query(query, [nom, prenom, userId], (err) => {
        client.release();
        if (err) return res.status(500).json({ message: "Erreur lors de la mise à jour." });
        return res.status(200).json({ message: "Nom et prénom mis à jour." });
      });
    });
  }
);

// Route pour modifier l'email - Version améliorée anti-spam
router.put("/me/email",
  authenticateToken,
  updateLastActivity,
  logActivity("Demande de changement d'email"),
  [
    body("email").isEmail().withMessage("Email invalide."),
  ],
  validateRequest,
  (req, res) => {
    const { email } = req.body;
    const userId = req.user.id;
   
    getConnection((err, client) => {
      if (err) return res.status(500).json({ message: "Erreur de connexion à la base de données." });
     
      // Vérifie si l'email existe déjà
      const checkQuery = `SELECT id_user FROM users WHERE email = ? AND id_user != ?`;
      client.query(checkQuery, [email, userId], (err, result) => {
        if (err) {
          client.release();
          return res.status(500).json({ message: "Erreur vérification email." });
        }
       
        if (result.length > 0) {
          client.release();
          return res.status(400).json({ message: "Cet email est déjà utilisé." });
        }
       
        // Génération du token
        const token = jwt.sign(
          { userId, newEmail: email },
          process.env.EMAIL_CHANGE_SECRET,
          { expiresIn: "1h" }
        );
       
        const confirmLink = `${process.env.FRONT_END_URL}/confirm-email-change?token=${token}`;
        
        // Contenu d'email amélioré pour éviter le spam
        const emailSubject = "Confirmez votre nouvelle adresse email";
        const emailText = `Bonjour,

Vous avez demandé à modifier votre adresse email sur ${process.env.COMPANY_NAME || "notre plateforme"}.

Pour confirmer ce changement, veuillez cliquer sur le lien ci-dessous :
${confirmLink}

Ce lien est valable pendant 1 heure pour des raisons de sécurité.

Si vous n'avez pas demandé cette modification, ignorez ce message.

Cordialement,
L'équipe ${process.env.COMPANY_NAME || "Support"}

---
Cet email a été envoyé automatiquement. Merci de ne pas y répondre.
Pour toute question, contactez-nous à ${process.env.SUPPORT_EMAIL}`;

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
              <h2 style="color: #333; margin: 0;">Confirmation d'email</h2>
            </div>
            
            <div style="background-color: white; padding: 30px; border: 1px solid #e9ecef;">
              <p>Bonjour,</p>
              
              <p>Vous avez demandé à modifier votre adresse email sur <strong>${process.env.COMPANY_NAME || "notre plateforme"}</strong>.</p>
              
              <p>Pour confirmer ce changement, veuillez cliquer sur le bouton ci-dessous :</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${confirmLink}" 
                   style="display: inline-block; background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                   Confirmer mon nouvel email
                </a>
              </div>
              
              <p><strong>Ce lien est valable pendant 1 heure</strong> pour des raisons de sécurité.</p>
              
              <p>Si vous n'avez pas demandé cette modification, ignorez ce message.</p>
              
              <p>Cordialement,<br>
              L'équipe Support Cyna</p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
              <p>Cet email a été envoyé automatiquement. Merci de ne pas y répondre.</p>
              <p>Pour toute question, contactez-nous à <a href="mailto:${process.env.SUPPORT_EMAIL}">${process.env.SUPPORT_EMAIL}</a></p>
            </div>
          </div>
        `;
       
        sendEmail(email, emailSubject, emailText, emailHtml)
          .then(() => {
            client.release();
            return res.status(200).json({ message: "Lien de confirmation envoyé à votre nouvel email." });
          })
          .catch((error) => {
            client.release();
            console.error("Erreur envoi email:", error);
            return res.status(500).json({ message: "Erreur lors de l'envoi de l'email." });
          });
      });
    });
  }
);


// Route pour confirmer le changement d'email
router.post("/confirm-email-change", 
  logActivity("Confirmation changement d'email"),
  [
    body("token").notEmpty().withMessage("Token requis."),
  ],
  validateRequest,
  (req, res) => {
    const { token } = req.body;
    
    try {
      // Vérifier et décoder le token
      const decoded = jwt.verify(token, process.env.EMAIL_CHANGE_SECRET);
      const { userId, newEmail } = decoded;
      
      getConnection((err, client) => {
        if (err) {
          return res.status(500).json({ message: "Erreur de connexion à la base de données." });
        }
        
        // Vérifier une dernière fois que l'email n'est pas déjà utilisé
        const checkQuery = `SELECT id_user FROM users WHERE email = ? AND id_user != ?`;
        client.query(checkQuery, [newEmail, userId], (err, result) => {
          if (err) {
            client.release();
            return res.status(500).json({ message: "Erreur vérification email." });
          }
          
          if (result.length > 0) {
            client.release();
            return res.status(400).json({ message: "Cet email est déjà utilisé." });
          }
          
          // Mettre à jour l'email dans la base de données
          const updateQuery = `UPDATE users SET email = ? WHERE id_user = ?`;
          client.query(updateQuery, [newEmail, userId], (err, result) => {
            if (err) {
              client.release();
              console.error("Erreur mise à jour email:", err);
              return res.status(500).json({ message: "Erreur lors de la mise à jour de l'email." });
            }
            
            if (result.affectedRows === 0) {
              client.release();
              return res.status(404).json({ message: "Utilisateur non trouvé." });
            }
            
            client.release();
            
            // Retourner une réponse avec mustReconnect pour déclencher la déconnexion
            return res.status(200).json({ 
              message: "Email modifié avec succès. Vous devez vous reconnecter.",
              mustReconnect: true 
            });
          });
        });
      });
      
    } catch (error) {
      console.error("Erreur vérification token:", error);
      
      // Différencier les types d'erreurs JWT
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: "Le lien de confirmation a expiré." });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: "Lien de confirmation invalide." });
      } else {
        return res.status(401).json({ message: "Lien invalide ou expiré." });
      }
    }
  }
);

// DELETE - Suppression du compte (avec authenticateToken)
router.delete("/me",
    authenticateToken,
    updateLastActivity,
    logActivity("Suppression du compte utilisateur"),
    (req, res) => {
        getConnection((err, client) => {
            if (err) return res.status(500).json({ message: "Erreur de connexion à la base de données." });
            const query = "DELETE FROM users WHERE id_user = ?";
            client.query(query, [req.user.id], (err, result) => {
                client.release();
                if (err) return res.status(500).json({ message: "Erreur lors de la suppression." });
                res.status(200).json({ message: "Compte utilisateur supprimé avec succès." });
            });
        });
    }
);

export default router;