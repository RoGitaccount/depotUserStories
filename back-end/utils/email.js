import nodemailer from "nodemailer";
import "dotenv/config";

async function sendEmail(to, subject, text, html = null) {
  try {
    
    console.log("Tentative d'envoi d'email à :", to);
    console.log("Sujet :", subject);
    console.log("Contenu :", text);
    
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        rejectUnauthorized: false,
        minVersion: "TLSv1.2",
      },
    });

    // Configuration des headers anti-spam
    const mailOptions = {
      from: {
        name: "Cyna",
        address: process.env.SUPPORT_EMAIL
      },
      to: to,
      subject: subject,
      text: text,
      html: html || generateHtmlVersion(text),
      headers: {
        'Return-Path': process.env.SUPPORT_EMAIL,
        'Reply-To': process.env.SUPPORT_EMAIL,
        'X-Mailer': 'NodeMailer',
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal',
        'Importance': 'Normal'
      },
      // Ajout d'un Message-ID unique
      messageId: generateMessageId(),
      // Catégorie d'email pour les statistiques
      category: 'transactional'
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Email envoyé:", result.messageId);
    return result;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

// Génère une version HTML à partir du texte
function generateHtmlVersion(text) {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmation d'email</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                background-color: #f8f9fa;
                padding: 20px;
                text-align: center;
                border-radius: 8px 8px 0 0;
            }
            .content {
                background-color: white;
                padding: 30px;
                border: 1px solid #e9ecef;
            }
            .button {
                display: inline-block;
                background-color: #007bff;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
            }
            .footer {
                background-color: #f8f9fa;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #666;
                border-radius: 0 0 8px 8px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>"Cyna"</h1>
        </div>
        <div class="content">
            ${formatVerificationCode(text)}
        </div>
        <div class="footer">
            <p>Cet email a été envoyé automatiquement pour des raisons de sécurité.</p>
            <p>Si vous n'avez pas demandé cette action, ignorez ce message.</p>
            <p>Pour toute question, contactez-nous à ${process.env.SUPPORT_EMAIL || process.env.EMAIL_USER}</p>
        </div>
    </body>
    </html>
  `;
}

function formatVerificationCode(text) {
  return text.replace(
    /Votre code de vérification est\s*:\s*(\d+)/i,
    (_, code) => `
       <div style="text-align: center; margin: 30px 0;">
        <p style="font-size: 18px;">Votre code de vérification est :</p>
        <p style="font-size: 32px; font-weight: bold; color: #007bff; margin: 10px 0;">${code}</p>
        <p style="font-size: 14px; color: #555;">Ce code est valable pendant 15 minutes.</p>
      </div>
      `
  ).replace(/\n/g, '<br>');
}

// Génère un Message-ID unique
function generateMessageId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  const domain = process.env.SUPPORT_EMAIL.split('@')[1];
  return `<${timestamp}.${random}@${domain}>`;
}

export { sendEmail };


// ________________________________
