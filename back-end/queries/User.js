// inserer un utilisateur
export function Insert_user(
  client,
  { nom, prenom, email, role = "user", password, secretkey},
  callback
) {
  const query =
    "INSERT INTO `users` (nom, prenom, email, role, mdp, secretkey) VALUES (?, ?, ?, ?, ?, ?)";
  client.query(
    query,
    [nom, prenom, email, role, password, secretkey],
    (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, results);
    }
  );
}

// affiche l'utilisateur avec l'email correspondant
export function GetUserByEmail(client, email, callback) {
  const query = "SELECT * FROM users WHERE email = ?";
  client.query(query, [email], (err, results) => {
    if (err) {
      return callback(err, null);
    }

    if (results.length > 0) {
      return callback(null, { exists: true, results });
    }

    callback(null, { exists: false, results });
  });
}

// Récupérer un utilisateur par id
export function GetUserById(client, id_user, callback) {
  const query =
    "SELECT id_user, nom, prenom, email, role, secretkey FROM users WHERE id_user = ?";
  client.query(query, [id_user], (err, results) => {
    if (err) return callback(err, null);
    if (results.length > 0) return callback(null, { exists: true, results });
    callback(null, { exists: false, results });
  });
}

// Mettre à jour le téléphone d'un utilisateur (à modifier)
export function Update_user_phone(client, id_user, telephone, callback) {
  const query = `
    UPDATE informations_facturation SET
    telephone = COALESCE(?, telephone)
    WHERE id_user = ?
  `;
  client.query(query, [telephone, id_user], callback);
}

// Mettre à jour un utilisateur (coté admin)
export function Update_user_info(client, id_user, { nom, prenom, role, email }, callback) {
  const query = `
    UPDATE users SET
    nom = COALESCE(?, nom),
    prenom = COALESCE(?, prenom),
    role = COALESCE(?, role),
    email = COALESCE(?, email)
    WHERE id_user = ?
  `;
  client.query(query, [nom, prenom, role, email, id_user], (err, results) => {
    if (err) return callback(err, null);
    callback(null, results);
  });
}

// Supprimer un utilisateur par id (coté admin)
export function Delete_user(client, id_user, callback) {
  const query = "DELETE FROM users WHERE id_user = ?";
  client.query(query, [id_user], (err, results) => {
    if (err) return callback(err, null);
    callback(null, results);
  });
}

// Récupérer la liste de tous les utilisateurs (sans mdp et secretkey pour sécurité)
export function GetAllUsers(client, callback) {
  const query = "SELECT id_user, nom, prenom, email, role FROM users";
  client.query(query, (err, results) => {
    if (err) return callback(err, null);
    callback(null, results);
  });
}

// afficher les information personnel de l'utilisateur sans information de facturation
export function GetPersonalUserInfo(client, id_user, callback) {
const query = `
    SELECT nom, prenom, email
    FROM users
    WHERE id_user = ?
  `;
  client.query(query, [id_user], (err, results) => {
    if (err) return callback(err, null);
    callback(null, results[0] || null);
  });
}