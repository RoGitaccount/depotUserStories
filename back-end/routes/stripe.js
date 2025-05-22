
import "dotenv/config";

import express from 'express';
import Stripe from 'stripe';
import { getConnection } from '../queries/connect.js';
import { Upsert_billing_info } from '../queries/payment.js';
import { Update_user_phone } from '../queries/User.js';


const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/create-checkout-session', async (req, res) => {
  const { cartItems, totalAmount, initialAmount, promoCode, billingInfo, id_promotion } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Commande',
              description: promoCode 
                ? `Total initial : ${initialAmount.toFixed(2)}€ - Réduction avec code promo : ${promoCode}`
                : `Total de la commande`
            },
            unit_amount: Math.round(totalAmount * 100), // Montant après réduction en centimes
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: {
        billingInfo: JSON.stringify(billingInfo),
        promoCode: promoCode || '',
        initialAmount: initialAmount,
        finalAmount: totalAmount,
        cartItems: JSON.stringify(cartItems),
        id_promotion: id_promotion ? String(id_promotion) : ''
      },
      customer_email: billingInfo?.email || undefined,
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Erreur lors de la création de la session Stripe :', error);
    res.status(500).json({ error: 'Erreur lors de la création de la session de paiement' });
  }
});




export default router;
