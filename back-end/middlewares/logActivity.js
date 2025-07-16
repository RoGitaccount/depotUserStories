import { getConnection } from "../queries/connect.js";

export function logActivity(activite = null) {
  return function (req, res, next) {
    const originalSend = res.send;

    res.send = function (body) {
      if (!req.user || !req.user.id) return originalSend.apply(res, arguments);

      // Logger en asynchrone, sans jamais rappeler res.send()
      getConnection((err, client) => {
        if (err) {
          console.error("Erreur de connexion à la base de données :", err);
          return;
        }

        const log = {
          id_user: req.user.id,
          endpoint: req.originalUrl,
          methode: req.method,
          statut: res.statusCode,
          activite: activite || `Accès à ${req.method} ${req.originalUrl}`,
          ip_address: req.ip,
          user_agent: req.headers["user-agent"]
        };

        const searchSql = `
          SELECT id_logs FROM logs
          WHERE id_user = ? AND endpoint = ? AND methode = ? AND statut = ?
            AND ip_address = ? AND user_agent = ?
            AND date_activite >= NOW() - INTERVAL 10 MINUTE
          ORDER BY date_activite DESC
          LIMIT 1
        `;

        const values = [
          log.id_user,
          log.endpoint,
          log.methode,
          log.statut,
          log.ip_address,
          log.user_agent
        ];

        client.query(searchSql, values, (err, results) => {
          if (err) {
            console.error("Erreur lors de la recherche de log :", err);
            client.release();
            return;
          }

          if (results.length > 0) {
            const updateSql = `
              UPDATE logs
              SET occurences = occurences + 1, date_activite = NOW()
              WHERE id_logs = ?
            `;
            client.query(updateSql, [results[0].id_logs], (err) => {
              if (err) console.error("Erreur lors de la mise à jour du log :", err);
              client.release();
            });
          } else {
            const insertSql = `
              INSERT INTO logs (id_user, endpoint, methode, statut, activite, ip_address, user_agent)
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            client.query(
              insertSql,
              [
                log.id_user,
                log.endpoint,
                log.methode,
                log.statut,
                log.activite,
                log.ip_address,
                log.user_agent
              ],
              (err) => {
                if (err) console.error("Erreur lors de l'insertion du log :", err);
                client.release();
              }
            );
          }
        });
      });

      // On envoie la réponse UNE SEULE FOIS
      return originalSend.apply(res, arguments);
    };

    next();
  };
}

