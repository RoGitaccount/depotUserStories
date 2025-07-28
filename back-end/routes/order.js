import express from 'express';
import { getConnection } from '../queries/connect.js';
import { Clear_cart } from '../queries/cart.js';
import { Record_offer_usage, Has_user_used_offer } from '../queries/offer.js';
import { Upsert_payment } from '../queries/payment.js';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import Stripe from 'stripe';
import path from 'path';
import { authenticateToken } from '../middlewares/authenticateToken.js';
import { updateLastActivity } from '../middlewares/updateLastActivity.js';
import { logActivity } from '../middlewares/logActivity.js';
import { isAdmin } from "../middlewares/isAdmin.js";
import { 
  Insert_order,
  Insert_order_detail,
  Get_all_orders,
  Get_user_orders,
  Get_order_details,
  Update_order_status,
  Delete_order_details
} from "../queries/order.js";
import { GetUserById } from '../queries/User.js';

const router = express.Router();
const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post(
  '/process-success',
  authenticateToken,
  updateLastActivity,
  logActivity("Tentative de paiement via stripe"),
  async (req, res) => {
    const { sessionId } = req.body;

    getConnection(async (err, client) => {
      if (err) {
        return res.status(500).json({ error: "Erreur de connexion à la base de données" });
      }

      try {
        // 1. Récupérer la session Stripe
        const session = await stripeClient.checkout.sessions.retrieve(sessionId);
        const paymentIntent = await stripeClient.paymentIntents.retrieve(session.payment_intent);
        const paymentMethodId = paymentIntent.payment_method;
        const paymentMethod = await stripeClient.paymentMethods.retrieve(paymentMethodId);
        const methodeStripe = paymentMethod.type;

        // 2. Récupérer les données des métadonnées
        const billingInfo = JSON.parse(session.metadata.billingInfo);
        const promoCode = session.metadata.promoCode;
        const initialAmount = parseFloat(session.metadata.initialAmount);
        const finalAmount = parseFloat(session.metadata.finalAmount);
        const id_promotion = session.metadata.id_promotion;
        const id_user = req.user.id;

        // 3. Récupérer le panier depuis la BDD
        let cartItems = [];
        await new Promise((resolve, reject) => {
          client.query(
            "SELECT cart_items FROM paniers_temp WHERE session_id = ? AND id_user = ?",
            [sessionId, id_user],
            (err, results) => {
              if (err || results.length === 0) return reject("Panier temporaire non trouvé");
              let cart = results[0].cart_items;
              // Correction ici : si déjà objet, pas besoin de parser
              if (typeof cart === "string") {
                try {
                  cartItems = JSON.parse(cart);
                } catch (e) {
                  return reject("Erreur de parsing du panier");
                }
              } else {
                cartItems = cart;
              }
              resolve();
            }
          );
        });

        // 4. Générer la facture PDF dans un dossier dédié
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

        // 5. Attendre que le PDF soit généré avant de continuer
        await new Promise((resolve, reject) => {
          writeStream.on('finish', resolve);
          writeStream.on('error', reject);
        });

        // // 6. Transaction SQL pour commandes, détails, paiements, promo
        // await new Promise((resolve, reject) => {
        //   client.beginTransaction(async (err) => {
        //     if (err) return reject(err);

        //     try {
        //       // 7. Vider le panier
        //       await new Promise((resolve, reject) => {
        //         Clear_cart(client, id_user, (err) => {
        //           if (err) reject(err);
        //           else resolve();
        //         });
        //       });

        //       // 8. Déterminer le statut de la commande et du paiement selon Stripe
        //       let statutCommande = 'payée';
        //       let statutPaiement = 'réussi';
        //       if (!session || session.payment_status !== 'paid') {
        //         statutCommande = 'échouée';
        //         statutPaiement = 'échoué';
        //       }

        //       // Arrondir les montants à 2 décimales AVANT l'insertion
        //       const montant_total = Number(finalAmount.toFixed(2));
        //       const montant_reduction = Number((initialAmount - finalAmount).toFixed(2));

        //       //--------Ajout--------//
        //       const userInfo = await new Promise((resolve, reject) => {
        //         GetUserById(client, id_user, (err, data) => {
        //         if (err) return reject(err);
        //         if (!data.exists || !data.results.length) return resolve({ nom: null, email: null });

        //         const user = data.results[0];
        //         resolve({ nom: user.nom, email: user.email });
        //         });
        //       });

        //       const email_snapshot = userInfo.email;
        //       const nom_snapshot = userInfo.nom;
        //       //------------------//


        //       // 9. Enregistrer la commande
        //       const commandeResult = await new Promise((resolve, reject) => {
        //         // Insert_order(
        //         //   client,
        //         //   {
        //         //     id_user,
        //         //     montant_total,
        //         //     montant_reduction,
        //         //     id_promotion: id_promotion || null,
        //         //     statut: statutCommande
        //         //   },
        //         //   (err, result) => {
        //         //     if (err) reject(err);
        //         //     else resolve(result);
        //         //   }
        //         // );
        //    Insert_order(
        //     client,
        //     {
        //       id_user,
        //       montant_total,
        //       montant_reduction,
        //       id_promotion: id_promotion || null,
        //       statut: statutCommande,
        //       email_snapshot: userInfo.email,
        //       nom_snapshot: userInfo.nom,
        //       // Ajout de tous les champs de snapshot depuis billingInfo
        //       adresse_snapshot: billingInfo.adresse,
        //       ville_snapshot: billingInfo.ville,
        //       code_postal_snapshot: billingInfo.codePostal,
        //       pays_snapshot: billingInfo.pays,
        //       telephone_snapshot: billingInfo.telephone,
        //       complement_adresse_snapshot: billingInfo.complementAdresse,
        //       region_snapshot: billingInfo.region,
        //       nom_entreprise_snapshot: billingInfo.nomEntreprise,
        //       numero_tva_snapshot: billingInfo.numeroTva
        //     },
        //     (err, result) => {
        //       if (err) reject(err);
        //       else resolve(result);
        //     }
        //   );
        // });
        //       const id_commande = commandeResult.insertId;
        //       const facture_token = commandeResult.facture_token;

        //       // 10. Enregistrer les détails de la commande
        //       for (const item of cartItems) {
        //         await new Promise((resolve, reject) => {
        //           Insert_order_detail(
        //             client,
        //             {
        //               id_commande,
        //               id_produit: item.id_produit,
        //               prix_unitaire: item.prix
        //             },
        //             (err) => {
        //               if (err) reject(err);
        //               else resolve();
        //             }
        //           );
        //         });
        //       }

        //       // 11. Enregistrer le paiement
        //       await new Promise((resolve, reject) => {
        //         Upsert_payment(
        //           client,
        //           {
        //             id_commande,
        //             methode_paiement: methodeStripe,
        //             statut_paiement: statutPaiement,
        //             montant_transaction: Number(finalAmount.toFixed(2)),
        //             session_stripe_id: sessionId,
        //             transaction_id: session?.payment_intent || null
        //           },
        //           (err) => {
        //             if (err) reject(err);
        //             else resolve();
        //           }
        //         );
        //       });

        //       // 12. Enregistrer l'utilisation du code promo si besoin
        //       if (id_promotion) {
        //         await new Promise((resolve, reject) => {
        //           Has_user_used_offer(client, id_user, id_promotion, (err, hasUsed) => {
        //             if (err) return reject(err);
        //             if (hasUsed) return resolve();
        //             Record_offer_usage(client, id_user, id_promotion, (err) => {
        //               if (err) reject(err);
        //               else resolve();
        //             });
        //           });
        //         });
        //       }

        //       // 13. Commit de la transaction
        //       client.commit((err) => {
        //         if (err) reject(err);
        //         else resolve();
        //       });
        //     } catch (error) {
        //       client.rollback(() => reject(error));
        //     }
        //   });
        // });

        // // res.json({ success: true });
        // res.json({ success: true, id_commande, facture_token });

// Déclarez les variables avant la transaction
let id_commande;
let facture_token;

// 6. Transaction SQL pour commandes, détails, paiements, promo
await new Promise((resolve, reject) => {
  client.beginTransaction(async (err) => {
    if (err) return reject(err);

    try {
      // 7. Vider le panier
      await new Promise((resolve, reject) => {
        Clear_cart(client, id_user, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // 8. Déterminer le statut de la commande et du paiement selon Stripe
      let statutCommande = 'payée';
      let statutPaiement = 'réussi';
      if (!session || session.payment_status !== 'paid') {
        statutCommande = 'échouée';
        statutPaiement = 'échoué';
      }

      // Arrondir les montants à 2 décimales AVANT l'insertion
      const montant_total = Number(finalAmount.toFixed(2));
      const montant_reduction = Number((initialAmount - finalAmount).toFixed(2));

      //--------Ajout--------//
      const userInfo = await new Promise((resolve, reject) => {
        GetUserById(client, id_user, (err, data) => {
          if (err) return reject(err);
          if (!data.exists || !data.results.length) return resolve({ nom: null, email: null });

          const user = data.results[0];
          resolve({ nom: user.nom, email: user.email });
        });
      });

      const email_snapshot = userInfo.email;
      const nom_snapshot = userInfo.nom;
      //------------------//

      // 9. Enregistrer la commande
      const commandeResult = await new Promise((resolve, reject) => {
        Insert_order(
          client,
          {
            id_user,
            montant_total,
            montant_reduction,
            id_promotion: id_promotion || null,
            statut: statutCommande,
            email_snapshot: userInfo.email,
            nom_snapshot: userInfo.nom,
            // Ajout de tous les champs de snapshot depuis billingInfo
            adresse_snapshot: billingInfo.adresse,
            ville_snapshot: billingInfo.ville,
            code_postal_snapshot: billingInfo.codePostal,
            pays_snapshot: billingInfo.pays,
            telephone_snapshot: billingInfo.telephone,
            complement_adresse_snapshot: billingInfo.complementAdresse,
            region_snapshot: billingInfo.region,
            nom_entreprise_snapshot: billingInfo.nomEntreprise,
            numero_tva_snapshot: billingInfo.numeroTva
          },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
      });
      
      // Assigner aux variables déclarées en dehors de la transaction
      id_commande = commandeResult.insertId;
      facture_token = commandeResult.facture_token;

      // 10. Enregistrer les détails de la commande
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

      // 11. Enregistrer le paiement
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

      // 12. Enregistrer l'utilisation du code promo si besoin
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

      //12bis Supprimer le panier temporaire APRÈS tous les enregistrements réussis
      await new Promise((resolve, reject) => {
        client.query(
          "DELETE FROM paniers_temp WHERE session_id = ? AND id_user = ?",
          [sessionId, id_user],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });


      // 13. Commit de la transaction
      client.commit((err) => {
        if (err) reject(err);
        else resolve();
      });
    } catch (error) {
      client.rollback(() => reject(error));
    }
  });
});

// Maintenant id_commande et facture_token sont accessibles ici
res.json({ success: true, id_commande, facture_token });
      } catch (error) {
        console.error('Erreur lors du traitement de la commande:', error);

        if (req.body.sessionId) {
          try {
            const session = await stripeClient.checkout.sessions.retrieve(req.body.sessionId);
            if (session && session.payment_status === 'paid') {
              await stripeClient.refunds.create({
                payment_intent: session.payment_intent,
                reason: 'requested_by_customer',
              });
              console.log('Paiement remboursé automatiquement car erreur process-success');
            }
          } catch (refundError) {
            console.error('Erreur lors du remboursement Stripe:', refundError);
          }
        }

        try {
          await new Promise(resolve => client.rollback(() => resolve()));
        } catch (rollbackError) {
          console.error('Erreur lors du rollback:', rollbackError);
        }

        res.status(500).json({ error: 'Erreur lors du traitement de la commande' });
      } finally {
        client.release();
      }
    });
  }
);

// 🔹 Ajouter une commande
router.post(
  "/add",
  authenticateToken,
  updateLastActivity,
  logActivity("Ajout d'une commande"),
  (req, res) => {
    getConnection((err, client) => {
      if (err) return res.status(500).json({ error: "Erreur de connexion à la base de données" });
      const { id_user, montant_total, montant_reduction, id_promotion, statut, details } = req.body;

      Insert_order(client, { id_user, montant_total, montant_reduction, id_promotion, statut }, (err, result) => {
        if (err) {
          client.release();
          return res.status(500).json({ error: "Erreur insertion commande", details: err });
        }

        const id_commande = result.insertId;

        const promises = details.map(detail =>
          new Promise((resolve, reject) => {
            Insert_order_detail(client, { id_commande, ...detail }, (err, res) => {
              if (err) reject(err);
              else resolve(res);
            });
          })
        );

        Promise.all(promises)
          .then(() => {
            client.release();
            res.status(201).json({ success: true, id_commande });
          })
          .catch((e) => {
            client.release();
            res.status(500).json({ error: "Erreur insertion détails", details: e });
          });
      });
    });
  }
);

// 🔹 Récupérer toutes les commandes (admin)
router.get(
  "/",
  authenticateToken,
  updateLastActivity,
  logActivity("Récupération de toutes les commandes"),
  isAdmin,
  (req, res) => {
    getConnection((err, client) => {
      if (err) return res.status(500).json({ error: "Erreur de connexion à la base de données" });
      Get_all_orders(client, (err, results) => {
        client.release();
        if (err) return res.status(500).json({ error: "Erreur récupération commandes", details: err });
        res.json(results);
      });
    });
  }
);

// 🔹 Récupérer les commandes d'un utilisateur
router.get(
  "/user/:id",
  authenticateToken,
  updateLastActivity,
  logActivity("Récupération des commandes utilisateur"),
  (req, res) => {
    getConnection((err, client) => {
      if (err) return res.status(500).json({ error: "Erreur de connexion à la base de données" });
      Get_user_orders(client, req.params.id, (err, results) => {
        client.release();
        if (err) return res.status(500).json({ error: "Erreur récupération commandes", details: err });
        res.json(results);
      });
    });
  }
);

// 🔹 Récupérer les détails d'une commande
router.get(
  "/details/:id_commande",
  authenticateToken,
  updateLastActivity,
  logActivity("Récupération des détails d'une commande"),
  (req, res) => {
    getConnection((err, client) => {
      if (err) return res.status(500).json({ error: "Erreur de connexion à la base de données" });
      Get_order_details(client, req.params.id_commande, (err, results) => {
        client.release();
        if (err) return res.status(500).json({ error: "Erreur détails commande", details: err });
        res.json(results);
      });
    });
  }
);

// 🔹 Mettre à jour une commande
router.put(
  "/update/:id_commande",
  authenticateToken,
  updateLastActivity,
  logActivity("Mise à jour d'une commande"),
  isAdmin,
  (req, res) => {
    getConnection((err, client) => {
      if (err) return res.status(500).json({ error: "Erreur de connexion à la base de données" });
      const { statut, montant_total } = req.body;
      Update_order_status(client, req.params.id_commande, montant_total, statut, (err, result) => {
        client.release();
        if (err) return res.status(500).json({ error: "Erreur MAJ commande", details: err });
        res.json({ success: true });
      });
    });
  }
);

// 🔹 Supprimer les détails d'une commande (ex: annulation)
router.delete(
  "/details/:id_commande",
  authenticateToken,
  updateLastActivity,
  logActivity("Suppression des détails d'une commande"),
  isAdmin,
  (req, res) => {
    getConnection((err, client) => {
      if (err) return res.status(500).json({ error: "Erreur de connexion à la base de données" });
      Delete_order_details(client, req.params.id_commande, (err, result) => {
        client.release();
        if (err) return res.status(500).json({ error: "Erreur suppression détails", details: err });
        res.json({ success: true });
      });
    });
  }
);

export default router;