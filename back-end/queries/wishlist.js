// Ajouter un produit à la wishlist
export function Add_to_wishlist(client, { id_user, id_produit }, callback) {
  const query = `
    INSERT IGNORE INTO wishlist (id_user, id_produit)
    VALUES (?, ?)
  `;
  client.query(query, [id_user, id_produit], callback);
}

// Supprimer un produit de la wishlist
export function Remove_from_wishlist(client, { id_user, id_produit }, callback) {
  const query = `
    DELETE FROM wishlist
    WHERE id_user = ? AND id_produit = ?
  `;
  client.query(query, [id_user, id_produit], callback);
}

// Vider complètement la wishlist d’un utilisateur
export function Clear_wishlist(client, id_user, callback) {
  const query = `
    DELETE FROM wishlist
    WHERE id_user = ?
  `;
  client.query(query, [id_user], callback);
}

// Récupérer la wishlist d'un utilisateur
export function Get_user_wishlist(client, id_user, callback) {
  const query = `
    SELECT 
      w.id_produit,
      p.titre,
      p.image,
      p.prix,
      w.date_ajout,
      p.stock
    FROM wishlist w
    JOIN produits p ON w.id_produit = p.id_produit
    WHERE w.id_user = ?
    ORDER BY w.date_ajout DESC
  `;
  client.query(query, [id_user], callback);
}

