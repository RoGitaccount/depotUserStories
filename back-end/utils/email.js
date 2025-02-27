import nodemailer from "nodemailer";
import { google } from "googleapis";
import "dotenv/config";

const OAuth2 = google.auth.OAuth2;

const oAuth2Client = new OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

async function sendEmail(to, subject, text) {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      host: "ssl0.ovh.net",
      port: 465,
      secure: true, // true pour le port 465
      auth: {
        user: process.env.EMAIL_USER, // votre adresse email OVH
        pass: process.env.EMAIL_PASSWORD // votre mot de passe email OVH
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent:", result);
    return result;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

export { sendEmail };
