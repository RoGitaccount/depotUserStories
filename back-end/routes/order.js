import express from 'express';
import { getConnection } from '../queries/connect.js';
import { Clear_cart } from '../queries/cart.js';
import { Record_offer_usage, Has_user_used_offer } from '../queries/offer.js';
import { Insert_order, Insert_order_detail } from '../queries/order.js';
import { Upsert_payment } from '../queries/payment.js';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import Stripe from 'stripe';
import path from 'path';

const router = express.Router();
const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/process-success', async (req, res) => {
  const { sessionId } = req.body;
  let client;

  try {
    // 1. Récupérer la session Stripe
    const session = await stripeClient.checkout.sessions.retrieve(sessionId);

    const paymentIntent = await stripeClient.paymentIntents.retrieve(session.payment_intent);

    // Récupérer la méthode de paiement utilisée
    const paymentMethodId = paymentIntent.payment_method;
    const paymentMethod = await stripeClient.paymentMethods.retrieve(paymentMethodId);

    const methodeStripe = paymentMethod.type; // exemple: 'card', 'paypal', 'bancontact', etc.

    

    // 2. Récupérer les données des métadonnées
    const billingInfo = JSON.parse(session.metadata.billingInfo);
    const cartItems = JSON.parse(session.metadata.cartItems);
    const promoCode = session.metadata.promoCode;
    const initialAmount = parseFloat(session.metadata.initialAmount);
    const finalAmount = parseFloat(session.metadata.finalAmount);
    const id_promotion = session.metadata.id_promotion;
    const id_user = 1; // À remplacer par l'ID utilisateur réel

    client = getConnection();

    // 3. Générer la facture PDF dans un dossier dédié
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const doc = new PDFDocument();
    const safeSessionId = String(sessionId).replace(/[^a-zA-Z0-9_-]/g, '');
    const fileName = path.join(uploadsDir, `facture_${safeSessionId}.pdf`);
    const writeStream = fs.createWriteStream(fileName);

    doc.pipe(writeStream);

    // En-tête de la facture
    doc.fontSize(20).text('FACTURE', { align: 'center' });
    doc.moveDown();

    // Informations client
    doc.fontSize(12)
      .text(`Date: ${new Date().toLocaleDateString()}`)
      .text(`Client: ${billingInfo.nom} ${billingInfo.prenom}`)
      .text(`Email: ${billingInfo.email}`)
      .text(`Téléphone: ${billingInfo.telephone}`)
      .moveDown()
      .text('Adresse de facturation:')
      .text(billingInfo.nomEntreprise)
      .text(`N° TVA: ${billingInfo.numeroTva}`)
      .text(billingInfo.adresse)
      .text(billingInfo.complementAdresse || '')
      .text(`${billingInfo.codePostal} ${billingInfo.ville}`)
      .text(`${billingInfo.region}, ${billingInfo.pays}`)
      .moveDown();

    // Articles
    doc.text('Détails de la commande:', { underline: true }).moveDown();

    cartItems.forEach(item => {
      const prix = parseFloat(item.prix);
      if (!isNaN(prix)) {
        doc.text(`${item.titre} - ${prix.toFixed(2)}€`);
      } else {
        console.warn(`Prix invalide pour l'article ${item.titre}: ${item.prix}`);
      }
    });

    // Total et réduction
    doc.moveDown()
      .text(`Sous-total: ${initialAmount.toFixed(2)}€`);

    if (promoCode) {
      doc.text(`Réduction (${promoCode}): -${(initialAmount - finalAmount).toFixed(2)}€`);
    }

    doc.fontSize(14)
      .text(`Total final: ${finalAmount.toFixed(2)}€`, { bold: true });

    // Pied de page
    doc.moveDown(2)
      .fontSize(10)
      .text('Merci pour votre confiance !', { align: 'center' });

    // Finaliser le PDF
    doc.end();

    // 4. Attendre que le PDF soit généré avant de continuer
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    // 5. Transaction SQL pour commandes, détails, paiements, promo
    await new Promise((resolve, reject) => {
      client.beginTransaction(async (err) => {
        if (err) return reject(err);

        try {
          // 6. Vider le panier
          await new Promise((resolve, reject) => {
            Clear_cart(client, id_user, (err) => {
              if (err) reject(err);
              else resolve();
            });
          });

          // 7. Déterminer le statut de la commande et du paiement selon Stripe
          let statutCommande = 'payée';
          let statutPaiement = 'réussi';
          if (!session || session.payment_status !== 'paid') {
            statutCommande = 'échouée';
            statutPaiement = 'échoué';
          }

          // Arrondir les montants à 2 décimales AVANT l'insertion
          const montant_total = Number(finalAmount.toFixed(2));
          const montant_reduction = Number((initialAmount - finalAmount).toFixed(2));
          
          // 8. Enregistrer la commande
          const commandeResult = await new Promise((resolve, reject) => {
            Insert_order(
              client,
              {
                id_user,
                montant_total,
                montant_reduction,
                id_promotion: id_promotion || null,
                statut: statutCommande
              },
              (err, result) => {
                if (err) reject(err);
                else resolve(result);
              }
            );
          });
          const id_commande = commandeResult.insertId;

          // 9. Enregistrer les détails de la commande
          for (const item of cartItems) {
            await new Promise((resolve, reject) => {
              Insert_order_detail(
                client,
                {
                  id_commande,
                  id_produit: item.id_produit,
                  prix_unitaire: item.prix
                },
                (err) => {
                  if (err) reject(err);
                  else resolve();
                }
              );
            });
          }

          // 10. Enregistrer le paiement
          await new Promise((resolve, reject) => {
            Upsert_payment(
              client,
              {
                id_commande,
                methode_paiement: methodeStripe,
                statut_paiement: statutPaiement,
                montant_transaction: Number(finalAmount.toFixed(2)),
                session_stripe_id: sessionId,
                transaction_id: session?.payment_intent || null
              },
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });

          // 11. Enregistrer l'utilisation du code promo si besoin
          if (id_promotion) {
            await new Promise((resolve, reject) => {
              Has_user_used_offer(client, id_user, id_promotion, (err, hasUsed) => {
                if (err) return reject(err);
                if (hasUsed) return resolve();
                Record_offer_usage(client, id_user, id_promotion, (err) => {
                  if (err) reject(err);
                  else resolve();
                });
              });
            });
          }

          // 12. Commit de la transaction
          client.commit((err) => {
            if (err) reject(err);
            else resolve();
          });
        } catch (error) {
          client.rollback(() => reject(error));
        }
      });
    });

    // 13. Supprimer le PDF généré (optionel)
    if (fs.existsSync(fileName)) {
      fs.unlinkSync(fileName);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Erreur lors du traitement de la commande:', error);
    if (client) {
      try {
        await new Promise(resolve => client.rollback(() => resolve()));
      } catch (rollbackError) {
        console.error('Erreur lors du rollback:', rollbackError);
      }
    }
    res.status(500).json({ error: 'Erreur lors du traitement de la commande' });
  } finally {
    if (client) {
      client.end();
    }
  }
});

export default router;