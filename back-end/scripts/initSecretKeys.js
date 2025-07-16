import speakeasy from "speakeasy";
import { encrypt } from "../utils/crypt.js";
import { getConnection } from "../queries/connect.js";

// Utilisation du pool avec callback
getConnection((err, db) => {
  if (err) {
    console.error("Erreur lors de la connexion à la base de données :", err);
    return;
  }

  db.query("SELECT id_user FROM users WHERE secretkey IS NULL", (err, users) => {
    if (err) {
      console.error("Erreur lors de la récupération des utilisateurs :", err);
      db.release();
      return;
    }

    let pending = users.length;
    if (pending === 0) {
      db.release();
      return;
    }

    users.forEach((user) => {
      const secret = speakeasy.generateSecret({ length: 20 }).base32;
      const encrypted = encrypt(secret);

      db.query(
        "UPDATE users SET secretkey = ? WHERE id_user = ?",
        [encrypted, user.id_user],
        (err) => {
          if (err) {
            console.error(`Erreur lors de la mise à jour de l'utilisateur ${user.id_user} :`, err);
          } else {
            console.log(`Clé secrète générée et enregistrée pour l'utilisateur ${user.id_user}`);
          }
          pending--;
          if (pending === 0) db.release();
        }
      );
    });
  });
});