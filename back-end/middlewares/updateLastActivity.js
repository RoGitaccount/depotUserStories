import { getConnection } from "../queries/connect.js";

export async function updateLastActivity(req, res, next) {
  if (!req.user || !req.user.id_user) {
    return next();
  }

  const userId = req.user.id_user;
  const connection = getConnection();

  const checkSql = "SELECT last_activity FROM users WHERE id_user = ?";
  connection.query(checkSql, [userId], (err, results) => {
    if (err) {
      console.error("Erreur lors de la vérification de last_activity :", err);
      connection.end();
      return next();
    }

    if (results.length === 0) {
      connection.end();
      return next();
    }

    const lastActivity = results[0].last_activity;
    const now = new Date();
    const lastDate = new Date(lastActivity);
    const diffMinutes = (now - lastDate) / 1000 / 60;

    if (diffMinutes > 15) {
      const updateSql = "UPDATE users SET last_activity = NOW() WHERE id_user = ?";
      connection.query(updateSql, [userId], (updateErr) => {
        if (updateErr) {
          console.error("Erreur lors de la mise à jour de last_activity :", updateErr);
        }
        connection.end();
        next();
      });
    } else {
      connection.end();
      next();
    }
  });
}