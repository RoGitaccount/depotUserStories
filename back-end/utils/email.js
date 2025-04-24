import nodemailer from "nodemailer";
import { google } from "googleapis";
import "dotenv/config";

//const OAuth2 = google.auth.OAuth2;

// const oAuth2Client = new OAuth2(
//   process.env.CLIENT_ID,
//   process.env.CLIENT_SECRET,
//   process.env.REDIRECT_URI
// );

// oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

async function sendEmail(to, subject, text) {
  try {
    
    console.log("Tentative d'envoi d'email à :", to);
    console.log("Sujet :", subject);
    console.log("Contenu :", text);
    
    // const accessToken = await oAuth2Client.getAccessToken();
    // const transporter = nodemailer.createTransport({
    //   service: "gmail",
    //   auth: {
    //     type: " OAuth2",
    //     user: process.env.EMAIL_USER,
    //     clientId: process.env.CLIENT_ID,
    //     clientSecret: process.env.CLIENT_SECRET,
    //     refreshToken: process.env.REFRESH_TOKEN,
    //     accessToken: accessToken.token,
    //   },
    // });

    const transporter = nodemailer.createTransport({
      host: "vps-f2442ff7.vps.ovh.net",
      port: 465,
      secure: true, // true pour le port 465
      auth: {
        user: process.env.EMAIL_USER, // votre adresse email OVH
        pass: process.env.EMAIL_PASSWORD // votre mot de passe email OVH
      },
    });

    const mailOptions = {
      from: process.env.SUPPORT_EMAIL,
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
