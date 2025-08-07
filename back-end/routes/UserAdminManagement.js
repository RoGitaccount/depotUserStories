import express from 'express';
import {
    GetAllUsers,
    Update_user_info,
    Update_user_phone,
    Delete_user,
} from '../queries/User.js';
import { getConnection } from "../queries/connect.js";
import { authenticateToken } from '../middlewares/authenticateToken.js';
import { isAdmin } from '../middlewares/isAdmin.js';
import { updateLastActivity } from '../middlewares/updateLastActivity.js';
import { logActivity } from '../middlewares/logActivity.js';
import PDFDocument from 'pdfkit';



const router = express.Router();

// GET - Liste des utilisateurs (admin uniquement)
router.get("/",
    authenticateToken,
    updateLastActivity,
    logActivity("Récupération de tous les utilisateurs"),
    isAdmin,
    (req, res) => {
        getConnection((err, client) => {
            if (err) {
                console.error("Erreur récupération utilisateurs (connection) :", err);
                return res.status(500).json({ message: "Erreur serveur" });
            }
            GetAllUsers(client, (err, users) => {
                client.release();
                if (err) {
                    console.error("Erreur récupération utilisateurs :", err);
                    return res.status(500).json({ message: "Erreur serveur" });
                }
                res.json(users);
            });
        });
    }
);

// PUT - Modifier un utilisateur (admin uniquement)
router.put("/update/:id",
    authenticateToken,
    updateLastActivity,
    logActivity("Modification d'un utilisateur"),
    isAdmin,
    (req, res) => {
        const { id } = req.params;
        const { nom, prenom, role, email, telephone } = req.body;

        getConnection((err, client) => {
            if (err) {
                console.error("Erreur mise à jour utilisateur (connection) :", err);
                return res.status(500).json({ message: "Erreur serveur" });
            }
            Update_user_info(client, id, { nom, prenom, role, email }, (err) => {
                if (err) {
                    client.release();
                    console.error("Erreur mise à jour infos utilisateur :", err);
                    return res.status(500).json({ message: "Erreur serveur" });
                }
                if (telephone !== undefined) {
                    Update_user_phone(client, id, telephone, (err2) => {
                        client.release();
                        if (err2) {
                            console.error("Erreur mise à jour téléphone utilisateur :", err2);
                            return res.status(500).json({ message: "Erreur serveur" });
                        }
                        res.json({ message: "Utilisateur mis à jour avec succès" });
                    });
                } else {
                    client.release();
                    res.json({ message: "Utilisateur mis à jour avec succès" });
                }
            });
        });
    }
);

// DELETE - Supprimer un utilisateur (admin uniquement)
router.delete("/delete/:id",
    authenticateToken,
    updateLastActivity,
    logActivity("Suppression d'un utilisateur"),
    isAdmin,
    (req, res) => {
        const { id } = req.params;
        getConnection((err, client) => {
            if (err) {
                console.error("Erreur suppression utilisateur (connection) :", err);
                return res.status(500).json({ message: "Erreur serveur" });
            }
            Delete_user(client, id, (err) => {
                client.release();
                if (err) {
                    console.error("Erreur suppression utilisateur :", err);
                    return res.status(500).json({ message: "Erreur serveur" });
                }
                res.json({ message: "Utilisateur supprimé avec succès" });
            });
        });
    }
);

