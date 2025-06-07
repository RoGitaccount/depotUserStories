// import jwt from 'jsonwebtoken'
// const secret_key = process.env.SECRET_KEY

// // Middleware pour vérifier les JWT
// export function authenticateToken(req, res, next) {
//   const authHeader = req.headers["authorization"]; // Format attendu: "Bearer <token>"
//   if (!authHeader) {
//     return res.status(401).json({ message: "Token manquant Veuillez vous connecter." });
//   }

//   const token = authHeader.split(" ")[1];
//   if (!token) {
//     return res.status(401).json({ message: "Token manquant." });
//   }

//   jwt.verify(token, secret_key, (err, user) => {
//     if (err) {
//       return res.status(403).json({ message: "Token invalide." });
//     }
//     req.user = user; // Ajout des informations utilisateur à l'objet req
//     next();
//   });
// }


// ______ajout github____//

import jwt from 'jsonwebtoken';
import { getConnection } from "../queries/connect.js";
import { GetUserById } from '../queries/User.js';

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: "Token manquant. Veuillez vous connecter." });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token manquant." });
  }

  let decoded;
  try {
    // Décodage sans vérification pour obtenir l'id
    decoded = jwt.decode(token);
    if (!decoded || !decoded.id) {
      return res.status(400).json({ message: "Token invalide (structure)." });
    }
  } catch {
    return res.status(400).json({ message: "Token invalide." });
  }

  const client = getConnection();
  GetUserById(client, decoded.id, (err, result) => {
    if (err || !result || !result.exists) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    const user = result.results[0];

    if (!user.secretkey) {
      return res.status(500).json({ message: "Clé secrète manquante." });
    }

    // Vérifier le token avec la vraie secretkey de l'utilisateur
    jwt.verify(token, user.secretkey, (err, verifiedUser) => {
      if (err) {
        return res.status(403).json({ message: "Token invalide ou expiré." });
      }

      req.user = verifiedUser;
      next();
    });
  });
}
// ______