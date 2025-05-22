export function Insert_product(client, data, callback) {
  const { titre, description, prix, stock, image_url } = data;
  const sql = "INSERT INTO produits (titre, description, prix, stock, image_url) VALUES (?, ?, ?, ?, ?)";
  client.query(sql, [titre, description, prix, stock, image_url], callback);
}

export function Add_product_categories(client, id_produit, categories, callback) {
  if (categories.length === 0) return callback(null); // rien à ajouter

  const values = categories.map((cat) => [id_produit, cat]);
  const sql = "INSERT INTO produit_categorie (id_produit, id_categorie) VALUES ?";
  client.query(sql, [values], callback);
}

export function Get_all_products(client, callback) {
  const sql = "SELECT * FROM produits";
  client.query(sql, callback);
}

export function Get_categories_of_product(client, id_produit, callback) {
  const sql = `
    SELECT c.* FROM categories c
    INNER JOIN produit_categorie pc ON c.id_categorie = pc.id_categorie
    WHERE pc.id_produit = ?
  `;
  client.query(sql, [id_produit], callback);
}

export function Get_products_of_category(client, id_categorie, callback) {
  const sql = `
    SELECT p.* FROM produits p
    INNER JOIN produit_categorie pc ON p.id_produit = pc.id_produit
    WHERE pc.id_categorie = ?
  `;
  client.query(sql, [id_categorie], callback);
}

export function Update_product(client, data, callback) {
  const { id_produit, titre, description, prix } = data;

  const query = `
    UPDATE produits SET
      titre = COALESCE(?, titre),
      description = COALESCE(?, description),
      prix = COALESCE(?, prix),
      date_modification = NOW()
    WHERE id_produit = ?
  `;

  const values = [titre, description, prix, id_produit];

  client.query(query, values, callback);
}

export function Delete_product(client, id_produit, callback) {
  const sql = "DELETE FROM produits WHERE id_produit = ?";
  client.query(sql, [id_produit], callback);
}

export function Remove_product_category_association(client, id_produit, id_categorie, callback) {
  const sql = "DELETE FROM produits_categorie WHERE id_produit = ? AND id_categorie = ?";
  client.query(sql, [id_produit, id_categorie], callback);
}

export function Get_one_product(client, id_produit, callback) {
  const sql = "SELECT * FROM produits WHERE id_produit = ?";
  client.query(sql, [id_produit], (err, results) => {
    if (err) return callback(err);
    if (results.length === 0) return callback(null, null); // Aucun produit trouvé
    callback(null, results[0]);
  });
}
