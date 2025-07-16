// import jwt from 'jsonwebtoken';
// import { getConnection } from "../queries/connect.js";
// import { GetUserById } from '../queries/User.js';

// export async function authenticateToken(req, res, next) {

//   const token = req.cookies.token;  // <-- Récupération dans cookie
//     if (!token) {
//       return res.status(401).json({ message: "Token manquant. Veuillez vous connecter." });
//     }

//   let decoded;
//   try {
//     decoded = jwt.decode(token);
//     if (!decoded || !decoded.id) {
//       return res.status(400).json({ message: "Token invalide (structure)." });
//     }
//   } catch {
//     return res.status(400).json({ message: "Token invalide." });
//   }

//   getConnection((err, client) => {
//     if (err) {
//       return res.status(500).json({ message: "Erreur de connexion à la base de données" });
//     }
//     GetUserById(client, decoded.id, (err, result) => {
//       client.release();
//       if (err || !result || !result.exists) {
//         return res.status(404).json({ message: "Utilisateur introuvable." });
//       }

//       const user = result.results[0];

//       if (!user.secretkey) {
//         return res.status(500).json({ message: "Clé secrète manquante." });
//       }

// jwt.verify(token, user.secretkey, (err, verifiedUser) => {
//   if (err) {
//     console.error("Erreur de vérification JWT :", err.name, "-", err.message);
//     return res.status(401).json({ message: "Token invalide ou expiré." });
//   }

//   console.log("Payload JWT vérifié avec succès :", verifiedUser);
//   req.user = verifiedUser;
//   next();
//  });
//     });
//   });
// }


import jwt from 'jsonwebtoken';
import { getConnection } from "../queries/connect.js";
import { GetUserById } from '../queries/User.js';
import { decrypt } from '../utils/crypt.js';

export async function authenticateToken(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ 
      message: "Token manquant. Veuillez vous connecter." 
    });
  }

  let decoded;
  try {
    // Décoder le token sans vérification pour obtenir l'ID utilisateur
    decoded = jwt.decode(token);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ 
        message: "Token invalide ou expiré." 
      });
    }
  } catch (error) {
    return res.status(401).json({ 
      message: "Token invalide ou expiré." 
    });
  }

  getConnection((err, client) => {
    if (err) {
      return res.status(500).json({ 
        message: "Erreur de connexion à la base de données" 
      });
    }

    GetUserById(client, decoded.id, (err, result) => {
      client.release();
      
      if (err || !result || !result.exists) {
        return res.status(404).json({ 
          message: "Utilisateur introuvable." 
        });
      }

      const user = result.results[0];
      
      if (!user.secretkey) {
        return res.status(500).json({ 
          message: "Clé secrète manquante." 
        });
      }

      // Vérifier le token avec la clé secrète de l'utilisateur
      jwt.verify(token, user.secretkey, (err, verifiedUser) => {
        if (err) {
          console.error("Erreur de vérification JWT :", err.name, "-", err.message);
          return res.status(401).json({ 
            message: "Token invalide ou expiré." 
          });
        }

        console.log("Payload JWT vérifié avec succès :", verifiedUser);
        req.user = verifiedUser;
        next();
      });
    });
  });
}