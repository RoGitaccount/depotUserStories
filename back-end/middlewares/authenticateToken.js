import jwt from 'jsonwebtoken'
const secret_key = process.env.SECRET_KEY

// Middleware pour vérifier les JWT
export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"]; // Format attendu: "Bearer <token>"
  if (!authHeader) {
    return res.status(401).json({ message: "Token manquant Veuillez vous connecter." });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token manquant." });
  }

  jwt.verify(token, secret_key, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token invalide." });
    }
    req.user = user; // Ajout des informations utilisateur à l'objet req
    next();
  });
}
