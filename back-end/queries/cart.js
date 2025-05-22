// Ajouter un produit au panier (ignorer si produit déjà présent)
export function Add_to_cart(client, { id_user, id_produit }, callback) {
  const query = `
    INSERT IGNORE INTO panier (id_user, id_produit)
    VALUES (?, ?)
  `;
  client.query(query, [id_user, id_produit], callback);
}

// Obtenir les produits dans le panier d'un utilisateur
export function Get_cart(client, id_user, callback) {
  const query = `
    SELECT 
      p.id_produit,
      prod.titre,
      prod.prix,
      prod.image_url,
      p.date_ajout
    FROM panier p
    JOIN produits prod ON p.id_produit = prod.id_produit
    WHERE p.id_user = ?
    ORDER BY p.date_ajout DESC
  `;
  client.query(query, [id_user], callback);
}

// Supprimer un produit du panier
export function Remove_from_cart(client, { id_user, id_produit }, callback) {
  const query = `DELETE FROM panier WHERE id_user = ? AND id_produit = ?`;
  client.query(query, [id_user, id_produit], callback);
}

// Vide complètement le panier
export function Clear_cart(client, id_user, callback) {
  const query = `DELETE FROM panier WHERE id_user = ?`;
  client.query(query, [id_user], callback);
}

// Ajouter tous les produits de notre wishlist au panier
export function Add_all_to_cart(client, { id_user }, callback) {
  const query = `
    INSERT IGNORE INTO panier (id_user, id_produit)
    SELECT ?, id_produit FROM wishlist WHERE id_user = ?
  `;
  client.query(query, [id_user, id_user], callback);
}