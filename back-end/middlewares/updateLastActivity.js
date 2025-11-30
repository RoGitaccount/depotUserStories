import { getConnection } from "../queries/connect.js";

export function updateLastActivity(req, res, next) {
  if (!req.user || !req.user.id) {
    return next();
  }

  const userId = req.user.id;

  getConnection((err, client) => {
    if (err) {
      console.error("Erreur de connexion à la base de données :", err);
      return next();
    }

    const checkSql = "SELECT last_activity FROM users WHERE id_user = ?";
    client.query(checkSql, [userId], (err, results) => {
      if (err) {
        console.error("Erreur lors de la vérification de last_activity :", err);
        client.release();
        return next();
      }

      if (results.length === 0) {
        client.release();
        return next();
      }

      const lastActivity = results[0].last_activity;
      const now = new Date();
      const lastDate = new Date(lastActivity);
      const diffMinutes = (now - lastDate) / 1000 / 60;

      if (diffMinutes > 15) {
        const updateSql = "UPDATE users SET last_activity = NOW() WHERE id_user = ?";
        client.query(updateSql, [userId], (updateErr) => {
          if (updateErr) {
            console.error("Erreur lors de la mise à jour de last_activity :", updateErr);
          }
          client.release();
          next();
        });
      } else {
        client.release();
        next();
      }
    });
  });
}