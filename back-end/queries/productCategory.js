// Ajouter plusieurs catégories à un produit
export function Add_product_categories(client, id_produit, categories, callback) {
  const values = categories.map(id_categorie => [id_produit, id_categorie]);
  const sql = "INSERT INTO produit_categorie (id_produit, id_categorie) VALUES ?";
  client.query(sql, [values], callback);
}

// Récupérer les catégories d’un produit
export function Get_product_categories(client, id_produit, callback) {
  const sql = `
    SELECT c.id_categorie, c.nom_categorie
    FROM categories c
    INNER JOIN produit_categorie pc ON c.id_categorie = pc.id_categorie
    WHERE pc.id_produit = ?
  `;
  client.query(sql, [id_produit], callback);
}

// Récupérer les produits d’une catégorie
export function Get_category_products(client, id_categorie, callback) {
  const sql = `
    SELECT p.id_produit, p.titre, p.description, p.prix
    FROM produits p
    INNER JOIN produit_categorie pc ON p.id_produit = pc.id_produit
    WHERE pc.id_categorie = ?
  `;
  client.query(sql, [id_categorie], callback);
}

// Supprimer une association produit-catégorie
export function Delete_product_category(client, id_produit, id_categorie, callback) {
  const sql = `
    DELETE FROM produit_categorie 
    WHERE id_produit = ? AND id_categorie = ?
  `;
  client.query(sql, [id_produit, id_categorie], callback);
}

// Remplacer une catégorie d’un produit par une autre
export function Replace_product_category(client, id_produit, ancienne_id, nouvelle_id, callback) {
  const sql = `
    UPDATE produit_categorie 
    SET id_categorie = ?
    WHERE id_produit = ? AND id_categorie = ?
  `;
  client.query(sql, [nouvelle_id, id_produit, ancienne_id], callback);
}
