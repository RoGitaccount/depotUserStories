// Ajouter un produit
export function Insert_product(client, { titre, description, prix, stock, image_url, id_categorie }, callback) {
  const query = "INSERT INTO produits (titre, description, prix, stock, image_url, id_categorie) VALUES (?, ?, ?, ?, ?, ?)";
  client.query(query, [titre, description, prix, stock, image_url, id_categorie], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results);
  });
}

// Récupérer tous les produits
export function Get_all_products(client, callback) {
  const query = "SELECT * FROM produits";
  client.query(query, (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results);
  });
}

// Modifier un produit
export function Update_product(client, { id_produit, titre, description, prix, stock, image_url, id_categorie }, callback) {
  const query = "UPDATE produits SET titre = ?, description = ?, prix = ?, stock = ?, image_url = ?, id_categorie = ? WHERE id_produit = ?";
  client.query(query, [titre, description, prix, stock, image_url, id_categorie, id_produit], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results);
  });
}

// Supprimer un produit
export function Delete_product(client, id_produit, callback) {
  const query = "DELETE FROM produits WHERE id_produit = ?";
  client.query(query, [id_produit], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results);
  });
}