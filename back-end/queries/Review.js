// Ajouter un avis
export function Insert_review(client, { id_user, id_produit, note, commentaire }, callback) {
  const query = "INSERT INTO avis (id_user, id_produit, note, commentaire) VALUES (?, ?, ?, ?)";
  client.query(query, [id_user, id_produit, note, commentaire], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results);
  });
}

// Récupérer les avis pour un produit
export function Get_reviews_by_product(client, id_produit, callback) {
  const query = "SELECT avis.*, users.prenom FROM avis JOIN users ON avis.id_user = users.id_user WHERE id_produit = ? ORDER BY date_creation DESC";
  client.query(query, [id_produit], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results);
  });
}

// Modifier un avis
export function Update_review(client, { id_avis, note, commentaire }, callback) {
  const query = "UPDATE avis SET note = ?, commentaire = ? WHERE id_avis = ?";
  client.query(query, [note, commentaire, id_avis], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results);
  });
}

// Supprimer un avis
export function Delete_review(client, id_avis, callback) {
  const query = "DELETE FROM avis WHERE id_avis = ?";
  client.query(query, [id_avis], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results);
  });
}


export function Get_review_author(client, id_avis, callback) {
  const query = "SELECT id_user FROM avis WHERE id_avis = ?";
  client.query(query, [id_avis], callback);
}
