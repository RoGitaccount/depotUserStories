import express from 'express';
import { body } from 'express-validator';
import validateRequest from '../middlewares/validateRequest.js';
import { sendEmail } from '../utils/email.js';

const router = express.Router();

router.post(
  '/',
  [
    body('email').isEmail().withMessage('Email invalide'),
    body('subject').isLength({ min: 3 }).withMessage('Sujet trop court'),
    body('message').isLength({ min: 10 }).withMessage('Message trop court'),
  ],
  validateRequest,
  async (req, res) => {
    const { email, subject, message } = req.body;

    try {
      const supportEmail = process.env.SUPPORT_EMAIL;
      const fullMessage = `Message de : ${email}\n\nSujet : ${subject}\n\n${message}`;

      await sendEmail(supportEmail, subject, fullMessage);
      res.status(200).json({ success: true, message: 'Message envoyé à l’équipe de support' });
    } catch (error) {
      console.error('Erreur lors de l’envoi de l’email :', error);
      res.status(500).json({ error: 'Échec de l’envoi de l’email' });
    }
  }
);

export default router;

