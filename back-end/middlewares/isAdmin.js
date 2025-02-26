// Middleware pour vérifier si l'utilisateur est un admin

export function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Accès interdit, rôle insuffisant' });
  }
}
