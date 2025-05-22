export function Insert_order(client, {
  id_user,
  montant_total,
  montant_reduction = 0.00,
  id_promotion = null,
  statut = 'en attente' // Valeur de secours
}, callback) {
  const query = `
    INSERT INTO commandes (
      id_user,
      montant_total,
      montant_reduction,
      id_promotion,
      statut
    )
    VALUES (?, ?, ?, ?, ?)
  `;
  client.query(
    query,
    [id_user, montant_total, montant_reduction, id_promotion, statut],
    callback
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

// Mettre à jour le statut d'une commande
export function Update_order_status(client, id_commande, statut, callback) {
  const query = `
    UPDATE commandes
    SET statut = COALESCE(?, statut), date_modification = NOW()
    WHERE id_commande = ?
  `;
  client.query(query, [statut, id_commande], callback);
}

// Récupérer les détails d'une commande
export function Get_order_details(client, id_commande, callback) {
  const query = `
    SELECT 
      d.id_produit,
      p.titre,
      p.description,
      p.image_url,
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