// route pour recupérer sa facture (dispo pour l'utilisateur (en telechargement retirer facture param qui est en token) ou l'admin garder le param pour l'admin)
router.get('/facture/:facture_token',
  authenticateToken,
  updateLastActivity,
  logActivity("Récupération de la facture"),
  (req, res) => {
  const { facture_token } = req.params;
  const userId = req.user.id; // récupère l'id de l'utilisateur connecté
  
  getConnection((err, client) => {
    if (err) {
      console.error('Erreur de connexion DB:', err);
      return res.status(500).json({ error: "Erreur DB" });
    }
    
    // Récupère la commande et ses détails
    client.query(
      'SELECT * FROM commandes WHERE facture_token = ?',
      [facture_token],
      (err, commandes) => {
        if (err) {
          console.error('Erreur lors de la récupération de la commande:', err);
          client.release();
          return res.status(500).json({ error: "Erreur lors de la récupération de la commande" });
        }
        
        if (commandes.length === 0) {
          client.release();
          return res.status(404).json({ error: "Facture introuvable" });
        }
        
        const commande = commandes[0];

        // Vérifie que la commande appartient à l'utilisateur connecté
          if (commande.id_user !== userId && !req.user.isAdmin) {
            client.release();
            return res.status(403).json({ error: "Accès interdit" });
          }
        
        // Récupère les détails de la commande (produits)
        client.query(
          `SELECT d.prix_unitaire, p.titre, p.description
           FROM details_commandes d
           JOIN produits p ON d.id_produit = p.id_produit
           WHERE d.id_commande = ?`,
          [commande.id_commande],
          (err, details) => {
            client.release();
            
            if (err) {
              console.error('Erreur lors de la récupération des détails:', err);
              return res.status(500).json({ error: "Erreur lors de la récupération des détails" });
            }
            
            try {
              // Génération du PDF
              const doc = new PDFDocument({ margin: 40 });
              res.setHeader('Content-Type', 'application/pdf');
              res.setHeader('Content-Disposition', `inline; filename="facture_${facture_token}.pdf"`);
              doc.pipe(res);
              
              // En-tête
              doc.fontSize(20).text('FACTURE', { align: 'center' });
              doc.moveDown();
              
              // Informations de base
              doc.fontSize(12)
                .text(`Date : ${new Date(commande.date_commande).toLocaleDateString('fr-FR')}`)
                .text(`Commande n° : ${commande.id_commande}`)
                .moveDown();
              
              // Informations client
              doc.text(`Client : ${commande.nom_snapshot}`)
                .text(`Email : ${commande.email_snapshot}`)
                .text(`Téléphone : ${commande.telephone_snapshot}`)
                .moveDown();
              
              // Adresse de facturation
              doc.text('Adresse de facturation :')
                .text(commande.nom_entreprise_snapshot)
                .text(`N° TVA : ${commande.numero_tva_snapshot}`)
                .text(commande.adresse_snapshot);
              
              // Complément d'adresse (optionnel)
              if (commande.complement_adresse_snapshot) {
                doc.text(commande.complement_adresse_snapshot);
              }
              
              doc.text(`${commande.code_postal_snapshot} ${commande.ville_snapshot}`)
                .text(`${commande.region_snapshot}, ${commande.pays_snapshot}`)
                .moveDown();
              
              // Détails de la commande
              doc.fontSize(14).text('Détails de la commande :');
              doc.moveDown(0.5);
              
              if (details.length === 0) {
                doc.fontSize(12).text('Aucun produit.');
              } else {
                details.forEach((item, idx) => {
                  doc.fontSize(12)
                    .text(`${idx + 1}. ${item.titre}`)
                    .text(`   ${item.description || 'Pas de description'}`)
                    .text(`   Prix unitaire : ${parseFloat(item.prix_unitaire).toFixed(2)} €`)
                    .moveDown(0.5);
                });
              }
              
              doc.moveDown();
              
              // Totaux
              const montantTotal = parseFloat(commande.montant_total);
              const montantReduction = parseFloat(commande.montant_reduction || 0);
              
              if (montantReduction > 0) {
                const montantInitial = montantTotal + montantReduction;
                doc.fontSize(12)
                  .text(`Sous-total : ${montantInitial.toFixed(2)} €`)
                  .text(`Réduction : -${montantReduction.toFixed(2)} €`);
              }
              
              doc.fontSize(14)
                .text(`Montant total : ${montantTotal.toFixed(2)} €`, { 
                  align: 'right',
                  width: 500
                });
              
              // Pied de page
              doc.moveDown(2)
                .fontSize(10)
                .text('Merci pour votre confiance !', { align: 'center' });
              
              doc.end();
              
            } catch (pdfError) {
              console.error('Erreur lors de la génération du PDF:', pdfError);
              if (!res.headersSent) {
                res.status(500).json({ error: "Erreur lors de la génération du PDF" });
              }
            }
          }
        );
      }
    );
  });
});

export default router;