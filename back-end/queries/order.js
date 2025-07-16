// export function Insert_order(client, {
//   id_user,
//   montant_total,
//   montant_reduction = 0.00,
//   id_promotion = null,
//   statut = 'en attente' // Valeur de secours
// }, callback) {
//   const query = `
//     INSERT INTO commandes (
//       id_user,
//       montant_total,
//       montant_reduction,
//       id_promotion,
//       statut
//     )
//     VALUES (?, ?, ?, ?, ?)
//   `;
//   client.query(
//     query,
//     [id_user, montant_total, montant_reduction, id_promotion, statut],
//     callback
//   );
// }

import crypto from 'crypto';

export function Insert_order(client, {
  id_user,
  montant_total,
  montant_reduction = 0.00,
  id_promotion = null,
  statut = 'en attente',
  email_snapshot = null,
  nom_snapshot = null,
  adresse_snapshot = null,
  ville_snapshot = null,
  code_postal_snapshot = null,
  pays_snapshot = null,
  telephone_snapshot = null,
  complement_adresse_snapshot = null,
  region_snapshot = null,
  nom_entreprise_snapshot = null,
  numero_tva_snapshot = null
}, callback) {
  const facture_token = crypto.randomBytes(16).toString('hex');
  const query = `
    INSERT INTO commandes (
      id_user,
      statut,
      montant_total,
      id_promotion,
      montant_reduction,
      email_snapshot,
      nom_snapshot,
      facture_token,
      adresse_snapshot,
      ville_snapshot,
      code_postal_snapshot,
      pays_snapshot,
      telephone_snapshot,
      complement_adresse_snapshot,
      region_snapshot,
      nom_entreprise_snapshot,
      numero_tva_snapshot
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  client.query(
    query,
    [
      id_user,
      statut,
      montant_total,
      id_promotion,
      montant_reduction,
      email_snapshot,
      nom_snapshot,
      facture_token,
      adresse_snapshot,
      ville_snapshot,
      code_postal_snapshot,
      pays_snapshot,
      telephone_snapshot,
      complement_adresse_snapshot,
      region_snapshot,
      nom_entreprise_snapshot,
      numero_tva_snapshot
    ],
    (err, result) => {
      if (err) return callback(err);
      result.facture_token = facture_token;
      callback(null, result);
    }
  );
}

// Ajouter les détails de la commande
export function Insert_order_detail(client, { id_commande, id_produit, prix_unitaire }, callback) {
  const query = `
    INSERT INTO details_commandes (id_commande, id_produit, prix_unitaire)
    VALUES (?, ?, ?)
  `;
  client.query(query, [id_commande, id_produit, prix_unitaire], callback);
}

// Récupérer les commandes d'un utilisateur
export function Get_user_orders(client, id_user, callback) {
  const query = `
    SELECT * FROM commandes
    WHERE id_user = ?
    ORDER BY date_commande DESC
  `;
  client.query(query, [id_user], callback);
}

//Récuperer toutes les commandes
export function Get_all_orders(client, callback) {
  const query = `
    SELECT c.*, u.nom, u.prenom
    FROM commandes c
    JOIN users u ON c.id_user = u.id_user
    ORDER BY c.date_commande DESC
  `;
  client.query(query, callback);
}

// Mettre à jour le statut d'une commande
export function Update_order_status(client, id_commande, prix , statut, callback) {
  const query = `
    UPDATE commandes
    SET statut = COALESCE(?, statut), montant_total = COALESCE(?, montant_total),  date_modification = NOW()
    WHERE id_commande = ?
  `;
  client.query(query, [statut,prix, id_commande], callback);
}

// Récupérer les détails d'une commande
export function Get_order_details(client, id_commande, callback) {
  const query = `
    SELECT 
      d.id_produit,
      p.titre,
      p.description,
      p.image,
      d.prix_unitaire,
    FROM details_commandes d
    JOIN produits p ON d.id_produit = p.id_produit
    WHERE d.id_commande = ?
  `;
  client.query(query, [id_commande], callback);
}

// Supprimer les détails d'une commande (utile en cas d'annulation)
export function Delete_order_details(client, id_commande, callback) {
  const query = `
    DELETE FROM details_commandes
    WHERE id_commande = ?
  `;
  client.query(query, [id_commande], callback);
}


export function get_user_order_history(client, id_user, filter_date = 'all', annee_val = null, callback) {
  let query = `
    SELECT 
      c.id_commande,
      c.date_commande,
      c.statut,
      c.montant_total,
      p.id_produit,
      p.titre,
      p.description,
      pay.date_transaction
    FROM commandes c
    JOIN details_commandes dc ON c.id_commande = dc.id_commande
    JOIN produits p ON dc.id_produit = p.id_produit
    LEFT JOIN paiements pay ON c.id_commande = pay.id_commande
    WHERE c.id_user = ?
  `;

  const values = [id_user];

  switch (filter_date) {
    case '7days':
      query += ' AND c.date_commande >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
      break;
    case '1month':
      query += ' AND c.date_commande >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH) AND c.date_commande < DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
      break;
    case '6months':
      query += ' AND c.date_commande >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) AND c.date_commande < DATE_SUB(CURDATE(), INTERVAL 1 MONTH)';
      break;
    case 'year':
      query += ' AND YEAR(c.date_commande) = ?';
      values.push(annee_val || new Date().getFullYear());
      break;
    case 'all':
    default:
      break;
  }

  query += ' ORDER BY c.date_commande DESC';

  client.query(query, values, callback);
}
