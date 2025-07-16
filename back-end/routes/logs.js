// import express from "express";
// import { getConnection } from "../queries/connect.js";
// import { Get_logs } from "../queries/logs.js";

// const router = express.Router();

// router.get("/", (req, res) => {
//   const connection = getConnection();
//   const {
//     page = 1,
//     limit = 50, // limite le nb de résultat du backends à 50
//     sortBy = "date_activite",
//     order = "DESC",
//     id_user,
//     endpoint,
//     methode,
//     statut,
//     activite,
//     utilisateur,
//     ip_address
//   } = req.query;

//   const filters = { id_user, endpoint, methode, statut, activite, utilisateur,ip_address };

//   Get_logs(
//     connection,
//     { page, limit, sortBy, order, filters },
//     (err, results) => {
//       connection.end();
//       if (err) {
//         console.error("Erreur lors de la récupération des logs :", err);
//         return res.status(500).json({ error: "Erreur serveur" });
//       }
//       res.json(results);
//     }
//   );
// });

// router.get("/users", (req, res) => {
//   const client = getConnection();
//   client.query(
//     "SELECT id_user, nom, prenom, role FROM users",
//     (err, results) => {
//       client.end();
//       if (err) return res.status(500).json({ error: "Erreur serveur" });
//       res.json(results);
//     }
//   );
// });

// export default router;

import express from "express";
import { getConnection } from "../queries/connect.js";
import { Get_logs } from "../queries/logs.js";
import { logActivity } from '../middlewares/logActivity.js';
import { authenticateToken } from "../middlewares/authenticateToken.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { updateLastActivity } from '../middlewares/updateLastActivity.js';



const router = express.Router();

router.use(updateLastActivity);
router.use(authenticateToken);
router.use(isAdmin);


router.get("/",
  (req, res) => {
  getConnection((err, client) => {
    if (err) {
      return res.status(500).json({ error: "Erreur de connexion à la base de données" });
    }
    const {
      page = 1,
      limit = 50,
      sortBy = "date_activite",
      order = "DESC",
      id_user,
      endpoint,
      methode,
      statut,
      activite,
      utilisateur,
      ip_address
    } = req.query;

    const filters = { id_user, endpoint, methode, statut, activite, utilisateur, ip_address };

    Get_logs(
      client,
      { page, limit, sortBy, order, filters },
      (err, results) => {
        client.release();
        if (err) {
          console.error("Erreur lors de la récupération des logs :", err);
          return res.status(500).json({ error: "Erreur serveur" });
        }
        res.json(results);
      }
    );
  });
});

router.get("/users",
  (req, res) => {
  getConnection((err, client) => {
    if (err) {
      return res.status(500).json({ error: "Erreur de connexion à la base de données" });
    }
    client.query(
      "SELECT id_user, nom, prenom, role FROM users",
      (err, results) => {
        client.release();
        if (err) return res.status(500).json({ error: "Erreur serveur" });
        res.json(results);
      }
    );
  });
});

export default router;